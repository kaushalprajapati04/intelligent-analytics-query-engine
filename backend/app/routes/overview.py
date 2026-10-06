import pandas as pd
from fastapi import APIRouter

from ..main import sales_data
from ..engine.aggregation import ensure_revenue


router = APIRouter(
    prefix="/api",
    tags=["Overview"],
)


def _records(frame: pd.DataFrame) -> list[dict]:
    if frame.empty:
        return []

    return frame.where(pd.notna(frame), None).to_dict(orient="records")


@router.get("/overview")
def get_overview():
    """Return deterministic dashboard metrics and chart series."""
    data = ensure_revenue(sales_data)
    metrics: dict[str, int | float | None] = {
        "total_revenue": None,
        "total_orders": None,
        "total_profit": None,
        "product_count": None,
    }
    charts: dict[str, list[dict]] = {
        "revenue_by_region": [],
        "monthly_revenue": [],
        "top_products_by_revenue": [],
    }

    if data.empty:
        return {"metrics": metrics, "charts": charts}

    if "revenue" in data.columns:
        revenue = pd.to_numeric(data["revenue"], errors="coerce").dropna()
        if not revenue.empty:
            metrics["total_revenue"] = float(revenue.sum())

        if "region" in data.columns:
            region_data = data.assign(
                revenue=pd.to_numeric(data["revenue"], errors="coerce")
            )
            grouped = (
                region_data.dropna(subset=["revenue"])
                .groupby("region", dropna=False)["revenue"]
                .sum()
                .sort_values(ascending=False)
                .rename_axis("region")
                .reset_index()
            )
            charts["revenue_by_region"] = _records(grouped)

        if "order_date" in data.columns:
            monthly = data.assign(
                revenue=pd.to_numeric(data["revenue"], errors="coerce"),
                time_period=pd.to_datetime(
                    data["order_date"], errors="coerce"
                ).dt.to_period("M").astype(str),
            )
            monthly = monthly.dropna(subset=["revenue"])
            monthly = monthly[monthly["time_period"] != "NaT"]
            grouped = (
                monthly.groupby("time_period", dropna=False)["revenue"]
                .sum()
                .sort_index()
                .rename_axis("time_period")
                .reset_index()
            )
            charts["monthly_revenue"] = _records(grouped)

        if "product_name" in data.columns:
            product_data = data.assign(
                revenue=pd.to_numeric(data["revenue"], errors="coerce")
            )
            grouped = (
                product_data.dropna(subset=["revenue", "product_name"])
                .groupby("product_name", dropna=False)["revenue"]
                .sum()
                .sort_values(ascending=False, kind="stable")
                .head(5)
                .rename_axis("product_name")
                .reset_index()
            )
            charts["top_products_by_revenue"] = _records(grouped)

    if "order_id" in data.columns:
        metrics["total_orders"] = int(data["order_id"].nunique())

    if "profit" in data.columns:
        profit = pd.to_numeric(data["profit"], errors="coerce").dropna()
        if not profit.empty:
            metrics["total_profit"] = float(profit.sum())

    if "product_name" in data.columns:
        metrics["product_count"] = int(data["product_name"].nunique())

    return {"metrics": metrics, "charts": charts}
