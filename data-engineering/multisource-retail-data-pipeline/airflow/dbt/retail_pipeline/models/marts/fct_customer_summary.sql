-- One row per customer: lifetime order count, lifetime spend, and a
-- within-country spend rank. The rank here is intentionally computed
-- fresh in dbt (not just carried over from the PySpark output) — it's
-- scoped by country rather than global, which is a different business
-- question than the PySpark-level "overall spend rank" was answering.

with orders as (
    select * from {{ ref('stg_order_facts') }}
),

customer_agg as (
    select
        customer_id,
        country,
        segment,
        count(distinct order_id)          as lifetime_order_count,
        max(running_customer_spend)       as lifetime_spend,
        min(order_date)                   as first_order_date,
        max(order_date)                   as last_order_date
    from orders
    group by 1, 2, 3
)

select
    customer_id,
    country,
    segment,
    lifetime_order_count,
    lifetime_spend,
    first_order_date,
    last_order_date,
    datediff('day', first_order_date, last_order_date) as customer_lifespan_days,
    rank() over (
        partition by country order by lifetime_spend desc
    ) as spend_rank_in_country
from customer_agg
