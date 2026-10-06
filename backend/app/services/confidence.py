from ..query.models import QueryPlan


def calculate_confidence(
    plan: QueryPlan,
    validation_errors: list[str] | None = None,
) -> float:
    """
    Calculate a deterministic confidence score for a QueryPlan.

    The score is based on:
    - whether the plan passed validation
    - whether the requested metric is present
    - whether dimensions are specified
    - whether advanced operations are requested
    """

    validation_errors = validation_errors or []

    if validation_errors:
        return 0.0

    score = 0.70

    # A recognized metric is the foundation of the query.
    if plan.metric:
        score += 0.10

    # Explicit dimensions make the intended analysis clearer.
    if plan.dimensions:
        score += 0.05

    # Sorting and limits indicate a specific analytical intention.
    if plan.sort_by:
        score += 0.03

    if plan.limit is not None:
        score += 0.03

    # Time-based analysis is an explicit analytical operation.
    if plan.time_granularity:
        score += 0.03

    # Percentage analysis is an additional analytical requirement.
    if plan.percentage:
        score += 0.02

    # Comparisons require additional interpretation.
    if plan.comparison:
        score += 0.02

    if plan.target_comparison:
        score += 0.02

    return round(min(score, 1.0), 2)