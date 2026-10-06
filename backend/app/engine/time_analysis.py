import pandas as pd


def prepare_date_column(
    df: pd.DataFrame,
    date_column: str = "order_date",
) -> pd.DataFrame:
    """
    Convert the dataset's date column into pandas datetime values.
    """

    result = df.copy()

    if date_column not in result.columns:
        raise ValueError(
            f"Date column '{date_column}' not found in dataset."
        )

    result[date_column] = pd.to_datetime(
        result[date_column],
        errors="coerce",
    )

    return result


def add_time_dimension(
    df: pd.DataFrame,
    granularity: str,
    date_column: str = "order_date",
) -> pd.DataFrame:
    """
    Add a time dimension for day, month, quarter, or year analysis.
    """

    result = prepare_date_column(df, date_column)

    if granularity == "day":
        result["time_period"] = (
            result[date_column].dt.strftime("%Y-%m-%d")
        )

    elif granularity == "month":
        result["time_period"] = (
            result[date_column].dt.to_period("M").astype(str)
        )

    elif granularity == "quarter":
        result["time_period"] = (
            result[date_column]
            .dt.to_period("Q")
            .astype(str)
        )

    elif granularity == "year":
        result["time_period"] = (
            result[date_column].dt.year.astype("Int64").astype(str)
        )

    else:
        raise ValueError(
            f"Unsupported time granularity: {granularity}. "
            "Supported values: day, month, quarter, year."
        )

    return result


def get_time_range(
    df: pd.DataFrame,
    date_column: str = "order_date",
) -> dict:
    """
    Return the minimum and maximum dates available in the dataset.
    """

    result = prepare_date_column(df, date_column)

    valid_dates = result[date_column].dropna()

    if valid_dates.empty:
        return {
            "min_date": None,
            "max_date": None,
        }

    return {
        "min_date": valid_dates.min().strftime("%Y-%m-%d"),
        "max_date": valid_dates.max().strftime("%Y-%m-%d"),
    }