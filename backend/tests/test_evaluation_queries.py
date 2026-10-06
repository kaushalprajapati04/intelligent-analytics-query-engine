import pandas as pd

from app.engine.executor import execute_query
from app.query.models import QueryPlan


def create_evaluation_data():
    return pd.DataFrame(
        {
            "order_id": [
                "O1",
                "O2",
                "O3",
                "O4",
                "O5",
                "O6",
            ],
            "order_date": pd.to_datetime(
                [
                    "2025-01-05",
                    "2025-01-15",
                    "2025-02-05",
                    "2025-02-15",
                    "2025-03-05",
                    "2025-03-15",
                ]
            ),
            "region": [
                "North",
                "North",
                "South",
                "South",
                "West",
                "West",
            ],
            "product_category": [
                "Technology",
                "Furniture",
                "Technology",
                "Furniture",
                "Technology",
                "Furniture",
            ],
            "product_name": [
                "Laptop",
                "Chair",
                "Phone",
                "Desk",
                "Monitor",
                "Table",
            ],
            "quantity": [2, 4, 3, 2, 5, 1],
            "unit_price": [1000, 200, 500, 400, 300, 600],
            "discount": [0.10, 0.00, 0.00, 0.10, 0.05, 0.00],
            "profit": [200, 120, 250, 100, 180, 150],
        }
    )


def test_total_revenue_query():
    dataframe = create_evaluation_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
    )

    result = execute_query(
        dataframe,
        plan,
    )

    expected_revenue = (
        (2 * 1000 * 0.90)
        + (4 * 200)
        + (3 * 500)
        + (2 * 400 * 0.90)
        + (5 * 300 * 0.95)
        + (1 * 600)
    )

    assert result.iloc[0]["revenue"] == expected_revenue


def test_revenue_by_region():
    dataframe = create_evaluation_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
        dimensions=["region"],
        sort_by="revenue",
        sort_order="desc",
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert len(result) == 3
    assert result.iloc[0]["region"] == "North"


def test_top_two_products():
    dataframe = create_evaluation_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
        dimensions=["product_name"],
        sort_by="revenue",
        sort_order="desc",
        limit=2,
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert len(result) == 2
    assert result.iloc[0]["product_name"] == "Laptop"


def test_revenue_by_month():
    dataframe = create_evaluation_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
        time_granularity="month",
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert len(result) == 3
    assert "time_period" in result.columns


def test_profit_contribution():
    dataframe = create_evaluation_data()

    plan = QueryPlan(
        metric="profit",
        aggregation="sum",
        dimensions=["region"],
        percentage=True,
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert "contribution_percentage" in result.columns

    total_percentage = result[
        "contribution_percentage"
    ].sum()

    assert round(total_percentage, 2) == 100.00