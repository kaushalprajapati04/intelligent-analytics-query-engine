from typing import Any

import pandas as pd


class DataValidator:
    """
    Validates that the loaded datasets contain the fields
    required by the analytics engine.
    """

    REQUIRED_SALES_COLUMNS = {
        "order_id",
        "order_date",
        "quantity",
        "unit_price",
        "discount",
        "profit",
    }

    def validate_sales_data(
        self,
        df: pd.DataFrame,
    ) -> tuple[bool, list[str]]:
        """
        Validate the main sales dataset.
        """

        errors: list[str] = []

        if df.empty:
            errors.append("Sales dataset is empty.")
            return False, errors

        missing_columns = (
            self.REQUIRED_SALES_COLUMNS
            - set(df.columns)
        )

        if missing_columns:
            errors.append(
                "Missing required sales columns: "
                + ", ".join(sorted(missing_columns))
            )

        if "order_id" in df.columns:
            if df["order_id"].isna().any():
                errors.append(
                    "Sales dataset contains missing order_id values."
                )

        for column in [
            "quantity",
            "unit_price",
            "discount",
            "profit",
        ]:
            if column in df.columns:
                if not pd.api.types.is_numeric_dtype(
                    df[column]
                ):
                    errors.append(
                        f"Column '{column}' must be numeric."
                    )

        if "order_date" in df.columns:
            if not pd.api.types.is_datetime64_any_dtype(
                df["order_date"]
            ):
                errors.append(
                    "Column 'order_date' must be a datetime column."
                )

        return len(errors) == 0, errors

    def validate_targets(
        self,
        df: pd.DataFrame,
    ) -> tuple[bool, list[str]]:
        """
        Validate the targets dataset.

        The exact target schema may vary, so this validator
        performs general structural checks.
        """

        errors: list[str] = []

        if df.empty:
            errors.append("Targets dataset is empty.")
            return False, errors

        if len(df.columns) == 0:
            errors.append(
                "Targets dataset does not contain any columns."
            )

        return len(errors) == 0, errors

    def validate_data_dictionary(
        self,
        dictionary: dict[str, Any],
    ) -> tuple[bool, list[str]]:
        """
        Validate the data dictionary structure.
        """

        errors: list[str] = []

        if not isinstance(dictionary, dict):
            errors.append(
                "Data dictionary must be a JSON object."
            )
            return False, errors

        if "metrics" not in dictionary:
            errors.append(
                "Data dictionary is missing 'metrics'."
            )

        if "dimensions" not in dictionary:
            errors.append(
                "Data dictionary is missing 'dimensions'."
            )

        return len(errors) == 0, errors