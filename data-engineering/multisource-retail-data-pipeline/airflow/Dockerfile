FROM apache/airflow:2.9.3-python3.11

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

USER airflow
ENV PATH="/home/airflow/.local/bin:${PATH}"

RUN pip install --no-cache-dir apache-airflow-providers-snowflake \
    --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.9.3/constraints-3.11.txt"

RUN pip install --no-cache-dir pyspark boto3 dbt-core dbt-snowflake pandas numpy faker pyarrow