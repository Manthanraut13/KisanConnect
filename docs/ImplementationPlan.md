# IMPLEMENTATION PLAN — Siddhesh
## Day-by-Day Build Guide: Python AI Microservice

---

## PRE-START CHECKLIST

- [ ] Sign up for Groq Console → https://console.groq.com → Create API Key → save as `GROQ_API_KEY`
- [ ] Sign up for Google AI Studio → https://aistudio.google.com → Create API Key → save as `GEMINI_API_KEY`
- [ ] Sign up for Railway.app → https://railway.app → Connect GitHub account
- [ ] Install Python 3.11 locally
- [ ] Install VS Code + Python extension
- [ ] Clone the GitHub repo Manthan sets up on Day 1
- [ ] Get `BACKEND_URL`, `ANTIGRAVITY_SECRET`, `INTERNAL_SECRET` from Manthan after Day 2
- [ ] Download or generate Agmarknet CSV data (see Task.md Module 2)

---

## DAY 1 — AI SERVICE FOUNDATION + DATA LAYER

### Step 1: Create Virtual Environment and Install Dependencies
```bash
cd kisan-connect/ai-service
python -m venv venv
source venv/bin/activate
pip install flask flask-cors prophet scikit-learn pandas numpy geopy requests groq google-generativeai python-dotenv gunicorn
pip freeze > requirements.txt
```

### Step 2: Create Full Folder Structure
```bash
mkdir -p app/{routes,models,data,utils} notebooks tests
touch app/__init__.py app/routes/__init__.py app/models/__init__.py
touch app/utils/__init__.py
touch run.py railway.json .env .env.example
```

### Step 3: Create `run.py` and `app/__init__.py`
Copy exact code from Task.md Module 1.

### Step 4: Create `app/utils/data_loader.py`
Copy from Task.md Module 2.

### Step 5: Create `app/data/district_coords.json`
Copy from Task.md Module 2.

### Step 6: Generate or Download Agmarknet CSV

**Option A (Recommended for speed):** Use OpenCode to generate synthetic data:
```
Prompt: "Generate Python script generate_data.py that creates app/data/agmarknet_sample.csv
with 2.5 years of realistic daily mandi price data.
Columns: date,state,district,market,commodity,variety,min_price,max_price,modal_price,unit
20 crops × 10 districts = 200 combinations × ~900 days = ~180,000 rows.
Price in Rs/quintal. Include yearly and weekly seasonality patterns.
Tomato: base 1200, seasonal variation ±600. Onion: base 900, ±500. etc.
Use numpy random with seeds for reproducibility."
```
Run: `python generate_data.py` → confirms `agmarknet_sample.csv` created.

### Step 7: Create `app/utils/geocoder.py`
Copy Haversine function from Task.md Module 5.

### Step 8: Test Data Loading
```python
# Quick test in Python REPL
from app.utils.data_loader import get_price_data, get_crop_data
df = get_price_data()
print(f"Total rows: {len(df)}")
print(df.head())
tomato_nashik = get_crop_data('Tomato', 'Nashik')
print(f"Tomato+Nashik rows: {len(tomato_nashik)}")
```

**Commit: `feature/siddhesh/ai-foundation` — Day 1 end**

---

## DAY 2 — DEMAND FORECASTING

### Step 1: Create `app/models/demand_forecaster.py`

Use OpenCode with this prompt:
```
"Generate Python class DemandForecaster in app/models/demand_forecaster.py.
Imports: pandas, from prophet import Prophet, from app.utils.data_loader import get_crop_data.

Methods:
1. predict(crop_name: str, district: str, days_ahead: int = 7) -> dict
   - Call get_crop_data(crop_name, district). If None → call _moving_average_predict fallback.
   - Build prophet_df: df[['date','price_per_kg']].rename(columns={'date':'ds','price_per_kg':'y'})
   - Fit Prophet(yearly_seasonality=True, weekly_seasonality=True, changepoint_prior_scale=0.1,
                  interval_width=0.80)
   - future = model.make_future_dataframe(periods=days_ahead)
   - forecast = model.predict(future)
   - Take last days_ahead rows of forecast.
   - Compute historical_avg = df['price_per_kg'].tail(30).mean()
   - Build output: { forecast: [{ date (as string YYYY-MM-DD), predicted_price (yhat rounded 2dp),
                                   lower_bound (yhat_lower), upper_bound (yhat_upper),
                                   demand_index (0-100), confidence (0.80) }],
                     advisory: str, model_version: 'prophet-v1.1' }
   - Wrap in try/except: if any error, call _moving_average_predict.

2. _moving_average_predict(crop_name, district, days_ahead) -> dict
   - Get df. Compute 14-day rolling avg of price_per_kg.
   - Project forward: use last rolling avg value for all days.
   - Build same output structure with confidence: 0.50.

3. _static_forecast(days_ahead) -> dict
   - Return hardcoded sample data with confidence: 0.20.

4. _calculate_demand_index(predicted_price: float, historical_avg: float) -> int
   - ratio = predicted_price / historical_avg
   - Map: >1.2 → 85-100, 1.1-1.2 → 70-84, 0.9-1.1 → 40-69, <0.9 → 10-39
   - Return int in 0-100.

5. _generate_advisory(predicted_prices: list, historical_avg: float) -> str
   - Compare avg predicted to historical. Generate simple English advice string."
```

### Step 2: Create `app/routes/forecast.py`

Copy from Task.md Module 3 (both `/demand` and `/batch` endpoints).

### Step 3: Register Blueprint in `app/__init__.py`

### Step 4: Test Forecast Manually

```bash
# Start the service
python run.py

# In another terminal
curl -X POST http://localhost:8000/ai/forecast/demand \
  -H "Content-Type: application/json" \
  -d '{"crop_name": "Tomato", "district": "Nashik", "forecast_days": 7}'
```

Expected: JSON with 7-day forecast array. Fix any errors.

### Step 5: Write Tests
```bash
# tests/test_forecasting.py — use OpenCode to generate (see Task.md Module 7)
pytest tests/test_forecasting.py -v
```

**Commit: `feature/siddhesh/demand-forecast` — Day 2 end**

---

## DAY 3 — PRICE RECOMMENDATION + ROUTE OPTIMIZATION

### Morning: Price Recommendation

**Step 1:** Create `app/models/price_recommender.py`

Use OpenCode:
```
"Generate Python class PriceRecommender in app/models/price_recommender.py.
Method: recommend(crop_name, district, quantity_kg, quality_grade, is_organic, harvest_date) -> dict
Logic as described in Task.md Module 4.
Add _static_recommend(crop_name) fallback that returns: min=10, recommended=15, max=22, rationale='Static fallback'."
```

**Step 2:** Create `app/routes/pricing.py`
```python
from flask import Blueprint, request, jsonify
from app.models.price_recommender import PriceRecommender

pricing_bp = Blueprint('pricing', __name__)
recommender = PriceRecommender()

@pricing_bp.route('/recommend', methods=['POST'])
def recommend_price():
    try:
        data = request.get_json()
        required = ['crop_name', 'district', 'quantity_kg', 'quality_grade']
        for f in required:
            if f not in data:
                return jsonify({'success': False, 'message': f'Missing: {f}'}), 400
        result = recommender.recommend(
            crop_name=data['crop_name'],
            district=data['district'],
            quantity_kg=float(data['quantity_kg']),
            quality_grade=data.get('quality_grade', 'B'),
            is_organic=data.get('is_organic', False),
            harvest_date=data.get('harvest_date')
        )
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
```

**Step 3: Test**
```bash
curl -X POST http://localhost:8000/ai/price/recommend \
  -H "Content-Type: application/json" \
  -d '{"crop_name":"Tomato","district":"Nashik","quantity_kg":100,"quality_grade":"A","is_organic":false}'
```

### Afternoon: Route Optimization

**Step 1:** Create `app/models/route_optimizer.py`

Use OpenCode prompt from Task.md Module 5.

**Step 2:** Create `app/routes/logistics.py`
```python
from flask import Blueprint, request, jsonify
from app.models.route_optimizer import RouteOptimizer

logistics_bp = Blueprint('logistics', __name__)
optimizer = RouteOptimizer()

@logistics_bp.route('/optimize-route', methods=['POST'])
def optimize_route():
    try:
        data = request.get_json()
        if 'orders' not in data or 'driver_location' not in data:
            return jsonify({'success': False, 'message': 'Missing orders or driver_location'}), 400
        if len(data['orders']) == 0:
            return jsonify({'success': False, 'message': 'No orders provided'}), 400
        result = optimizer.optimize(
            orders=data['orders'],
            driver_location=data['driver_location']
        )
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
```

**Step 3: Test with sample data**
```bash
curl -X POST http://localhost:8000/ai/logistics/optimize-route \
  -H "Content-Type: application/json" \
  -d '{
    "driver_location": {"lat": 19.99, "lng": 73.78},
    "orders": [
      {"id":"1","lat":20.01,"lng":73.79,"address":"Street A"},
      {"id":"2","lat":19.95,"lng":73.75,"address":"Street B"},
      {"id":"3","lat":20.05,"lng":73.82,"address":"Street C"},
      {"id":"4","lat":19.98,"lng":73.80,"address":"Street D"}
    ]
  }'
```

Expected: JSON with optimized cluster(s) and ordered stops.

**Commit: `feature/siddhesh/price-and-routing` — Day 3 end**

---

## DAY 4 — CHATBOT API

### Step 1: Verify Groq API Key Works
```python
import os
from groq import Groq
client = Groq(api_key="your_key")
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role":"user","content":"Say hello in Hindi in one sentence."}],
    max_tokens=100
)
print(response.choices[0].message.content)
```

Expected: A Hindi greeting.

### Step 2: Create `app/routes/chatbot.py`

Copy from Task.md Module 6. This is the complete file with system prompts in both languages.

### Step 3: Register chatbot_bp in `app/__init__.py`

### Step 4: Test in English and Hindi

```bash
# English test
curl -X POST http://localhost:8000/ai/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I list my tomatoes?","language":"en","user_role":"farmer","conversation_history":[]}'

# Hindi test
curl -X POST http://localhost:8000/ai/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message":"मुझे टमाटर कैसे लिस्ट करने हैं?","language":"hi","user_role":"farmer","conversation_history":[]}'
```

### Step 5: Test Fallback (Temporarily Break API Key)
- Set `GROQ_API_KEY=invalid` in .env.
- Call chatbot endpoint.
- Verify it returns fallback response without crashing.
- Restore correct key.

### Step 6: Add Conversation History Test
- Send 3 messages in sequence passing `conversation_history` from previous responses.
- Verify context is maintained (chatbot remembers earlier messages).

**Commit: `feature/siddhesh/chatbot` — Day 4 end**

---

## DAY 5 — BATCH ENDPOINT + ALL TESTS + JUPYTER NOTEBOOKS

### Step 1: Complete the Batch Forecast Endpoint

The `/ai/forecast/batch` endpoint is already partially written in Task.md Module 3.

Add the internal call to POST results to backend:
```python
import requests as http_client

def save_forecast_to_backend(crop, district, forecast_data):
    try:
        resp = http_client.post(
            f"{os.getenv('BACKEND_URL')}/api/internal/forecasts/upsert",
            json={
                'crop_name': crop,
                'district': district,
                'forecast': forecast_data['forecast'],
                'model_version': forecast_data.get('model_version', 'prophet-v1.1')
            },
            headers={'x-internal-secret': os.getenv('INTERNAL_SECRET')},
            timeout=10
        )
        return resp.status_code == 200
    except Exception:
        return False  # Don't crash the whole batch if one save fails
```

### Step 2: Complete All Tests

Generate test files using OpenCode:
- `tests/test_forecasting.py` — 4 tests (see Task.md Module 7)
- `tests/test_pricing.py` — Test recommend returns correct structure, test organic premium applied, test fallback
- `tests/test_routing.py` — Test optimize returns clusters, test single order skips clustering

Run all: `pytest tests/ -v --tb=short`

Target: All tests pass.

### Step 3: Create Jupyter Notebooks

**`notebooks/01_EDA_Agmarknet.ipynb`:**
- Load CSV, show shape, unique crops, unique districts.
- Plot price trend for Tomato in Nashik over time.
- Show seasonal pattern (monthly average price).
- This notebook proves the data is real and usable.

**`notebooks/02_Demand_Forecasting.ipynb`:**
- Show Prophet model fitting for Tomato in Nashik.
- Plot forecast with confidence intervals.
- Show `model.plot_components(forecast)` — seasonal decomposition.
- This impresses SIH judges with the AI methodology.

**`notebooks/03_Route_Optimization.ipynb`:**
- Generate 10 random delivery points on a map.
- Show K-Means clustering (plot with different colors per cluster).
- Show greedy TSP route on each cluster.
- Calculate total distance before and after optimization.
- Show percentage improvement.

Use `matplotlib` and `folium` (for maps) in notebooks.

---

## DAY 6 — DEPLOYMENT + INTEGRATION

### Step 1: Deploy to Railway.app

```bash
# Ensure railway.json exists in ai-service/
cat railway.json
# {"build":{"builder":"nixpacks"},"deploy":{"startCommand":"gunicorn run:app --bind 0.0.0.0:$PORT","healthcheckPath":"/health"}}
```

1. Go to railway.app → New Project → Deploy from GitHub repo.
2. Set **Root Directory** = `ai-service`.
3. Add all environment variables from the list in Task.md Module 8.
4. Click Deploy. Wait 8–10 minutes for first build.
5. Once deployed, note the URL (e.g., `kisan-connect-ai.railway.app`).
6. Share URL with Manthan and Tukesh immediately.

### Step 2: Test Deployed Endpoints

```bash
BASE="https://kisan-connect-ai.railway.app"

# Health check
curl $BASE/health

# Price recommendation
curl -X POST $BASE/ai/price/recommend \
  -H "Content-Type: application/json" \
  -d '{"crop_name":"Onion","district":"Nashik","quantity_kg":200,"quality_grade":"A","is_organic":false}'

# Demand forecast
curl -X POST $BASE/ai/forecast/demand \
  -H "Content-Type: application/json" \
  -d '{"crop_name":"Tomato","district":"Nashik","forecast_days":7}'

# Chatbot
curl -X POST $BASE/ai/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"message":"What crops are in demand this week?","language":"en","user_role":"farmer","conversation_history":[]}'
```

All should return `{ "success": true, "data": {...} }`.

### Step 3: Integration Test with Backend

Ask Tukesh to:
- Create a test listing and confirm he receives AI price recommendation from your deployed service.

Ask Sunidhi to:
- Load the Demand Forecast dashboard and confirm charts are populated.

Ask Pratham to:
- Test the chatbot widget against your deployed endpoint.

---

## DAY 7 — BUFFER + DEMO PREP

- Fix any bugs found during integration testing.
- Optimize: if Prophet model is taking > 5 seconds per prediction, cache last prediction in a dict (`_forecast_cache`) with 1-hour TTL.
- Prepare 5 demo scenarios for SIH judges:
  1. Price recommendation for Tomato Grade A Nashik.
  2. 7-day demand forecast for Onion Nashik (show rising price advisory).
  3. Route optimization for 6 delivery points.
  4. Chatbot — English query about listing.
  5. Chatbot — Hindi query about prices.
- Commit all notebooks.

---

## COMMIT SCHEDULE

| Day | Branch | What to commit |
|---|---|---|
| Day 1 | `feature/siddhesh/ai-foundation` | Flask setup + data layer + district_coords.json |
| Day 2 | `feature/siddhesh/demand-forecast` | DemandForecaster + /forecast/demand endpoint + tests |
| Day 3 | `feature/siddhesh/price-and-routing` | PriceRecommender + RouteOptimizer + endpoints + tests |
| Day 4 | `feature/siddhesh/chatbot` | Chatbot route + both language system prompts |
| Day 5 | `feature/siddhesh/batch-and-notebooks` | Batch endpoint + all tests passing + notebooks |
| Day 6 | `dev` | PR merged after Railway deployment confirmed |
| Day 7 | `main` | Final stable build |

---

*Implementation Plan v1.0 | Siddhesh | Kisan Connect SIH 2026*
