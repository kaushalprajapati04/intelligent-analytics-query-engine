from pathlib import Path

from app.data.loader import DataLoader


def test_loader_initialization():
    dataset_dir = Path(__file__).resolve().parents[1] / "dataset"

    loader = DataLoader(dataset_dir)

    assert loader.dataset_dir == dataset_dir


def test_load_sales_data():
    dataset_dir = Path(__file__).resolve().parents[1] / "dataset"

    loader = DataLoader(dataset_dir)
    dataframe = loader.load_sales_data()

    assert dataframe is not None
    assert len(dataframe) > 0
    assert len(dataframe.columns) > 0


def test_load_targets():
    dataset_dir = Path(__file__).resolve().parents[1] / "dataset"

    loader = DataLoader(dataset_dir)
    dataframe = loader.load_targets()

    assert dataframe is not None
    assert len(dataframe) > 0


def test_load_data_dictionary():
    dataset_dir = Path(__file__).resolve().parents[1] / "dataset"

    loader = DataLoader(dataset_dir)
    dictionary = loader.load_data_dictionary()

    assert isinstance(dictionary, dict)
    assert "metrics" in dictionary
    assert "dimensions" in dictionary


def test_load_nl_queries():
    dataset_dir = Path(__file__).resolve().parents[1] / "dataset"

    loader = DataLoader(dataset_dir)
    queries = loader.load_nl_queries()

    assert isinstance(queries, list)