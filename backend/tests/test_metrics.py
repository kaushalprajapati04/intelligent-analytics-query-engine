import pandas as pd

from app.data.metrics import DIMENSIONS, METRICS


def test_required_metrics_exist():
    required_metrics = {
        "revenue",
        "profit",
        "orders",
        "quantity",
        "avg_order_value",
    }

    assert required_metrics.issubset(METRICS.keys())


def test_required_dimensions_exist():
    required_dimensions = {
        "region",
        "country",
        "city",
        "customer_id",
        "customer_segment",
        "product_category",
        "product_subcategory",
        "product_name",
    }

    assert required_dimensions.issubset(set(DIMENSIONS))


def test_revenue_formula_columns():
    dataframe = pd.DataFrame(
        {
            "quantity": [2, 5],
            "unit_price": [100, 200],
            "discount": [0.10, 0.20],
        }
    )

    dataframe["revenue"] = (
        dataframe["quantity"]
        * dataframe["unit_price"]
        * (1 - dataframe["discount"])
    )

    assert dataframe["revenue"].tolist() == [
        180.0,
        800.0,
    ]