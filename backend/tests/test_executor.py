import pandas as pd

from app.engine.executor import execute_query
from app.query.models import FilterCondition, QueryPlan


def create_sample_data():
    return pd.DataFrame(
        {
            "order_id": ["O1", "O2", "O3", "O4"],
            "order_date": pd.to_datetime(
                [
                    "2025-01-01",
                    "2025-01-02",
                    "2025-02-01",
                    "2025-02-02",
                ]
            ),
            "region": [
                "North",
                "North",
                "South",
                "South",
            ],
            "product_name": [
                "Laptop",
                "Phone",
                "Laptop",
                "Tablet",
            ],
            "quantity": [2, 3, 1, 4],
            "unit_price": [1000, 500, 1000, 250],
            "discount": [0.10, 0.00, 0.20, 0.00],
            "profit": [200, 300, 150, 250],
        }
    )


def test_revenue_by_region():
    dataframe = create_sample_data()

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

    assert "region" in result.columns
    assert "revenue" in result.columns
    assert len(result) == 2

    # North:
    # (2 * 1000 * 0.90) + (3 * 500) = 3300
    assert result.iloc[0]["region"] == "North"
    assert result.iloc[0]["revenue"] == 3300


def test_top_product_by_revenue():
    dataframe = create_sample_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
        dimensions=["product_name"],
        sort_by="revenue",
        sort_order="desc",
        limit=1,
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert len(result) == 1
    assert result.iloc[0]["product_name"] == "Laptop"


def test_filtering():
    dataframe = create_sample_data()

    plan = QueryPlan(
        metric="profit",
        aggregation="sum",
        dimensions=["region"],
        filters=[
            FilterCondition(
                field="region",
                operator="eq",
                value="North",
            )
        ],
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert len(result) == 1
    assert result.iloc[0]["region"] == "North"
    assert result.iloc[0]["profit"] == 500


def test_contains_filter_treats_query_as_literal_text():
    dataframe = create_sample_data()
    plan = QueryPlan(
        metric="profit",
        aggregation="sum",
        dimensions=["product_name"],
        filters=[
            FilterCondition(
                field="product_name",
                operator="contains",
                value=".*",
            )
        ],
    )

    result = execute_query(dataframe, plan)

    assert result.empty


def test_contribution_percentage():
    dataframe = create_sample_data()

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

    total_profit = 900

    percentages = result.set_index(
        "region"
    )["contribution_percentage"]

    assert percentages["North"] == round(
        (500 / total_profit) * 100,
        2,
    )


def test_monthly_revenue():
    dataframe = create_sample_data()

    plan = QueryPlan(
        metric="revenue",
        aggregation="sum",
        dimensions=[],
        time_granularity="month",
        sort_by="revenue",
        sort_order="desc",
    )

    result = execute_query(
        dataframe,
        plan,
    )

    assert "time_period" in result.columns
    assert len(result) == 2