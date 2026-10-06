from typing import Any

import pandas as pd


def format_result(
    dataframe: pd.DataFrame,
    max_rows: int = 100,
) -> dict[str, Any]:
    """
    Convert a Pandas DataFrame into a JSON-friendly response.

    Handles:
    - NaN values
    - NumPy numeric types
    - timestamps
    - empty results
    """

    if dataframe.empty:
        return {
            "columns": list(dataframe.columns),
            "rows": [],
            "row_count": 0,
        }

    result = dataframe.head(max_rows).copy()

    # Convert timestamps/dates to strings.
    for column in result.columns:
        if pd.api.types.is_datetime64_any_dtype(result[column]):
            result[column] = result[column].astype(str)

    # Replace NaN/NaT with None so the result is JSON serializable.
    result = result.where(pd.notnull(result), None)

    rows = result.to_dict(orient="records")

    return {
        "columns": list(result.columns),
        "rows": rows,
        "row_count": len(result),
    }


def format_scalar(value: Any) -> Any:
    """
    Convert Pandas/NumPy scalar values into standard Python values.
    """

    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        try:
            return value.item()
        except (ValueError, TypeError):
            pass

    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except (ValueError, TypeError):
            pass

    return value