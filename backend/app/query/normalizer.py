import re

from .models import QueryPlan


def normalize_plan(plan: QueryPlan) -> QueryPlan:
    """
    Normalize names coming from the AI planner so they match
    our internal metric and dimension names.
    """

    plan.metric = (
        plan.metric
        .strip()
        .lower()
        .replace(" ", "_")
    )

    plan.dimensions = [
        dimension
        .strip()
        .lower()
        .replace(" ", "_")
        for dimension in plan.dimensions
    ]

    if plan.sort_by:
        plan.sort_by = (
            plan.sort_by
            .strip()
            .lower()
            .replace(" ", "_")
        )

    return plan


def extract_number(
    text: str,
    default: int | None = None,
) -> int | None:
    """
    Extract the first integer from natural-language text.

    Example:
        'show top 5 products'
        -> 5
    """

    match = re.search(r"\b(\d+)\b", text)

    if match:
        return int(match.group(1))

    return default