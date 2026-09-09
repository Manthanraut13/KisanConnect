# Pricing route blueprint definitions
from flask import Blueprint, request
from app.models.price_recommender import PriceRecommender
from app.utils.response import success_response, error_response

pricing_bp = Blueprint('pricing', __name__)
recommender = PriceRecommender()

@pricing_bp.route('/recommend', methods=['POST'])
def recommend_price():
    """
    POST /ai/price/recommend
    Payload: { "crop_name": "Tomato", "district": "Nashik", "quantity_kg": 100, "quality_grade": "A", "is_organic": false }
    Returns: min_price, recommended_price, max_price, current_market_avg, rationale
    """
    try:
        data = request.get_json()
        if not data:
            return error_response(message="Missing request body", status_code=400)
            
        required_fields = ['crop_name', 'district', 'quantity_kg']
        for field in required_fields:
            if field not in data:
                return error_response(message=f"Missing required field: {field}", status_code=400)

        result = recommender.recommend(
            crop_name=str(data['crop_name']).strip(),
            district=str(data['district']).strip(),
            quantity_kg=float(data['quantity_kg']),
            quality_grade=data.get('quality_grade', 'B'),
            is_organic=bool(data.get('is_organic', False)),
            harvest_date=data.get('harvest_date')
        )

        return success_response(data=result, message="Price recommendation generated successfully")

    except Exception as e:
        return error_response(message=f"Failed to calculate price recommendation: {str(e)}", status_code=500)
