CREATE OR REPLACE TABLE RETAIL_PIPELINE.RAW.order_facts AS
SELECT
  $1:order_id::NUMBER AS order_id,
  $1:customer_id::NUMBER AS customer_id,
  $1:order_date::TIMESTAMP AS order_date,
  $1:order_year_month::STRING AS order_year_month,
  $1:channel::STRING AS channel,
  $1:country::STRING AS country,
  $1:segment::STRING AS segment,
  $1:order_net_total::FLOAT AS order_net_total,
  $1:running_customer_spend::FLOAT AS running_customer_spend,
  $1:customer_order_rank::NUMBER AS customer_order_rank,
  $1:spend_rank_overall::NUMBER AS spend_rank_overall,
  $1:prev_order_gap_days::NUMBER AS prev_order_gap_days
FROM @RETAIL_PIPELINE.RAW.order_facts_stage
  (PATTERN => '.*\.parquet');

SELECT COUNT(*) FROM RETAIL_PIPELINE.RAW.order_facts;