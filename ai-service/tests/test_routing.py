# Unit tests for RouteOptimizer and logistics route
import pytest
from app import create_app
from app.models.route_optimizer import RouteOptimizer

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_route_optimizer_small_orders():
    optimizer = RouteOptimizer()
    driver_loc = {"lat": 19.99, "lng": 73.78}
    orders = [
        {"id": "1", "lat": 20.01, "lng": 73.79, "address": "Stop 1"},
        {"id": "2", "lat": 19.95, "lng": 73.75, "address": "Stop 2"}
    ]
    result = optimizer.optimize(orders, driver_loc)

    assert result is not None
    assert "clusters" in result
    assert len(result["clusters"]) == 1
    route = result["clusters"][0]["optimized_route"]
    assert len(route) == 2
    assert route[0]["sequence"] == 1
    assert route[1]["sequence"] == 2

def test_logistics_route(client):
    res = client.post('/ai/logistics/optimize-route', json={
        "driver_location": {"lat": 19.99, "lng": 73.78},
        "orders": [
            {"id": "1", "lat": 20.01, "lng": 73.79, "address": "Stop A"},
            {"id": "2", "lat": 19.95, "lng": 73.75, "address": "Stop B"}
        ]
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "clusters" in data["data"]
