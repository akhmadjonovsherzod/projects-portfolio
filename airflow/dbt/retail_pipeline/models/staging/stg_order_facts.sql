-- Staging: light renaming/typing only. No business logic here — that
-- belongs in the marts layer. Keeps a clean seam between "what the
-- source gave us" and "what we've decided it means."

with source as (
    select * from {{ source('raw', 'order_facts') }}
),

renamed as (
    select
        order_id,
        customer_id,
        order_date::timestamp           as order_date,
        to_char(order_date::timestamp, 'YYYY-MM') as order_year_month,
        channel,
        country,
        segment,
        order_net_total::decimal(12, 2)  as order_net_total,
        running_customer_spend::decimal(12, 2) as running_customer_spend,
        customer_order_rank,
        spend_rank_overall,
        prev_order_gap_days
    from source
)

select * from renamed
