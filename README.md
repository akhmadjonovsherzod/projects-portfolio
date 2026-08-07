# Multi-Source Retail Data Pipeline

A PySpark ETL pipeline that ingests retail order data from three different
source formats, computes customer-level analytics with SQL window
functions, lands the output in AWS S3, transforms it through Snowflake +
dbt, and orchestrates the whole thing with Airflow.

Built as a hands-on project to close a specific gap: hands-on distributed
processing, cloud storage/IAM, and a modern ELT stack, all in one
end-to-end pipeline rather than isolated exercises.

## Status

| Stage | Status |
|---|---|
| Synthetic multi-source data generation | ✅ Done |
| PySpark ETL (join, window functions, partitioned Parquet) | ✅ Done |
| AWS S3 landing zone with least-privilege IAM | ✅ Done |
| Snowflake + dbt transformation layer | ✅ Done |
| Airflow orchestration | ✅ Done |

## Architecture

```
customers.csv ─┐
products.csv ──┼──▶ PySpark ETL ──▶ processed_data/order_facts/  ──▶  S3
orders.json ────┤     (join,           (partitioned Parquet)         (raw/order_facts/)
order_items.csv ┘   window fns)                                          │
                                                                           ▼
                                                                  Snowflake raw table
                                                                           │
                                                                           ▼
                                                                    dbt staging + marts
                                                                           │
                                                                           ▼
                                                        Airflow DAG (orchestrates all of the above, @daily)
```

## Why this project

Deliberately structured to mirror how a real ingestion pipeline looks:
three different source *shapes* (CSV table dumps, a JSON API-style export,
and a large CSV file drop) rather than one clean input file, a
distributed processing step that's actually justified by data volume
(1.5M+ order line items), and a genuine orchestrated schedule rather than
a set of scripts run by hand.

## Tech Stack

Python, PySpark, SQL (joins, aggregations, window functions), AWS S3,
IAM, dbt, Snowflake, Airflow, Docker

## Pipeline Stages

### 1. Data generation (`generate_data.py`)

Generates a synthetic retail dataset at meaningful scale:

- `customers.csv` — 100,000 rows (DB-table-style source)
- `products.csv` — 5,000 rows (DB-table-style source)
- `orders.json` — 500,000 rows (paginated API-export-style source)
- `order_items.csv` — 1.5M+ rows (large file-drop-style source)

Seeded (`SEED = 42`) for reproducibility.

### 2. PySpark ETL (`pyspark_etl.py`)

Reads all four sources, joins them into a single order-level fact table,
and computes:

- `running_customer_spend` — cumulative net spend per customer over time
- `customer_order_rank` — dense rank of each order by that customer's spend
- `spend_rank_overall` — this order's spend rank across *all* customers
- `prev_order_gap_days` — days since that customer's previous order

**Design notes:**
- Only `completed` orders count toward spend metrics — cancelled/returned
  orders are filtered out before the window functions run, so they don't
  inflate a customer's running total.
- Line items are collapsed to one row per order *before* the window
  functions run — running this directly on line-item grain would double-
  or triple-count orders with multiple items.
- Output is written as Parquet, partitioned by `order_year_month`, using
  Spark's own write engine — this matters in practice, since it avoided
  several Windows-specific native-library issues hit locally during
  development (see `HADOOP_HOME`/`winutils.exe` note below).

### 3. AWS S3 landing (`upload_to_s3.py`)

Uploads the partitioned Parquet output to S3, preserving the same
`order_year_month=YYYY-MM/` folder structure. Access is via a dedicated
IAM user scoped to a single bucket (`s3:GetObject`, `s3:PutObject`,
`s3:ListBucket` only) rather than broad or root credentials.

### 4. Snowflake + dbt (`dbt/retail_pipeline/`, `snowflake-sql/`)

Raw Parquet is staged into Snowflake and loaded into `raw.order_facts`,
then transformed through a dbt staging + marts layer:

- `stg_order_facts` — light typing/renaming staging view
- `fct_monthly_channel_performance` — revenue/order-count rollup by
  month, channel, and country
- `fct_customer_summary` — one row per customer, with lifetime spend and
  an in-country spend rank (a *different* window function than the one
  computed upstream in PySpark, scoped by country rather than global)

10 schema tests across both layers (`unique`, `not_null`,
`accepted_values`). One of these tests caught a real bug during
development: `order_year_month` is a Hive partition column that Spark
strips from the physical Parquet files by design, so a naive Snowflake
load left it entirely null. Fixed by re-deriving it in dbt from
`order_date` instead of trusting the passthrough column — see the model
comments in `stg_order_facts.sql`.

**On the S3 connection:** originally built with a Snowflake storage
integration (IAM role trust, no long-lived keys) rather than embedded
credentials. Hit a reproducible `AssumeRole` failure traced to Snowflake
rotating the integration's `STORAGE_AWS_EXTERNAL_ID` value — confirmed
across three separate `DESC INTEGRATION` calls, ruled out SCPs and
permissions boundaries as causes. Made the pragmatic call to unblock with
a credentials-based external stage given time constraints; the
storage-integration SQL is preserved in `snowflake-sql/` as a record of
the approach and the diagnosis.

### 5. Airflow orchestration (`airflow/`)

A Dockerized Airflow deployment (custom image extending
`apache/airflow:2.9.3` with Java, PySpark, and dbt installed) runs a
single DAG chaining all of the above:

```
generate_data → pyspark_etl → upload_to_s3 → load_to_snowflake → dbt_build
```

Scheduled `@daily`, with retries configured (2 attempts, 5-minute delay)
on each task. Credentials are injected via environment variables
(`.env`, gitignored) and read by dbt through `env_var()` in
`profiles.yml` — never hardcoded in the DAG or image.

## Project Structure

```
.
├── generate_data.py         # synthetic data generator
├── pyspark_etl.py           # PySpark transformation job
├── upload_to_s3.py          # S3 upload script
├── requirements.txt         # for running the scripts locally, outside Docker
├── raw_data/                 # generated source files (gitignored)
├── processed_data/           # PySpark output (gitignored)
├── dbt/retail_pipeline/       # dbt project (staging + marts + tests)
├── snowflake-sql/             # Snowflake setup SQL (warehouse, stage, storage integration)
├── airflow/                   # Dockerized Airflow: DAG, Dockerfile, compose file
└── README.md
```

## Running it locally

```bash
pip install -r requirements.txt

python generate_data.py       # generates raw_data/
python pyspark_etl.py         # generates processed_data/order_facts/
python upload_to_s3.py        # uploads to S3 (requires `aws configure` first)
```

Requires a local Java installation (PySpark runs on the JVM). On Windows,
also requires `winutils.exe`/`hadoop.dll` on PATH for local Parquet writes
— see [cdarlint/winutils](https://github.com/cdarlint/winutils) if you
hit a `HADOOP_HOME` or `UnsatisfiedLinkError` error.

## Running the full orchestrated pipeline

```bash
cd airflow
cp .env.example .env    # fill in real Snowflake + AWS credentials
docker compose up airflow-init
docker compose up
```

Open `http://localhost:8080` (`admin` / `admin`), un-pause `retail_pipeline`,
and trigger a run.
