# Logistics and route optimization blueprint definitions
from flask import Blueprint, request
from app.models.route_optimizer import RouteOptimizer
from app.utils.response import success_response, error_response

logistics_bp = Blueprint('logistics', __name__)
optimizer = RouteOptimizer()

@logistics_bp.route('/optimize-route', methods=['POST'])
def optimize_route():
    """
    POST /ai/logistics/optimize-route
    Payload: { "driver_location": { "lat": 19.99, "lng": 73.78 }, "orders": [{ "id": "1", "lat": 20.01, "lng": 73.79, "address": "..." }] }
    Returns: Clustered optimized routes with ordered stops, total distance in km, and ETA in minutes.
    """
    try:
        data = request.get_json()
        if not data:
            return error_response(message="Missing request body", status_code=400)

        orders = data.get('orders', [])
        driver_location = data.get('driver_location')

        if not driver_location or 'lat' not in driver_location or 'lng' not in driver_location:
            return error_response(message="Missing driver_location with lat and lng", status_code=400)

        if not orders or not isinstance(orders, list) or len(orders) == 0:
            return error_response(message="Missing or empty orders list", status_code=400)

        result = optimizer.optimize(orders=orders, driver_location=driver_location)
        return success_response(data=result, message="Delivery route optimized successfully")

    except Exception as e:
        return error_response(message=f"Failed to optimize route: {str(e)}", status_code=500)
