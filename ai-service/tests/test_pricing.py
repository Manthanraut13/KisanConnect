# Unit tests for PriceRecommender and pricing route
import pytest
from app import create_app
from app.models.price_recommender import PriceRecommender

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_price_recommender_basic():
    recommender = PriceRecommender()
    result = recommender.recommend(crop_name="Tomato", district="Nashik", quantity_kg=100, quality_grade="A", is_organic=False)

    assert result is not None
    assert "min_price" in result
    assert "recommended_price" in result
    assert "max_price" in result
    assert "rationale" in result
    assert result["min_price"] < result["recommended_price"] < result["max_price"]

def test_price_recommender_organic_premium():
    recommender = PriceRecommender()
    regular = recommender.recommend(crop_name="Tomato", district="Nashik", quantity_kg=100, quality_grade="B", is_organic=False)
    organic = recommender.recommend(crop_name="Tomato", district="Nashik", quantity_kg=100, quality_grade="B", is_organic=True)

    assert organic["recommended_price"] > regular["recommended_price"]

def test_pricing_route(client):
    res = client.post('/ai/price/recommend', json={
        "crop_name": "Tomato",
        "district": "Nashik",
        "quantity_kg": 100,
        "quality_grade": "A"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "recommended_price" in data["data"]
