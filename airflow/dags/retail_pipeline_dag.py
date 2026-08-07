from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    "owner": "sherzodbek",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="retail_pipeline",
    description="Multi-source retail ETL: PySpark -> S3 -> Snowflake -> dbt",
    default_args=default_args,
    schedule="@daily",
    start_date=datetime(2026, 8, 1),
    catchup=False,
    tags=["retail", "pyspark", "snowflake", "dbt"],
) as dag:

    generate_data = BashOperator(
        task_id="generate_data",
        bash_command="cd /opt/airflow/scripts && python generate_data.py",
    )

    pyspark_etl = BashOperator(
        task_id="pyspark_etl",
        bash_command="cd /opt/airflow/scripts && python pyspark_etl.py",
    )

    upload_to_s3 = BashOperator(
        task_id="upload_to_s3",
        bash_command="cd /opt/airflow/scripts && python upload_to_s3.py",
    )

    load_to_snowflake = BashOperator(
        task_id="load_to_snowflake",
        bash_command="""
        cd /opt/airflow/scripts && python -c "
import snowflake.connector
import os

con = snowflake.connector.connect(
    account=os.environ['SNOWFLAKE_ACCOUNT'],
    user=os.environ['SNOWFLAKE_USER'],
    password=os.environ['SNOWFLAKE_PASSWORD'],
    warehouse='retail_wh',
    database='retail_pipeline',
    schema='raw',
)
con.cursor().execute('''
    CREATE OR REPLACE TABLE raw.order_facts AS
    SELECT
        \\$1:order_id::NUMBER AS order_id,
        \\$1:customer_id::NUMBER AS customer_id,
        \\$1:order_date::TIMESTAMP AS order_date,
        \\$1:channel::STRING AS channel,
        \\$1:country::STRING AS country,
        \\$1:segment::STRING AS segment,
        \\$1:order_net_total::FLOAT AS order_net_total,
        \\$1:running_customer_spend::FLOAT AS running_customer_spend,
        \\$1:customer_order_rank::NUMBER AS customer_order_rank,
        \\$1:spend_rank_overall::NUMBER AS spend_rank_overall,
        \\$1:prev_order_gap_days::NUMBER AS prev_order_gap_days
    FROM @raw.order_facts_stage
''')
print('Snowflake load complete.')
con.close()
"
        """,
    )

    dbt_build = BashOperator(
        task_id="dbt_build",
        bash_command=(
            "cd /opt/airflow/dbt/retail_pipeline && "
            "dbt build --profiles-dir /opt/airflow/dbt_profiles"
        ),
    )

    generate_data >> pyspark_etl >> upload_to_s3 >> load_to_snowflake >> dbt_build
