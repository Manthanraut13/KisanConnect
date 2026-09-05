import os
import time
from app import create_app

app = create_app()

def test_live_routes():
    print("Testing live Flask AI Service endpoints...")
    with app.test_client() as client:
        # 1. Health check
        res = client.get('/health')
        print(f"[1/7] Health check status: {res.status_code} -> {res.get_json()['status']}")
        assert res.status_code == 200

        # 2. Demand Forecast
        res = client.post('/ai/forecast/demand', json={"crop_name": "Tomato", "district": "Nashik", "forecast_days": 7})
        print(f"[2/7] Demand Forecast status: {res.status_code} -> Crop: {res.get_json()['data']['crop_name']}")
        assert res.status_code == 200

        # 3. Batch Forecast
        res = client.post('/ai/forecast/batch')
        print(f"[3/7] Batch Forecast status: {res.status_code} -> Processed: {res.get_json()['data']['processed']} combinations")
        assert res.status_code == 200

        # 4. Price Recommendation
        res = client.post('/ai/price/recommend', json={"crop_name": "Tomato", "district": "Nashik", "quantity_kg": 100, "quality_grade": "A", "is_organic": True})
        print(f"[4/7] Price Recommendation status: {res.status_code} -> Rec Price: Rs.{res.get_json()['data']['recommended_price']}/kg")
        assert res.status_code == 200

        # 5. Route Optimization
        res = client.post('/ai/logistics/optimize-route', json={
            "driver_location": {"lat": 19.99, "lng": 73.78},
            "orders": [
                {"id": "ord-101", "lat": 20.01, "lng": 73.79, "address": "Mandi Gate 1"},
                {"id": "ord-102", "lat": 19.95, "lng": 73.75, "address": "Cold Storage Hub"}
            ]
        })
        print(f"[5/7] Route Optimization status: {res.status_code} -> Clusters: {len(res.get_json()['data']['clusters'])}, Total Km: {res.get_json()['data']['clusters'][0]['total_km']}km")
        assert res.status_code == 200

        # 6. Chatbot Text Query (English, Hindi, Marathi)
        for lang in ['en', 'hi', 'mr']:
            res = client.post('/ai/chatbot/query', json={"message": "Help me list crops", "language": lang, "user_role": "farmer"})
            print(f"[6/7] Chatbot ({lang}) status: {res.status_code}")
            assert res.status_code == 200

        # 7. Chatbot Voice Query
        res = client.post('/ai/chatbot/voice', json={"transcript": "Crop prices", "language": "en", "user_role": "farmer"})
        print(f"[7/7] Chatbot Voice status: {res.status_code} -> Provider: {res.get_json()['data']['tts_provider']}")
        assert res.status_code == 200

    print("\nALL 7 AI MICROSERVICE FEATURE ENDPOINTS ARE 100% OPERATIONAL AND READY FOR DEPLOYMENT!")

if __name__ == '__main__':
    test_live_routes()
