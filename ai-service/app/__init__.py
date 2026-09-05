# Flask application factory setup for Kisan Connect AI Microservice
import os
from flask import Flask
from flask_cors import CORS

def create_app():
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    
    # Configure CORS to allow access from Backend (Port 5000) and Frontend (Port 3000)
    CORS(app, origins=[
        os.getenv('BACKEND_URL', 'http://localhost:5000'),
        os.getenv('FRONTEND_URL', 'http://localhost:3000'),
    ])
    
    # Import blueprints
    from app.routes.forecast import forecast_bp
    from app.routes.pricing import pricing_bp
    from app.routes.logistics import logistics_bp
    from app.routes.chatbot import chatbot_bp
    
    # Register blueprints with specified route prefixes as per architecture
    app.register_blueprint(forecast_bp, url_prefix='/ai/forecast')
    app.register_blueprint(pricing_bp, url_prefix='/ai/price')
    app.register_blueprint(logistics_bp, url_prefix='/ai/logistics')
    app.register_blueprint(chatbot_bp, url_prefix='/ai/chatbot')
    
    # Health check endpoint for deployment monitoring (Railway / Render)
    @app.route('/health')
    def health():
        return {'status': 'ok', 'service': 'kisan-connect-ai'}, 200
        
    return app
