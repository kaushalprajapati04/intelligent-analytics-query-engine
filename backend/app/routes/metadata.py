from fastapi import APIRouter

from ..main import data_dictionary, sales_data, targets_data
from ..data.metrics import DIMENSIONS, METRICS


router = APIRouter(
    prefix="/api",
    tags=["Metadata"],
)


@router.get("/metadata")
def get_metadata():
    """
    Return dataset and analytics metadata for the frontend.
    """

    return {
        "sales_data": {
            "rows": len(sales_data),
            "columns": list(sales_data.columns),
        },
        "targets": {
            "rows": len(targets_data),
            "columns": list(targets_data.columns),
        },
        "metrics": METRICS,
        "dimensions": DIMENSIONS,
        "data_dictionary": data_dictionary,
    }