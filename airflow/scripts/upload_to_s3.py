"""
Upload the PySpark output (partitioned Parquet) to S3.

Preserves the Hive-style partition folder structure
(order_year_month=YYYY-MM/...) so this S3 prefix can be pointed at
directly by Snowflake's COPY INTO or an external stage later --
no reshaping needed between this step and the next.

Requires AWS credentials to already be configured locally, e.g. via:
    aws configure
or environment variables:
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION
boto3 picks these up automatically -- no keys are hardcoded here on purpose.
"""

import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

BUCKET_NAME = "CHANGE-ME-your-unique-bucket-name"  # S3 bucket names are globally unique
LOCAL_ROOT = Path("processed_data/order_facts")
S3_PREFIX = "order_facts"

s3 = boto3.client("s3")


def bucket_exists(bucket: str) -> bool:
    try:
        s3.head_bucket(Bucket=bucket)
        return True
    except ClientError:
        return False


def main():
    if BUCKET_NAME.startswith("CHANGE-ME"):
        print("Set BUCKET_NAME to your actual bucket name before running.")
        sys.exit(1)

    if not LOCAL_ROOT.exists():
        print(f"{LOCAL_ROOT} not found -- run pyspark_etl.py first.")
        sys.exit(1)

    try:
        if not bucket_exists(BUCKET_NAME):
            print(f"Bucket '{BUCKET_NAME}' not found or not accessible.")
            sys.exit(1)
    except NoCredentialsError:
        print("No AWS credentials found. Run 'aws configure' first.")
        sys.exit(1)

    files = [p for p in LOCAL_ROOT.rglob("*") if p.is_file() and not p.name.endswith(".crc")]
    print(f"Uploading {len(files)} files to s3://{BUCKET_NAME}/{S3_PREFIX}/ ...")

    uploaded_bytes = 0
    for i, path in enumerate(files, 1):
        rel_path = path.relative_to(LOCAL_ROOT)
        s3_key = f"{S3_PREFIX}/{rel_path.as_posix()}"
        s3.upload_file(str(path), BUCKET_NAME, s3_key)
        uploaded_bytes += path.stat().st_size
        print(f"  [{i}/{len(files)}] {s3_key}")

    print(f"\nDone. {len(files)} files, {uploaded_bytes / 1e6:.1f} MB uploaded to "
          f"s3://{BUCKET_NAME}/{S3_PREFIX}/")


if __name__ == "__main__":
    main()
