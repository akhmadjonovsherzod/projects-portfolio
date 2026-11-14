-- Aggregates order-level facts into a monthly reporting grain, split by
-- channel and country. This is genuinely new work relative to the PySpark
-- output (which is order-grain) — this is the kind of rollup a BI tool or
-- dashboard would query directly.

with orders as (
    select * from {{ ref('stg_order_facts') }}
)

select
    order_year_month,
    channel,
    country,
    count(distinct order_id)                as order_count,
    count(distinct customer_id)             as distinct_customers,
    round(sum(order_net_total), 2)          as total_net_revenue,
    round(avg(order_net_total), 2)          as avg_order_value,
    round(
        sum(order_net_total) / nullif(count(distinct customer_id), 0), 2
    )                                        as revenue_per_customer
from orders
group by 1, 2, 3
order by order_year_month, channel, country
