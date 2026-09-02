# TASK.md — Siddhesh
## AI/ML Service: Demand Forecasting + Price Recommendation + Route Optimization + Chatbot

---

## ASSIGNED MODULES

| # | Module | Priority | Est. Days |
|---|---|---|---|
| 1 | AI Service Setup (Flask + Structure) | CRITICAL | 0.5 |
| 2 | Data Loading + Preprocessing | CRITICAL | 0.5 |
| 3 | Demand Forecasting API | CRITICAL | 2 |
| 4 | Price Recommendation API | HIGH | 1 |
| 5 | Route Optimization API | HIGH | 1.5 |
| 6 | Chatbot API (Kisan Mitra) | HIGH | 1.5 |
| 7 | Batch Forecast Endpoint | MEDIUM | 0.5 |
| 8 | Deployment to Railway.app | MEDIUM | 0.5 |
| **Total** | | | **~8 days** |

---

## MODULE 1 — AI SERVICE SETUP

### Folder Structure to Create

```
ai-service/
├── app/
│   ├── __init__.py              (Flask app factory)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── forecast.py          (Demand forecast endpoints)
│   │   ├── pricing.py           (Price recommendation endpoints)
│   │   ├── logistics.py         (Route optimization endpoints)
│   │   └── chatbot.py           (Chatbot endpoints)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── demand_forecaster.py  (Prophet wrapper class)
│   │   ├── price_recommender.py  (Price logic class)
│   │   └── route_optimizer.py    (K-Means + TSP class)
│   ├── data/
│   │   ├── agmarknet_sample.csv  (Historical price data)
│   │   ├── crop_calendar.json    (Crop seasonal data)
│   │   └── district_coords.json  (Lat/lng for 10 districts)
│   └── utils/
│       ├── data_loader.py        (CSV loading + caching)
│       ├── geocoder.py           (Haversine distance)
│       └── response.py           (Standard response helpers)
├── notebooks/
│   ├── 01_EDA_Agmarknet.ipynb
│   ├── 02_Demand_Forecasting.ipynb
│   └── 03_Route_Optimization.ipynb
├── tests/
│   ├── test_forecasting.py
│   ├── test_pricing.py
│   └── test_routing.py
├── requirements.txt
├── run.py
├── railway.json
├── .env
└── .env.example
```

### Init Commands

```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install flask flask-cors prophet scikit-learn pandas numpy geopy requests groq google-generativeai python-dotenv gunicorn
pip freeze > requirements.txt
```

### `run.py`

```python
import os
from dotenv import load_dotenv
load_dotenv()
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')
```

### `app/__init__.py`

```python
import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, origins=[
        os.getenv('BACKEND_URL', 'http://localhost:5000'),
        os.getenv('FRONTEND_URL', 'http://localhost:3000'),
    ])
    
    from app.routes.forecast import forecast_bp
    from app.routes.pricing import pricing_bp
    from app.routes.logistics import logistics_bp
    from app.routes.chatbot import chatbot_bp
    
    app.register_blueprint(forecast_bp, url_prefix='/ai/forecast')
    app.register_blueprint(pricing_bp, url_prefix='/ai/price')
    app.register_blueprint(logistics_bp, url_prefix='/ai/logistics')
    app.register_blueprint(chatbot_bp, url_prefix='/ai/chatbot')
    
    @app.route('/health')
    def health():
        return {'status': 'ok', 'service': 'kisan-connect-ai'}, 200
    
    return app
```

---

## MODULE 2 — DATA LOADING

### Download Agmarknet Data

Steps:
1. Go to `https://agmarknet.gov.in`
2. Navigate to "Price Data" → "Reports" → download CSV for:
   - Each of the 20 crops × 10 districts combinations
   - Date range: 2024-01-01 to 2026-08-31
3. Combine all CSVs into one: `ai-service/app/data/agmarknet_sample.csv`

**Alternative:** If Agmarknet CSV download is cumbersome, generate realistic synthetic data:

Use OpenCode prompt:
```
"Generate Python code that creates a realistic synthetic CSV file at 
'app/data/agmarknet_sample.csv' with columns: 
date,state,district,market,commodity,variety,min_price,max_price,modal_price,unit
Fill it with 2.5 years of daily data (2024-01-01 to 2026-08-31) for these 20 crops × 10 districts.
Crops: Tomato, Onion, Potato, Rice, Wheat, Maize, Chili, Turmeric, Banana, Mango,
Brinjal, Cabbage, Cauliflower, Garlic, Ginger, Groundnut, Soybean, Coconut, Sugarcane, Cotton.
Districts: Nashik(Maharashtra), Pune(Maharashtra), Amritsar(Punjab), Ludhiana(Punjab),
Coimbatore(Tamil Nadu), Mysuru(Karnataka), Guntur(Andhra Pradesh),
Jaipur(Rajasthan), Indore(Madhya Pradesh), Varanasi(Uttar Pradesh).
Price ranges must be realistic (Tomato: 800-2500 Rs/quintal, Onion: 400-1800, etc.)
Include weekly seasonality and annual seasonality in price patterns.
Generate using pandas with random but realistic variation."
```

### `app/utils/data_loader.py`

```python
import pandas as pd
import os

_df_cache = None

def get_price_data():
    """Load Agmarknet CSV with caching"""
    global _df_cache
    if _df_cache is not None:
        return _df_cache
    
    csv_path = os.path.join(os.path.dirname(__file__), '../data/agmarknet_sample.csv')
    df = pd.read_csv(csv_path, parse_dates=['date'])
    df['modal_price'] = pd.to_numeric(df['modal_price'], errors='coerce')
    df = df.dropna(subset=['modal_price', 'date'])
    # Normalize: modal_price is in Rs/quintal, convert to Rs/kg
    df['price_per_kg'] = df['modal_price'] / 100
    
    _df_cache = df
    return df

def get_crop_data(crop_name: str, district: str, min_records: int = 30):
    """Get filtered crop+district data"""
    df = get_price_data()
    filtered = df[
        (df['commodity'].str.lower() == crop_name.lower()) &
        (df['district'].str.lower() == district.lower())
    ].sort_values('date')
    
    if len(filtered) < min_records:
        return None  # Signal to use fallback
    return filtered
```

### `app/data/district_coords.json`

```json
{
  "Nashik": { "lat": 20.0059, "lng": 73.7797, "state": "Maharashtra" },
  "Pune": { "lat": 18.5204, "lng": 73.8567, "state": "Maharashtra" },
  "Amritsar": { "lat": 31.6340, "lng": 74.8723, "state": "Punjab" },
  "Ludhiana": { "lat": 30.9010, "lng": 75.8573, "state": "Punjab" },
  "Coimbatore": { "lat": 11.0168, "lng": 76.9558, "state": "Tamil Nadu" },
  "Mysuru": { "lat": 12.2958, "lng": 76.6394, "state": "Karnataka" },
  "Guntur": { "lat": 16.3067, "lng": 80.4365, "state": "Andhra Pradesh" },
  "Jaipur": { "lat": 26.9124, "lng": 75.7873, "state": "Rajasthan" },
  "Indore": { "lat": 22.7196, "lng": 75.8577, "state": "Madhya Pradesh" },
  "Varanasi": { "lat": 25.3176, "lng": 82.9739, "state": "Uttar Pradesh" }
}
```

---

## MODULE 3 — DEMAND FORECASTING API

### `app/models/demand_forecaster.py`

Use OpenCode prompt:
```
"Generate a Python class DemandForecaster in app/models/demand_forecaster.py.
Methods:
- predict(crop_name: str, district: str, days_ahead: int = 7) -> dict
  Primary: Use Meta Prophet. Load data via get_crop_data(). Prepare prophet_df with columns 'ds' and 'y'
  (use price_per_kg as 'y'). Fit Prophet(yearly_seasonality=True, weekly_seasonality=True,
  changepoint_prior_scale=0.1). Predict days_ahead days. Return structured dict.
  Fallback: if Prophet fails or < 30 data points, use _moving_average_predict().
  Last resort: return _static_forecast().
- _moving_average_predict(df, days_ahead) -> dict: Calculate 30-day moving average, project forward.
- _static_forecast() -> dict: Return sample forecast with static data.
- _generate_advisory(forecast_df, current_avg) -> str: Rule-based advisory message.
- _calculate_demand_index(predicted_price, historical_avg) -> int: 0-100 index.
Output dict format: { forecast: [{date, predicted_price, lower_bound, upper_bound, demand_index, confidence}],
advisory: str, model_version: str }"
```

### `app/routes/forecast.py`

```python
from flask import Blueprint, request, jsonify
from app.models.demand_forecaster import DemandForecaster
import os

forecast_bp = Blueprint('forecast', __name__)
forecaster = DemandForecaster()  # Initialize once at module level (not per request)

@forecast_bp.route('/demand', methods=['POST'])
def get_demand_forecast():
    try:
        data = request.get_json()
        required = ['crop_name', 'district']
        for field in required:
            if not data or field not in data:
                return jsonify({'success': False, 'message': f'Missing: {field}'}), 400
        
        result = forecaster.predict(
            crop_name=data['crop_name'],
            district=data['district'],
            days_ahead=int(data.get('forecast_days', 7))
        )
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@forecast_bp.route('/batch', methods=['POST'])
def batch_forecast():
    """Called by Antigravity cron — refresh all forecasts"""
    # Verify secret
    secret = request.headers.get('x-antigravity-secret')
    if secret != os.getenv('ANTIGRAVITY_SECRET'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    from concurrent.futures import ThreadPoolExecutor
    CROPS = ['Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Maize', 'Chili', 'Turmeric',
             'Banana', 'Mango', 'Brinjal', 'Cabbage', 'Cauliflower', 'Garlic', 'Ginger',
             'Groundnut', 'Soybean', 'Coconut', 'Sugarcane', 'Cotton']
    DISTRICTS = ['Nashik', 'Pune', 'Amritsar', 'Ludhiana', 'Coimbatore',
                 'Mysuru', 'Guntur', 'Jaipur', 'Indore', 'Varanasi']
    
    results = {'processed': 0, 'failed': 0, 'errors': []}
    
    def run_one(crop, district):
        try:
            forecast = forecaster.predict(crop, district, 7)
            # POST to backend to save in DB
            import requests as req
            req.post(
                f"{os.getenv('BACKEND_URL')}/api/internal/forecasts/upsert",
                json={'crop_name': crop, 'district': district, 'forecast': forecast},
                headers={'x-internal-secret': os.getenv('INTERNAL_SECRET')},
                timeout=10
            )
            return True
        except Exception:
            return False
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(run_one, c, d) for c in CROPS for d in DISTRICTS]
        for f in futures:
            if f.result(): results['processed'] += 1
            else: results['failed'] += 1
    
    return jsonify({'success': True, 'data': results}), 200
```

---

## MODULE 4 — PRICE RECOMMENDATION API

### `app/models/price_recommender.py`

```python
class PriceRecommender:
    def recommend(self, crop_name, district, quantity_kg, quality_grade, is_organic, harvest_date):
        df = get_crop_data(crop_name, district, min_records=7)
        
        if df is None:
            return self._static_recommend(crop_name)
        
        # 30-day average
        recent = df[df['date'] >= df['date'].max() - pd.Timedelta(days=30)]
        base = recent['price_per_kg'].mean()
        
        # Adjustments
        grade_adj = {'A': 1.15, 'B': 1.0, 'C': 0.90}.get(quality_grade, 1.0)
        organic_adj = 1.20 if is_organic else 1.0
        quantity_adj = 0.95 if quantity_kg > 500 else 1.0
        
        recommended = base * grade_adj * organic_adj * quantity_adj
        
        return {
            'min_price': round(base * 0.85, 2),
            'recommended_price': round(recommended, 2),
            'max_price': round(base * 1.30, 2),
            'current_market_avg': round(base, 2),
            'rationale': f"Based on {len(recent)}-day {district} mandi prices for Grade {quality_grade} {crop_name}"
                         + (" with organic premium" if is_organic else "")
        }
```

### `app/routes/pricing.py`

Endpoint: `POST /ai/price/recommend`
Input: `{ crop_name, district, quantity_kg, quality_grade, is_organic, harvest_date }`
Output: `{ min_price, recommended_price, max_price, current_market_avg, rationale }`

---

## MODULE 5 — ROUTE OPTIMIZATION API

### `app/utils/geocoder.py`

```python
from math import radians, sin, cos, sqrt, atan2

def haversine(loc1, loc2):
    """Returns distance in kilometers between two {lat, lng} dicts"""
    R = 6371
    lat1, lon1 = radians(loc1['lat']), radians(loc1['lng'])
    lat2, lon2 = radians(loc2['lat']), radians(loc2['lng'])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))
```

### `app/models/route_optimizer.py`

Use OpenCode:
```
"Generate Python class RouteOptimizer in app/models/route_optimizer.py.
Methods:
- optimize(orders: list[dict], driver_location: dict) -> dict
  orders is list of {id, lat, lng, address}. driver_location is {lat, lng}.
  If len(orders) <= 3: skip clustering, just run greedy TSP on all.
  If len(orders) > 3: K-Means cluster into min(3, len//3) clusters.
  For each cluster: run _greedy_tsp(driver_location, cluster_orders).
  Return: { clusters: [{ cluster_id, optimized_route: [{ order_id, lat, lng, address, sequence, eta_minutes }],
                          total_km, total_minutes }] }
- _greedy_tsp(start, stops) -> list: Nearest-neighbor algorithm.
  Uses haversine from utils.geocoder. Return ordered stops list.
- _estimate_time(distance_km) -> int: distance_km / 25 * 60 (25 km/h avg city speed)"
```

### `app/routes/logistics.py`

Endpoint: `POST /ai/logistics/optimize-route`
Input: `{ orders: [...], driver_location: { lat, lng } }`
Output: Route clusters as described above.

---

## MODULE 6 — CHATBOT API

### `app/routes/chatbot.py`

```python
from flask import Blueprint, request, jsonify
from groq import Groq
import os

chatbot_bp = Blueprint('chatbot', __name__)
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

SYSTEM_PROMPTS = {
    'farmer': {
        'en': "You are Kisan Mitra, a friendly AI assistant for Kisan Connect marketplace. "
               "Help farmers with: listing produce, understanding demand forecasts, checking prices, logistics. "
               "Keep responses under 3 sentences. Be warm and simple.",
        'hi': "आप Kisan Mitra हैं - Kisan Connect marketplace के लिए एक मित्रवत AI सहायक। "
               "किसानों की मदद करें: अनाज/सब्जी लिस्टिंग, मांग पूर्वानुमान, कीमतें, लॉजिस्टिक्स। "
               "जवाब 3 वाक्यों में दें। सरल और मित्रवत रहें।"
    },
    'consumer': {
        'en': "You are Kisan Mitra, helping consumers on Kisan Connect find fresh farm produce. "
               "Help with: browsing products, placing orders, tracking delivery, returns. Short and helpful.",
        'hi': "आप Kisan Mitra हैं - Kisan Connect पर खरीदारों की मदद करते हैं। "
               "ताजा उत्पाद खोजना, ऑर्डर करना, डिलीवरी ट्रैक करना में सहायता करें। संक्षिप्त और सहायक रहें।"
    },
    'default': {
        'en': "You are Kisan Mitra, AI assistant for Kisan Connect marketplace. Be helpful and brief.",
        'hi': "आप Kisan Mitra हैं - Kisan Connect के AI सहायक। सहायक और संक्षिप्त रहें।"
    }
}

@chatbot_bp.route('/query', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        language = data.get('language', 'en')
        user_role = data.get('user_role', 'default')
        history = data.get('conversation_history', [])[-6:]  # Last 3 turns only (keep context short)
        
        if not message:
            return jsonify({'success': False, 'message': 'Empty message'}), 400
        
        role_prompts = SYSTEM_PROMPTS.get(user_role, SYSTEM_PROMPTS['default'])
        system_prompt = role_prompts.get(language, role_prompts['en'])
        
        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(history)
        messages.append({'role': 'user', 'content': message})
        
        response = groq_client.chat.completions.create(
            model='llama-3.1-8b-instant',
            messages=messages,
            max_tokens=300,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        return jsonify({'success': True, 'data': { 'response': reply, 'is_fallback': False }}), 200
    
    except Exception as e:
        # Fallback response
        fallback = "मुझे अभी तकनीकी समस्या है। कृपया बाद में प्रयास करें।" if language == 'hi' \
                   else "I'm having a technical issue. Please try again shortly."
        return jsonify({'success': True, 'data': { 'response': fallback, 'is_fallback': True }}), 200
```

---

## MODULE 7 — TESTING

### `tests/test_forecasting.py`

Use OpenCode to generate:
```
"Generate pytest test file for DemandForecaster class.
Test cases:
1. test_predict_returns_correct_structure: Call predict('Tomato', 'Nashik', 7). Assert result has 'forecast' key with 7 items. Each item has: date, predicted_price, lower_bound, upper_bound, demand_index, confidence.
2. test_predict_unknown_crop_uses_fallback: Call predict('UnknownCrop', 'Nashik', 7). Should NOT raise exception, should return fallback data.
3. test_demand_index_in_range: All demand_index values should be between 0 and 100.
4. test_advisory_is_string: advisory field should be a non-empty string."
```

Run tests: `pytest tests/ -v`

---

## MODULE 8 — DEPLOYMENT

### Railway.app Deployment Steps

1. Push `ai-service/` folder to GitHub (same repo, subfolder).
2. Go to railway.app → New Project → Deploy from GitHub.
3. Set root directory: `ai-service`.
4. Add environment variables in Railway dashboard.
5. Create `railway.json` in `ai-service/`:
```json
{ "build": { "builder": "nixpacks" }, "deploy": { "startCommand": "gunicorn run:app --bind 0.0.0.0:$PORT", "healthcheckPath": "/health" } }
```
6. First deploy takes ~8 minutes (Prophet installs pystan which compiles C++ code).
7. After deploy: test health endpoint.

### Environment Variables for Railway

```
GROQ_API_KEY=gsk_xxxx
GEMINI_API_KEY=AIza_xxxx
BACKEND_URL=https://kisan-connect-api.onrender.com
FRONTEND_URL=https://kisan-connect.vercel.app
ANTIGRAVITY_SECRET=<get from Manthan>
INTERNAL_SECRET=<get from Manthan>
FLASK_ENV=production
PORT=8000
```

---

## DELIVERABLES CHECKLIST

By Day 4 (needed by Tukesh for listing creation):
- [ ] `/ai/price/recommend` endpoint working and tested
- [ ] Service deployed on Railway.app
- [ ] Share Railway URL with Manthan + Tukesh

By Day 6:
- [ ] `/ai/forecast/demand` endpoint working with real Prophet model
- [ ] `/ai/logistics/optimize-route` endpoint working
- [ ] `/ai/chatbot/query` working in English and Hindi
- [ ] `/ai/forecast/batch` endpoint secured and working

By Day 7:
- [ ] All endpoints have passing pytest tests
- [ ] Jupyter notebooks showing model exploration committed to `/notebooks/`

---

*Task version: 1.0 | Siddhesh | Kisan Connect SIH 2026*
