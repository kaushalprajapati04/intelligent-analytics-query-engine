import pandas as pd

from ..query.models import FilterCondition


def apply_filters(
    df: pd.DataFrame,
    filters: list[FilterCondition],
) -> pd.DataFrame:
    """
    Apply all filter conditions from a validated QueryPlan.

    Multiple filters are combined using AND logic.
    """

    result = df.copy()

    for condition in filters:
        field = condition.field
        operator = condition.operator
        value = condition.value

        if field not in result.columns:
            raise ValueError(
                f"Filter field '{field}' does not exist in the dataset."
            )

        if operator == "eq":
            result = result[result[field] == value]

        elif operator == "neq":
            result = result[result[field] != value]

        elif operator == "gt":
            result = result[result[field] > value]

        elif operator == "gte":
            result = result[result[field] >= value]

        elif operator == "lt":
            result = result[result[field] < value]

        elif operator == "lte":
            result = result[result[field] <= value]

        elif operator == "in":
            values = (
                value
                if isinstance(value, list)
                else [value]
            )

            result = result[result[field].isin(values)]

        elif operator == "contains":
            result = result[
                result[field]
                .astype(str)
                .str.contains(
                    str(value),
                    case=False,
                    na=False,
                    regex=False,
                )
            ]

        else:
            raise ValueError(
                f"Unsupported filter operator: {operator}"
            )

    return result.reset_index(drop=True)