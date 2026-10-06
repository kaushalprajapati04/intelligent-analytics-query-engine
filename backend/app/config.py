import os

from dotenv import load_dotenv


# Load environment variables from backend/.env
load_dotenv()


class Settings:
    """
    Application configuration loaded from environment variables.
    """

    APP_NAME: str = os.getenv(
        "APP_NAME",
        "SalesAnalyticsAI",
    )

    APP_VERSION: str = os.getenv(
        "APP_VERSION",
        "1.0.0",
    )

    OPENAI_API_KEY: str = os.getenv(
        "OPENAI_API_KEY",
        "",
    )

    OPENAI_MODEL: str = os.getenv(
        "OPENAI_MODEL",
        "gpt-4o-mini",
    )

    DATASET_PATH: str = os.getenv(
        "DATASET_PATH",
        "dataset/sales_data.csv",
    )

    TARGETS_PATH: str = os.getenv(
        "TARGETS_PATH",
        "dataset/targets.csv",
    )

    DATA_DICTIONARY_PATH: str = os.getenv(
        "DATA_DICTIONARY_PATH",
        "dataset/data_dictionary.json",
    )

    NL_QUERIES_PATH: str = os.getenv(
        "NL_QUERIES_PATH",
        "dataset/nl_queries.json",
    )

    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """
        Convert comma-separated CORS origins into a list.
        """

        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()