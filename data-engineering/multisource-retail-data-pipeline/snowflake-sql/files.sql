CREATE OR REPLACE STAGE RETAIL_PIPELINE.RAW.order_facts_stage
  URL = 's3://bucket'
  CREDENTIALS = (AWS_KEY_ID = 'accesskey' AWS_SECRET_KEY = 'secretkey')
  FILE_FORMAT = (TYPE = PARQUET);

LIST @RETAIL_PIPELINE.RAW.order_facts_stage;