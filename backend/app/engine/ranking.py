import pandas as pd


def rank_result(
    df: pd.DataFrame,
    sort_by: str | None = None,
    sort_order: str = "desc",
    limit: int | None = None,
) -> pd.DataFrame:
    """
    Sort and optionally limit an analytical result.

    Examples:
        Top 5 products by revenue
        Lowest 10 cities by profit
    """

    result = df.copy()

    # ---------------------------------
    # Validate sort column
    # ---------------------------------

    if sort_by:

        if sort_by not in result.columns:
            raise ValueError(
                f"Cannot sort by '{sort_by}'. "
                f"Available columns: {list(result.columns)}"
            )

        ascending = sort_order == "asc"

        result = result.sort_values(
            by=sort_by,
            ascending=ascending,
            kind="stable",
        )

    # ---------------------------------
    # Apply Top-N / limit
    # ---------------------------------

    if limit is not None:

        if limit <= 0:
            raise ValueError(
                "Limit must be greater than zero."
            )

        result = result.head(limit)

    return result.reset_index(drop=True)