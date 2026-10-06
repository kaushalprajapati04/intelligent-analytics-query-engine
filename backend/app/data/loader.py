import json
import re
from io import StringIO
from pathlib import Path
from typing import Any

import pandas as pd


class DataLoader:
    """
    Loads all datasets and metadata required by the
    Intelligent Analytics Query Engine.
    """

    def __init__(self, dataset_dir: str | Path):
        self.dataset_dir = Path(dataset_dir)

    @staticmethod
    def _read_csv_file(path: Path) -> pd.DataFrame:
        """
        Read CSV files robustly when the raw export contains extra quote
        wrapping or BOM noise. The project dataset is known to have this
        malformed export pattern, so we normalize before parsing.
        """

        text = path.read_text(encoding="utf-8-sig")
        stripped = text.strip()

        if not stripped:
            return pd.DataFrame()

        cleaned = stripped.replace("\ufeff", "")
        cleaned = cleaned.replace("\r", "\n")

        try:
            dataframe = pd.read_csv(
                StringIO(cleaned),
                keep_default_na=False,
            )
        except Exception:
            dataframe = None

        if dataframe is not None and dataframe.shape[1] == 1:
            columns = [str(column) for column in dataframe.columns]
            if columns and any("," in column for column in columns):
                dataframe = None

        if dataframe is not None:
            return dataframe

        normalized = cleaned.replace('"', "")
        normalized = re.sub(r"\n+", "\n", normalized)
        normalized = normalized.strip()

        return pd.read_csv(
            StringIO(normalized),
            keep_default_na=False,
        )

    @staticmethod
    def _load_json_file(path: Path) -> Any:
        """
        Load JSON with a tolerant fallback for malformed values exported by
        a broken serializer or editor.
        """

        text = path.read_text(encoding="utf-8-sig")
        text = text.strip()

        if not text:
            return {}

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            query_matches = re.findall(
                r'""query""\s*:\s*""(.*?)""',
                text,
                flags=re.DOTALL,
            )
            logic_matches = re.findall(
                r'""expected_logic""\s*:\s*""(.*?)""',
                text,
                flags=re.DOTALL,
            )

            if query_matches and logic_matches:
                entry_count = min(len(query_matches), len(logic_matches))
                return [
                    {
                        "query": query_matches[index],
                        "expected_logic": logic_matches[index],
                    }
                    for index in range(entry_count)
                ]

            raise ValueError(
                f"Unable to repair malformed JSON in {path}."
            )

    def load_sales_data(self) -> pd.DataFrame:
        """
        Load the main sales dataset.
        """

        path = self.dataset_dir / "sales_data.csv"

        if not path.exists():
            raise FileNotFoundError(
                f"Sales dataset not found: {path}"
            )

        return self._read_csv_file(path)

    def load_targets(self) -> pd.DataFrame:
        """
        Load target data.
        """

        path = self.dataset_dir / "targets.csv"

        if not path.exists():
            raise FileNotFoundError(
                f"Targets dataset not found: {path}"
            )

        return self._read_csv_file(path)

    def load_data_dictionary(self) -> dict[str, Any]:
        """
        Load the data dictionary JSON file.
        """

        path = self.dataset_dir / "data_dictionary.json"

        if not path.exists():
            raise FileNotFoundError(
                f"Data dictionary not found: {path}"
            )

        return self._load_json_file(path)

    def load_nl_queries(self) -> list[dict[str, Any]]:
        """
        Load the provided natural-language evaluation queries.
        """

        path = self.dataset_dir / "nl_queries.json"

        if not path.exists():
            raise FileNotFoundError(
                f"NL queries file not found: {path}"
            )

        data = self._load_json_file(path)

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            return data.get(
                "queries",
                [data],
            )

        raise ValueError(
            "nl_queries.json must contain a JSON list or object."
        )

    def load_all(self) -> dict[str, Any]:
        """
        Load all available project data.
        """

        return {
            "sales_data": self.load_sales_data(),
            "targets": self.load_targets(),
            "data_dictionary": self.load_data_dictionary(),
            "nl_queries": self.load_nl_queries(),
        }