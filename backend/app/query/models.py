from typing import Any, Literal

from pydantic import BaseModel, Field


class FilterCondition(BaseModel):
    field: str

    operator: Literal[
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "in",
        "contains",
    ]

    value: Any


class QueryPlan(BaseModel):
    metric: str

    aggregation: Literal[
        "sum",
        "avg",
        "count",
        "min",
        "max",
    ] = "sum"

    dimensions: list[str] = Field(default_factory=list)

    filters: list[FilterCondition] = Field(default_factory=list)

    sort_by: str | None = None

    sort_order: Literal["asc", "desc"] = "desc"

    limit: int | None = None

    percentage: bool = False

    comparison: str | None = None

    time_granularity: Literal[
        "day",
        "month",
        "quarter",
        "year",
    ] | None = None

    target_comparison: bool = False