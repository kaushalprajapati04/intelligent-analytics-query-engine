import pandas as pd


def add_contribution_percentage(
    df: pd.DataFrame,
    metric: str,
) -> pd.DataFrame:
    """
    Calculate each row's contribution to the total metric.

    Example:

        Region    Revenue
        North     2000
        South     3000

    becomes:

        Region    Revenue    Contribution %
        North     2000       40.00
        South     3000       60.00
    """

    result = df.copy()

    if metric not in result.columns:
        raise ValueError(
            f"Metric '{metric}' not found in result."
        )

    total = result[metric].sum()

    if total == 0:
        result["contribution_percentage"] = 0.0
    else:
        result["contribution_percentage"] = (
            result[metric] / total * 100
        ).round(2)

    return result