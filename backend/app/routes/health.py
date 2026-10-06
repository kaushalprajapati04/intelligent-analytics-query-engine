from fastapi import APIRouter

from ..main import (
    dictionary_errors,
    dictionary_valid,
    sales_errors,
    sales_valid,
    targets_errors,
    targets_valid,
)


router = APIRouter(
    prefix="/api",
    tags=["Health"],
)


@router.get("/health")
def health_check():
    """
    Detailed health and dataset validation status.
    """

    return {
        "status": (
            "healthy"
            if sales_valid
            and targets_valid
            and dictionary_valid
            else "degraded"
        ),
        "datasets": {
            "sales_data": {
                "valid": sales_valid,
                "errors": sales_errors,
            },
            "targets": {
                "valid": targets_valid,
                "errors": targets_errors,
            },
            "data_dictionary": {
                "valid": dictionary_valid,
                "errors": dictionary_errors,
            },
        },
    }