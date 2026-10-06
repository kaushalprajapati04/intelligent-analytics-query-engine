from typing import Any


def compare_values(
    current: float,
    previous: float,
) -> dict[str, Any]:
    """
    Compare a current value with a previous value.

    Returns:
        current
        previous
        absolute change
        percentage change
    """

    change = current - previous

    if previous == 0:
        percentage_change = None
    else:
        percentage_change = round(
            (change / previous) * 100,
            2,
        )

    return {
        "current": current,
        "previous": previous,
        "change": change,
        "change_percentage": percentage_change,
    }


def compare_dataframe_columns(
    current_df,
    current_column: str,
    previous_df,
    previous_column: str | None = None,
):
    """
    Compare two aggregated DataFrame values.

    This helper is useful for target comparisons and
    period-over-period analysis.
    """

    previous_column = previous_column or current_column

    if current_column not in current_df.columns:
        raise ValueError(
            f"Column '{current_column}' not found in current data."
        )

    if previous_column not in previous_df.columns:
        raise ValueError(
            f"Column '{previous_column}' not found in previous data."
        )

    current_value = float(
        current_df[current_column].sum()
    )

    previous_value = float(
        previous_df[previous_column].sum()
    )

    return compare_values(
        current=current_value,
        previous=previous_value,
    )