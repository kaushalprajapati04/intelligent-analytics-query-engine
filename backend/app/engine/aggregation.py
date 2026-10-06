import pandas as pd


def ensure_revenue(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create the calculated revenue metric if it does not
    already exist in the dataframe.
    """

    result = df.copy()

    required_columns = [
        "quantity",
        "unit_price",
        "discount",
    ]

    if (
        "revenue" not in result.columns
        and all(column in result.columns for column in required_columns)
    ):
        result["revenue"] = (
            result["quantity"]
            * result["unit_price"]
            * (1 - result["discount"])
        )

    return result


def aggregate(
    df: pd.DataFrame,
    metric: str,
    aggregation: str,
    dimensions: list[str],
) -> pd.DataFrame:
    """
    Perform deterministic aggregation using Pandas.

    Supported aggregations:
        sum
        avg
        count
        min
        max
    """

    df = ensure_revenue(df)

    # Special handling for metrics that are derived from other columns.
    if metric == "orders":
        metric_column = "order_id"
        aggregation = "count"

    elif metric == "avg_order_value":
        metric_column = "revenue"
        aggregation = "sum"

    else:
        metric_column = metric

    if metric == "avg_order_value":
        if "order_id" not in df.columns:
            raise ValueError(
                "Metric 'avg_order_value' requires an 'order_id' column."
            )

        if dimensions:
            revenue_by_group = (
                df.groupby(dimensions, dropna=False)["revenue"]
                .sum()
                .reset_index()
            )
            order_counts = (
                df.groupby(dimensions, dropna=False)["order_id"]
                .nunique()
                .reset_index()
                .rename(columns={"order_id": "orders"})
            )
            result = revenue_by_group.merge(
                order_counts,
                on=dimensions,
                how="left",
            )
            result["avg_order_value"] = (
                result["revenue"] / result["orders"].replace(0, pd.NA)
            )
            return result[dimensions + ["avg_order_value"]]

        order_count = df["order_id"].nunique()
        revenue_total = df["revenue"].sum()
        value = revenue_total / order_count if order_count else 0.0

        return pd.DataFrame(
            [{"avg_order_value": value}]
        )

    if metric_column not in df.columns:
        raise ValueError(
            f"Metric '{metric}' requires column "
            f"'{metric_column}', but it was not found."
        )

    # Validate dimensions.
    missing_dimensions = [
        dimension
        for dimension in dimensions
        if dimension not in df.columns
    ]

    if missing_dimensions:
        raise ValueError(
            f"Unknown dimension columns: {missing_dimensions}"
        )

    # ---------------------------------
    # Grouped aggregation
    # ---------------------------------

    if dimensions:

        grouped = df.groupby(
            dimensions,
            dropna=False,
        )[metric_column]

        if aggregation == "sum":
            result = grouped.sum()

        elif aggregation == "avg":
            result = grouped.mean()

        elif aggregation == "count":
            result = grouped.count()

        elif aggregation == "min":
            result = grouped.min()

        elif aggregation == "max":
            result = grouped.max()

        else:
            raise ValueError(
                f"Unsupported aggregation: {aggregation}"
            )

        result = result.reset_index()

        # Rename aggregated metric column.
        result = result.rename(
            columns={
                metric_column: metric,
            }
        )

        return result

    # ---------------------------------
    # Overall aggregation
    # ---------------------------------

    series = df[metric_column]

    if aggregation == "sum":
        value = series.sum()

    elif aggregation == "avg":
        value = series.mean()

    elif aggregation == "count":
        value = series.count()

    elif aggregation == "min":
        value = series.min()

    elif aggregation == "max":
        value = series.max()

    else:
        raise ValueError(
            f"Unsupported aggregation: {aggregation}"
        )

    return pd.DataFrame(
        [
            {
                metric: value,
            }
        ]
    )
