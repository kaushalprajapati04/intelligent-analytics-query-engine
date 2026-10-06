import pandas as pd


class DataCleaner:
    """
    Cleans and standardizes the sales dataset before
    it reaches the analytics engine.
    """

    NUMERIC_COLUMNS = [
        "quantity",
        "unit_price",
        "discount",
        "profit",
    ]

    DATE_COLUMNS = [
        "order_date",
    ]

    def clean_sales_data(
        self,
        df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Clean the main sales DataFrame.
        """

        result = df.copy()

        # Remove accidental whitespace from column names.
        result.columns = [
            str(column).strip().lower().replace(" ", "_")
            for column in result.columns
        ]

        # Remove completely empty rows and columns.
        result = result.dropna(
            axis=0,
            how="all",
        )

        result = result.dropna(
            axis=1,
            how="all",
        )

        # Clean string columns.
        for column in result.select_dtypes(
            include=["object", "string"]
        ).columns:
            result[column] = (
                result[column]
                .astype(str)
                .str.strip()
            )

        # Convert known numeric columns.
        for column in self.NUMERIC_COLUMNS:
            if column in result.columns:
                result[column] = pd.to_numeric(
                    result[column],
                    errors="coerce",
                )

        # Convert known date columns.
        for column in self.DATE_COLUMNS:
            if column in result.columns:
                result[column] = pd.to_datetime(
                    result[column],
                    errors="coerce",
                )

        # Normalize discount if it is represented as percentages.
        if "discount" in result.columns:
            discount = result["discount"]

            if (
                discount.dropna().shape[0] > 0
                and discount.dropna().max() > 1
            ):
                result["discount"] = discount / 100

        # Remove exact duplicate records.
        result = result.drop_duplicates()

        return result.reset_index(drop=True)

    def clean_targets(
        self,
        df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Clean the target DataFrame.
        """

        result = df.copy()

        result.columns = [
            str(column).strip().lower().replace(" ", "_")
            for column in result.columns
        ]

        result = result.dropna(
            axis=0,
            how="all",
        )

        result = result.dropna(
            axis=1,
            how="all",
        )

        for column in result.select_dtypes(
            include=["object", "string"]
        ).columns:
            result[column] = (
                result[column]
                .astype(str)
                .str.strip()
            )

        for column in result.columns:
            if column in self.NUMERIC_COLUMNS or "target" in column:
                result[column] = pd.to_numeric(
                    result[column],
                    errors="coerce",
                )

        result = result.drop_duplicates()

        return result.reset_index(drop=True)