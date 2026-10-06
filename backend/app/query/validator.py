from ..data.metrics import DIMENSIONS, METRICS
from .models import QueryPlan


def validate_query_plan(
    plan: QueryPlan,
    available_columns: set[str] | None = None,
) -> tuple[bool, list[str]]:
    """
    Validate a QueryPlan before it reaches the analytics engine.

    Returns:
        (True, []) when valid
        (False, [errors]) when invalid
    """

    errors: list[str] = []

    available_columns = available_columns or set()

    # -------------------------
    # Validate metric
    # -------------------------
    if plan.metric not in METRICS:
        errors.append(
            f"Unknown metric '{plan.metric}'. "
            f"Available metrics: {', '.join(METRICS.keys())}"
        )

    # -------------------------
    # Validate dimensions
    # -------------------------
    for dimension in plan.dimensions:
        if (
            dimension not in DIMENSIONS
            and dimension not in available_columns
        ):
            errors.append(
                f"Unknown dimension '{dimension}'."
            )

    # -------------------------
    # Validate filters
    # -------------------------
    for condition in plan.filters:

        if (
            condition.field not in DIMENSIONS
            and condition.field not in available_columns
        ):
            errors.append(
                f"Unknown filter field '{condition.field}'."
            )

        if condition.operator == "in":
            if not isinstance(condition.value, list):
                errors.append(
                    f"Filter value for '{condition.field}' "
                    f"must be a list when using 'in'."
                )

    # -------------------------
    # Validate sorting
    # -------------------------
    if plan.sort_by:

        valid_sort_fields = (
            set(METRICS.keys())
            | set(DIMENSIONS)
            | available_columns
        )

        if plan.sort_by not in valid_sort_fields:
            errors.append(
                f"Unknown sort field '{plan.sort_by}'."
            )

    # -------------------------
    # Validate limit
    # -------------------------
    if plan.limit is not None:

        if plan.limit <= 0:
            errors.append(
                "Limit must be greater than zero."
            )

        if plan.limit > 1000:
            errors.append(
                "Limit cannot exceed 1000."
            )

    # -------------------------
    # Validate time analysis
    # -------------------------
    if plan.time_granularity:

        if "order_date" not in available_columns:
            errors.append(
                "Time-based analysis requires an 'order_date' column."
            )

    # -------------------------
    # Final result
    # -------------------------
    return len(errors) == 0, errors