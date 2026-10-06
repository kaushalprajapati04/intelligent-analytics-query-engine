from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .data.cleaner import DataCleaner
from .data.loader import DataLoader
from .data.validator import DataValidator


BASE_DIR = Path(__file__).resolve().parents[1]
DATASET_DIR = BASE_DIR / "dataset"


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Natural-language analytics query engine "
        "for sales data."
    ),
)


# Allow the React frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load and prepare datasets when the application starts.
loader = DataLoader(DATASET_DIR)
cleaner = DataCleaner()
validator = DataValidator()

sales_data = loader.load_sales_data()
targets_data = loader.load_targets()
data_dictionary = loader.load_data_dictionary()

sales_data = cleaner.clean_sales_data(sales_data)
targets_data = cleaner.clean_targets(targets_data)

sales_valid, sales_errors = validator.validate_sales_data(
    sales_data
)

targets_valid, targets_errors = validator.validate_targets(
    targets_data
)

dictionary_valid, dictionary_errors = (
    validator.validate_data_dictionary(
        data_dictionary
    )
)

from .routes.health import router as health_router
from .routes.metadata import router as metadata_router
from .routes.overview import router as overview_router
from .routes.query import router as query_router

app.include_router(health_router)
app.include_router(metadata_router)
app.include_router(overview_router)
app.include_router(query_router)


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "sales_data_valid": sales_valid,
        "targets_data_valid": targets_valid,
        "data_dictionary_valid": dictionary_valid,
    }