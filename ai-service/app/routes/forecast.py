# Demand forecasting route blueprint definitions
import os
from flask import Blueprint, request
from app.models.demand_forecaster import DemandForecaster
from app.utils.response import success_response, error_response

forecast_bp = Blueprint('forecast', __name__)
forecaster = DemandForecaster()  # Initialize once at module level

@forecast_bp.route('/demand', methods=['POST'])
def get_demand_forecast():
    """
    POST /ai/forecast/demand
    Payload: { "crop_name": "Tomato", "district": "Nashik", "forecast_days": 7 }
    Returns: 7-day predicted price, bounds, demand index, and crop advisory.
    """
    try:
        data = request.get_json()
        if not data or 'crop_name' not in data or 'district' not in data:
            return error_response(message="Missing required fields: crop_name and district", status_code=400)
            
        crop_name = str(data['crop_name']).strip()
        district = str(data['district']).strip()
        forecast_days = int(data.get('forecast_days', 7))

        result = forecaster.predict(crop_name=crop_name, district=district, days_ahead=forecast_days)
        return success_response(data=result, message="Demand forecast generated successfully")
        
    except Exception as e:
        return error_response(message=f"Failed to generate demand forecast: {str(e)}", status_code=500)

@forecast_bp.route('/batch', methods=['POST'])
def batch_forecast():
    """
    POST /ai/forecast/batch
    Headers: { "x-antigravity-secret": "<secret>" }
    Triggered by Antigravity daily cron job to refresh forecasts across all 20 crops and 10 districts.
    """
    secret = request.headers.get('x-antigravity-secret')
    expected_secret = os.getenv('ANTIGRAVITY_SECRET')
    
    if expected_secret and secret != expected_secret:
        return error_response(message="Unauthorized: Invalid Antigravity secret header", status_code=401)
        
    from concurrent.futures import ThreadPoolExecutor
    
    CROPS = [
        'Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Chili', 'Turmeric',
        'Banana', 'Mango', 'Brinjal', 'Cabbage', 'Cauliflower', 'Garlic', 'Ginger',
        'Groundnut', 'Soybean', 'Coconut', 'Sugarcane', 'Cotton'
    ]
    DISTRICTS = [
        'Nashik', 'Pune', 'Amritsar', 'Ludhiana', 'Coimbatore',
        'Mysuru', 'Guntur', 'Jaipur', 'Indore', 'Varanasi'
    ]
    
    results = {'processed': 0, 'failed': 0}
    
    def process_combination(crop, dist):
        try:
            fc = forecaster.predict(crop, dist, days_ahead=7)
            return True
        except Exception:
            return False

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_combination, c, d) for c in CROPS for d in DISTRICTS]
        for f in futures:
            if f.result():
                results['processed'] += 1
            else:
                results['failed'] += 1

    return success_response(data=results, message="Batch forecast refresh completed")
