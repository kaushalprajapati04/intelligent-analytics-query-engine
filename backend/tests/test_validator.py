import pandas as pd

from app.data.validator import DataValidator


def test_valid_sales_data():
    dataframe = pd.DataFrame(
        {
            "order_id": ["O1", "O2"],
            "order_date": pd.to_datetime(
                ["2025-01-01", "2025-01-02"]
            ),
            "quantity": [2, 3],
            "unit_price": [100.0, 200.0],
            "discount": [0.10, 0.20],
            "profit": [50.0, 80.0],
        }
    )

    validator = DataValidator()

    is_valid, errors = validator.validate_sales_data(
        dataframe
    )

    assert is_valid is True
    assert errors == []


def test_missing_required_column():
    dataframe = pd.DataFrame(
        {
            "order_id": ["O1"],
            "order_date": pd.to_datetime(
                ["2025-01-01"]
            ),
            "quantity": [2],
            "unit_price": [100.0],
            "discount": [0.10],
        }
    )

    validator = DataValidator()

    is_valid, errors = validator.validate_sales_data(
        dataframe
    )

    assert is_valid is False
    assert any(
        "profit" in error
        for error in errors
    )


def test_empty_sales_data():
    dataframe = pd.DataFrame()

    validator = DataValidator()

    is_valid, errors = validator.validate_sales_data(
        dataframe
    )

    assert is_valid is False
    assert "Sales dataset is empty." in errors


def test_valid_targets():
    dataframe = pd.DataFrame(
        {
            "region": ["North", "South"],
            "target": [10000, 15000],
        }
    )

    validator = DataValidator()

    is_valid, errors = validator.validate_targets(
        dataframe
    )

    assert is_valid is True
    assert errors == []


def test_valid_data_dictionary():
    dictionary = {
        "metrics": {
            "revenue": "quantity * unit_price"
        },
        "dimensions": [
            "region",
            "country",
        ],
    }

    validator = DataValidator()

    is_valid, errors = (
        validator.validate_data_dictionary(
            dictionary
        )
    )

    assert is_valid is True
    assert errors == []