from ..query.models import QueryPlan


def build_explanation(
    plan: QueryPlan,
    row_count: int,
) -> str:
    """
    Generate a human-readable explanation of how the query
    was interpreted and executed.
    """

    parts: list[str] = []

    parts.append(
        f"The system analyzed '{plan.metric}' using "
        f"{plan.aggregation} aggregation."
    )

    if plan.dimensions:
        dimensions = ", ".join(plan.dimensions)
        parts.append(
            f"The result was grouped by {dimensions}."
        )

    if plan.filters:
        filter_count = len(plan.filters)
        parts.append(
            f"{filter_count} filter condition"
            f"{'s were' if filter_count != 1 else ' was'} applied."
        )

    if plan.time_granularity:
        parts.append(
            f"The analysis was performed at "
            f"{plan.time_granularity} level."
        )

    if plan.percentage:
        parts.append(
            "Contribution percentage was calculated "
            "against the total result."
        )

    if plan.sort_by:
        direction = (
            "descending"
            if plan.sort_order == "desc"
            else "ascending"
        )
        parts.append(
            f"Results were sorted by {plan.sort_by} "
            f"in {direction} order."
        )

    if plan.limit is not None:
        parts.append(
            f"Only the top {plan.limit} result"
            f"{'s' if plan.limit != 1 else ''} were returned."
        )

    if plan.comparison:
        parts.append(
            f"A {plan.comparison} comparison was requested."
        )

    if plan.target_comparison:
        parts.append(
            "The result was compared against the available target data."
        )

    parts.append(
        f"The execution produced {row_count} result row"
        f"{'s' if row_count != 1 else ''}."
    )

    return " ".join(parts)