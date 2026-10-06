from unittest.mock import MagicMock, patch

from app.ai.parser import parse_query_plan
from app.ai.planner import QueryPlanner


def test_parse_valid_query_plan():
    response = """
    {
        "metric": "revenue",
        "aggregation": "sum",
        "dimensions": ["region"],
        "filters": [],
        "sort_by": "revenue",
        "sort_order": "desc",
        "limit": 5,
        "percentage": false,
        "comparison": null,
        "time_granularity": null,
        "target_comparison": false
    }
    """

    plan = parse_query_plan(response)

    assert plan.metric == "revenue"
    assert plan.aggregation == "sum"
    assert plan.dimensions == ["region"]
    assert plan.limit == 5


def test_parse_json_inside_code_block():
    response = """
    ```json
    {
        "metric": "profit",
        "aggregation": "sum",
        "dimensions": ["region"],
        "filters": [],
        "sort_by": "profit",
        "sort_order": "desc",
        "limit": 3,
        "percentage": false,
        "comparison": null,
        "time_granularity": null,
        "target_comparison": false
    }
    ```
    """

    plan = parse_query_plan(response)

    assert plan.metric == "profit"
    assert plan.limit == 3


@patch("app.ai.planner.OpenAI")
def test_query_planner(mock_openai):
    mock_client = MagicMock()

    mock_response = MagicMock()
    mock_response.choices[0].message.content = """
    {
        "metric": "revenue",
        "aggregation": "sum",
        "dimensions": ["product_name"],
        "filters": [],
        "sort_by": "revenue",
        "sort_order": "desc",
        "limit": 5,
        "percentage": false,
        "comparison": null,
        "time_granularity": null,
        "target_comparison": false
    }
    """

    mock_client.chat.completions.create.return_value = (
        mock_response
    )

    mock_openai.return_value = mock_client

    planner = QueryPlanner(
        columns=[
            "order_id",
            "order_date",
            "quantity",
            "unit_price",
            "discount",
            "profit",
            "product_name",
        ],
        target_columns=["target"],
    )

    plan = planner.create_plan(
        "Show the top 5 products by revenue."
    )

    assert plan.metric == "revenue"
    assert plan.dimensions == ["product_name"]
    assert plan.sort_by == "revenue"
    assert plan.limit == 5


@patch("app.ai.planner.OpenAI")
def test_query_planner_falls_back_for_empty_model_choices(mock_openai):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value.choices = []
    mock_openai.return_value = mock_client

    planner = QueryPlanner(
        columns=["order_id", "order_date", "quantity", "unit_price", "discount", "profit", "product_name"],
        target_columns=[],
    )

    plan = planner.create_plan("Show total revenue by region")

    assert plan.metric == "revenue"
    assert plan.dimensions == ["region"]