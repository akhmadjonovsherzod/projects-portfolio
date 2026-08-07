import json
import time
from pathlib import Path

import numpy as np
import pandas as pd
from faker import Faker

N_CUSTOMERS = 100_000
N_PRODUCTS = 5_000
N_ORDERS = 500_000
MAX_ITEMS_PER_ORDER = 5
SEED = 42

OUT_DIR = Path("raw_data")
OUT_DIR.mkdir(exist_ok=True)

rng = np.random.default_rng(SEED)
fake = Faker()
Faker.seed(SEED)

CATEGORIES = {
    "Electronics": ["Headphones", "Laptops", "Phones", "Accessories"],
    "Home": ["Kitchen", "Furniture", "Decor"],
    "Fashion": ["Menswear", "Womenswear", "Footwear"],
    "Sports": ["Fitness", "Outdoor", "Team Sports"],
    "Beauty": ["Skincare", "Haircare", "Fragrance"],
}
CHANNELS = ["web", "mobile", "marketplace"]
ORDER_STATUSES = ["completed", "completed", "completed", "cancelled", "returned"]
SEGMENTS = ["new", "returning", "vip"]

t0 = time.time()

print("Generating customers...")
customer_ids = np.arange(1, N_CUSTOMERS + 1)
signup_dates = pd.to_datetime("2023-01-01") + pd.to_timedelta(
    rng.integers(0, 900, size=N_CUSTOMERS), unit="D"
)
customers = pd.DataFrame(
    {
        "customer_id": customer_ids,
        "name": [fake.name() for _ in range(N_CUSTOMERS)],
        "email": [fake.unique.email() for _ in range(N_CUSTOMERS)],
        "country": rng.choice(
            ["Hungary", "Germany", "Poland", "Romania", "Austria", "Slovakia"],
            size=N_CUSTOMERS,
        ),
        "segment": rng.choice(SEGMENTS, size=N_CUSTOMERS, p=[0.5, 0.4, 0.1]),
        "signup_date": signup_dates.strftime("%Y-%m-%d"),
    }
)
customers.to_csv(OUT_DIR / "customers.csv", index=False)
print(f"  customers.csv -> {len(customers):,} rows")

print("Generating products...")
cat_choices = rng.choice(list(CATEGORIES.keys()), size=N_PRODUCTS)
subcat_choices = [rng.choice(CATEGORIES[c]) for c in cat_choices]
products = pd.DataFrame(
    {
        "product_id": np.arange(1, N_PRODUCTS + 1),
        "category": cat_choices,
        "subcategory": subcat_choices,
        "brand": rng.choice(
            ["Northline", "Verona", "Kestrel", "Amberly", "Fjordic", "Blaze"],
            size=N_PRODUCTS,
        ),
        "unit_price": np.round(rng.gamma(shape=3.0, scale=15.0, size=N_PRODUCTS) + 5, 2),
    }
)
products.to_csv(OUT_DIR / "products.csv", index=False)
print(f"  products.csv -> {len(products):,} rows")

print("Generating orders...")
order_dates = pd.to_datetime("2024-01-01") + pd.to_timedelta(
    rng.integers(0, 550, size=N_ORDERS), unit="D"
)
orders_df = pd.DataFrame(
    {
        "order_id": np.arange(1, N_ORDERS + 1),
        "customer_id": rng.integers(1, N_CUSTOMERS + 1, size=N_ORDERS),
        "order_date": order_dates.strftime("%Y-%m-%dT%H:%M:%S"),
        "channel": rng.choice(CHANNELS, size=N_ORDERS, p=[0.55, 0.35, 0.10]),
        "status": rng.choice(ORDER_STATUSES, size=N_ORDERS),
    }
)
with open(OUT_DIR / "orders.json", "w") as f:
    json.dump(orders_df.to_dict(orient="records"), f)
print(f"  orders.json -> {len(orders_df):,} rows")

# ---- order_items.parquet (large file-drop-style source) -----------------
print("Generating order_items (this is the big one)...")
items_per_order = rng.integers(1, MAX_ITEMS_PER_ORDER + 1, size=N_ORDERS)
n_items = int(items_per_order.sum())

order_id_repeated = np.repeat(orders_df["order_id"].to_numpy(), items_per_order)
product_id_col = rng.integers(1, N_PRODUCTS + 1, size=n_items)
quantity_col = rng.integers(1, 6, size=n_items)
discount_col = np.round(rng.choice([0, 0, 0, 0.05, 0.10, 0.15, 0.20], size=n_items), 2)

price_lookup = products.set_index("product_id")["unit_price"]
unit_price_col = price_lookup.loc[product_id_col].to_numpy()

order_items = pd.DataFrame(
    {
        "order_item_id": np.arange(1, n_items + 1),
        "order_id": order_id_repeated,
        "product_id": product_id_col,
        "quantity": quantity_col,
        "unit_price": unit_price_col,
        "discount_pct": discount_col,
    }
)
order_items.to_csv(OUT_DIR / "order_items.csv", index=False)
print(f"  order_items.csv -> {len(order_items):,} rows")

print(f"\nDone in {time.time() - t0:.1f}s. Files written to {OUT_DIR.resolve()}/")
for p in sorted(OUT_DIR.iterdir()):
    print(f"  {p.name:<22} {p.stat().st_size / 1e6:8.2f} MB")