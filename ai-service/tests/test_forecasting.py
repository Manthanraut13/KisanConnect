# Unit tests for DemandForecaster model and routes
import os
import pytest
from app import create_app
from app.models.demand_forecaster import DemandForecaster

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_demand_forecaster_predict_structure():
    forecaster = DemandForecaster()
    result = forecaster.predict(crop_name="Tomato", district="Nashik", days_ahead=7)

    assert result is not None
    assert result["crop_name"] == "Tomato"
    assert result["district"] == "Nashik"
    assert "forecast" in result
    assert len(result["forecast"]) == 7
    assert "advisory" in result
    assert "model_version" in result

    first_item = result["forecast"][0]
    assert "date" in first_item
    assert "predicted_price" in first_item
    assert "lower_bound" in first_item
    assert "upper_bound" in first_item
    assert "demand_index" in first_item
    assert "confidence" in first_item
    assert 0 <= first_item["demand_index"] <= 100

def test_demand_forecaster_unknown_crop_fallback():
    forecaster = DemandForecaster()
    result = forecaster.predict(crop_name="UnknownCrop", district="Nashik", days_ahead=7)

    assert result is not None
    assert len(result["forecast"]) == 7
    assert result["model_version"] in ["moving-average-v1.0", "static-fallback-v1.0"]

def test_demand_forecaster_unknown_district_fallback():
    forecaster = DemandForecaster()
    result = forecaster.predict(crop_name="Tomato", district="UnknownDistrict", days_ahead=5)

    assert result is not None
    assert len(result["forecast"]) == 5

def test_forecast_route_valid(client):
    response = client.post('/ai/forecast/demand', json={
        "crop_name": "Tomato",
        "district": "Nashik",
        "forecast_days": 7
    })

    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "data" in json_data
    assert json_data["data"]["crop_name"] == "Tomato"

def test_forecast_route_missing_fields(client):
    response = client.post('/ai/forecast/demand', json={
        "crop_name": "Tomato"
    })
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["success"] is False

def test_forecast_route_empty_body(client):
    response = client.post('/ai/forecast/demand', json={})
    assert response.status_code == 400

def test_batch_forecast_unauthorized(client):
    response = client.post('/ai/forecast/batch', headers={
        "x-antigravity-secret": "wrong_secret"
    })
    assert response.status_code == 401

def test_batch_forecast_success(client):
    secret = os.getenv('ANTIGRAVITY_SECRET', 'demo_antigravity_secret_2026')
    response = client.post('/ai/forecast/batch', headers={
        "x-antigravity-secret": secret
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "processed" in json_data["data"]
