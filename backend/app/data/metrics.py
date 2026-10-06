METRICS = {
    "revenue": {
        "type": "calculated",
        "description": "Total sales revenue",
        "formula": "quantity * unit_price * (1 - discount)",
    },
    "profit": {
        "type": "column",
        "description": "Profit generated from sales",
        "field": "profit",
    },
    "orders": {
        "type": "count",
        "description": "Number of orders",
        "field": "order_id",
    },
    "quantity": {
        "type": "column",
        "description": "Total quantity of products sold",
        "field": "quantity",
    },
    "avg_order_value": {
        "type": "calculated",
        "description": "Average revenue per order",
        "formula": "revenue / orders",
    },
}

DIMENSIONS = [
    "region",
    "country",
    "city",
    "customer_id",
    "customer_segment",
    "product_category",
    "product_subcategory",
    "product_name",
]