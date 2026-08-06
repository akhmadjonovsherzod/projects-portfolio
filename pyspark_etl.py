from pyspark.sql import SparkSession, Window
from pyspark.sql import functions as F

RAW_DIR = "raw_data"
OUT_DIR = "processed_data"

spark = (
    SparkSession.builder.appName("retail-order-facts")
    .config("spark.sql.shuffle.partitions", "16")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("WARN")

print("Reading raw sources...")
customers = spark.read.csv(f"{RAW_DIR}/customers.csv", header=True, inferSchema=True)
products = spark.read.csv(f"{RAW_DIR}/products.csv", header=True, inferSchema=True)
orders = spark.read.json(f"{RAW_DIR}/orders.json")
order_items = spark.read.csv(f"{RAW_DIR}/order_items.csv", header=True, inferSchema=True)

print(f"  customers:   {customers.count():,} rows")
print(f"  products:    {products.count():,} rows")
print(f"  orders:      {orders.count():,} rows")
print(f"  order_items: {order_items.count():,} rows")

orders_completed = orders.filter(F.col("status") == "completed")

fact = (
    order_items.join(orders_completed, on="order_id", how="inner")
    .join(products.select("product_id", "category", "subcategory", "brand"), on="product_id", how="left")
    .join(customers.select("customer_id", "country", "segment"), on="customer_id", how="left")
    .withColumn(
        "net_line_total",
        F.round(F.col("quantity") * F.col("unit_price") * (1 - F.col("discount_pct")), 2),
    )
    .withColumn("order_date", F.to_timestamp("order_date"))
    .withColumn("order_year_month", F.date_format("order_date", "yyyy-MM"))
)

order_level = fact.groupBy(
    "order_id", "customer_id", "order_date", "order_year_month", "channel", "country", "segment"
).agg(F.sum("net_line_total").alias("order_net_total"))

print("Computing window-function metrics...")
customer_time_window = Window.partitionBy("customer_id").orderBy("order_date")
spend_rank_window = Window.orderBy(F.desc("order_net_total"))

order_facts = (
    order_level.withColumn(
        "running_customer_spend",
        F.round(F.sum("order_net_total").over(customer_time_window), 2),
    )
    .withColumn(
        "customer_order_rank",
        F.dense_rank().over(Window.partitionBy("customer_id").orderBy(F.desc("order_net_total"))),
    )
    .withColumn("spend_rank_overall", F.dense_rank().over(spend_rank_window))
    .withColumn(
        "prev_order_date",
        F.lag("order_date").over(customer_time_window),
    )
    .withColumn(
        "prev_order_gap_days",
        F.datediff(F.col("order_date"), F.col("prev_order_date")),
    )
    .drop("prev_order_date")
)

print("Sample output:")
order_facts.orderBy(F.desc("order_net_total")).show(5, truncate=False)

print(f"Writing partitioned Parquet to {OUT_DIR}/order_facts/ ...")
(
    order_facts.write.mode("overwrite")
    .partitionBy("order_year_month")
    .parquet(f"{OUT_DIR}/order_facts")
)

n_partitions = order_facts.select("order_year_month").distinct().count()
print(f"Done. {order_facts.count():,} order-level rows across {n_partitions} monthly partitions.")

spark.stop()
