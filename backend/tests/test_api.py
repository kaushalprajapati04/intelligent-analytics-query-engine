from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "name" in data
    assert "version" in data
    assert data["status"] == "running"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert "status" in data
    assert "sales_data_valid" in data
    assert "targets_data_valid" in data
    assert "data_dictionary_valid" in data


def test_metadata_endpoint():
    response = client.get("/api/metadata")

    assert response.status_code == 200

    data = response.json()

    assert "sales_data" in data
    assert "targets" in data
    assert "metrics" in data
    assert "dimensions" in data
    assert "data_dictionary" in data


def test_overview_endpoint_returns_supported_metrics_and_charts():
    response = client.get("/api/overview")

    assert response.status_code == 200
    data = response.json()
    assert data["metrics"]["total_revenue"] > 0
    assert data["metrics"]["total_orders"] > 0
    assert data["metrics"]["total_profit"] is not None
    assert data["metrics"]["product_count"] > 0
    assert data["charts"]["revenue_by_region"]
    assert data["charts"]["monthly_revenue"]
    assert len(data["charts"]["top_products_by_revenue"]) <= 5


def test_query_requires_question():
    response = client.post(
        "/api/query",
        json={
            "query": ""
        },
    )

    assert response.status_code == 422