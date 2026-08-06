# Multi-Source Retail Data Pipeline

A PySpark ETL pipeline that ingests retail order data from three different
source formats, computes customer-level analytics with SQL window
functions, and lands the output in AWS S3 for downstream warehousing.

Built as a hands-on project to work with distributed data processing,
cloud storage, and (in progress) a modern ELT stack on top of it.

## Status

| Stage | Status |
|---|---|
| Synthetic multi-source data generation | ✅ Done |
| PySpark ETL (join, window functions, partitioned Parquet) | ✅ Done |
| AWS S3 landing zone with least-privilege IAM | ✅ Done |
| Snowflake + dbt transformation layer | 🔧 In progress |
| Airflow orchestration | 📋 Planned |

## Architecture

```
customers.csv ─┐
products.csv ──┼──▶ PySpark ETL ──▶ processed_data/order_facts/  ──▶  S3
orders.json ────┤     (join,           (partitioned Parquet)         (raw/order_facts/)
order_items.csv ┘   window fns)                                          │
                                                                           ▼
                                                              Snowflake external stage
                                                                           │
                                                                           ▼
                                                                    dbt staging + marts
                                                                           │
                                                                           ▼
                                                                   Airflow (scheduled)
```

## Why this project

Deliberately structured to mirror how a real ingestion pipeline looks:
three different source *shapes* (CSV table dumps, a JSON API-style export,
and a large CSV file drop) rather than one clean input file, and a
distributed processing step that's actually justified by data volume
(1.5M+ order line items) rather than decorative.

## Tech Stack

Python, PySpark, SQL (joins, aggregations, window functions), AWS S3,
IAM, dbt, Snowflake, Airflow *(in progress — see Status above)*

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
  Spark's own write engine (not a Python Parquet library) — this matters
  in practice, since it avoided several Windows-specific library issues
  encountered locally during development.

### 3. AWS S3 landing (`upload_to_s3.py`)

Uploads the partitioned Parquet output to S3, preserving the same
`order_year_month=YYYY-MM/` folder structure so it can be read directly
by a Snowflake external stage without reshaping.

Access is via a dedicated IAM user scoped to a single bucket
(`s3:GetObject`, `s3:PutObject`, `s3:ListBucket` only) rather than
broad or root credentials.

### 4. Snowflake + dbt *(in progress)*

Raw Parquet is staged into Snowflake and transformed through a dbt
staging + marts layer with SQL-level tests. Setup in progress, including
an S3 storage integration via IAM role trust (rather than embedded
credentials) where possible.

### 5. Airflow orchestration *(planned)*

A DAG chaining extract → PySpark transform → S3 upload → Snowflake load →
dbt run, scheduled to run on a regular cadence.

## Project Structure

```
.
├── generate_data.py       # synthetic data generator
├── pyspark_etl.py         # PySpark transformation job
├── upload_to_s3.py        # S3 upload script
├── raw_data/               # generated source files (gitignored)
├── processed_data/         # PySpark output (gitignored)
├── dbt/                    # dbt project (in progress)
└── README.md
```

## Running it locally

```bash
pip install pandas numpy faker boto3 pyspark

python generate_data.py       # generates raw_data/
python pyspark_etl.py         # generates processed_data/order_facts/
python upload_to_s3.py        # uploads to S3 (requires `aws configure` first)
```

Requires a local Java installation (PySpark runs on the JVM). On Windows,
also requires `winutils.exe`/`hadoop.dll` on PATH for local Parquet writes
— see [cdarlint/winutils](https://github.com/cdarlint/winutils) if you
hit a `HADOOP_HOME` or `UnsatisfiedLinkError` error.
