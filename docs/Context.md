# CONTEXT.md — Siddhesh
## Full Project Context + AI Service Specific Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect is an AI-powered direct farm-to-consumer marketplace. Indian farmers earn only 15–30% of consumer prices due to 10+ middlemen. We eliminate these by giving farmers a direct digital platform.

### Prototype Must Demonstrate
1. Farmer creates listing → sees AI-recommended price.
2. Consumer orders, pays via Razorpay test mode.
3. **Demand Forecast Dashboard** — 7-day crop price predictions (YOUR WORK — judges will see this).
4. **Route Optimization Map** — showing clustered delivery orders (YOUR WORK).
5. **Chatbot (Kisan Mitra)** responding in Hindi and English (YOUR WORK).
6. Admin panel with metrics.

### Tech Stack (Full)
- Frontend: React.js + Vite + Tailwind + Leaflet
- Backend: Node.js + Express + Sequelize + PostgreSQL
- **AI Service: Python Flask + Prophet + scikit-learn + Groq API** ← YOUR LAYER
- Database: PostgreSQL (Supabase) + Redis (Upstash)
- Images: Cloudinary
- Hosting: Vercel (frontend) + Render.com (backend) + **Railway.app (your AI service)**
- AI Tools: OpenCode (code gen) + Antigravity (workflow, Manthan) + Omniroute (routing, Tukesh)

### Team & Interface Points
| Member | Module | How they touch your service |
|---|---|---|
| Manthan | Backend Auth + DB + Antigravity | Antigravity calls your `/ai/forecast/batch` daily |
| **Siddhesh** | **AI Service (you)** | — |
| Tukesh | Marketplace Backend | Calls your `/ai/price/recommend` when listing is created |
| Sunidhi | Frontend Farmer | Fetches from `/ai/forecast/demand` for dashboard charts |
| Payal | Frontend Consumer | No direct calls to AI service |
| Pratham | Frontend Admin + Chatbot | Calls your `/ai/chatbot/query` from chatbot widget |

---

## PART B — SIDDHESH'S SPECIFIC CONTEXT

### B.1 Data Source for Prototype

**Agmarknet Data (Free Government API/CSV):**
- Agmarknet provides historical crop price data from Indian mandis.
- For prototype: download the CSV export from `agmarknet.gov.in` for the following:
  - Crops: Tomato, Onion, Potato, Rice, Wheat, Maize, Chili, Turmeric, Banana, Mango, Brinjal, Cabbage, Cauliflower, Garlic, Ginger, Groundnut, Soybean, Cotton, Sugarcane, Coconut (20 crops).
  - Districts: Nashik, Pune, Amritsar, Ludhiana, Coimbatore, Mysuru, Guntur, Jaipur, Indore, Varanasi (10 districts).
  - Period: January 2024 – August 2026 (2.5 years of data).
- Store as: `ai-service/data/agmarknet_sample.csv`
- CSV columns: `date, state, district, market, commodity, variety, min_price, max_price, modal_price, unit`

**Open-Meteo Weather Data (Free, no key needed):**
- Used for seasonal crop advisory.
- API: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,precipitation_sum&forecast_days=7`
- No API key needed.

### B.2 Prophet Demand Forecasting — How It Works

**Input:** `{ crop_name: "Tomato", district: "Nashik", forecast_days: 7 }`

**Process:**
1. Filter CSV for `commodity = "Tomato"` AND `district = "Nashik"`.
2. Rename columns to `ds` (date) and `y` (modal_price) — Prophet requires this.
3. If fewer than 30 data points, return moving average fallback.
4. Fit Prophet model with: `yearly_seasonality=True, weekly_seasonality=True`.
5. Predict next `forecast_days` days.
6. Scale demand_index: normalize price change to 0–100 index.
7. Generate human-readable advisory string using simple rule: if predicted price > current avg + 10% → "Prices rising, good time to sell". If predicted < avg - 10% → "Prices falling, consider storing or selling quickly."

**Output:**
```json
{
  "success": true,
  "data": {
    "crop_name": "Tomato",
    "district": "Nashik",
    "forecast": [
      {
        "date": "2026-09-01",
        "predicted_price": 18.5,
        "lower_bound": 14.2,
        "upper_bound": 22.8,
        "demand_index": 72,
        "confidence": 0.85
      }
    ],
    "advisory": "Tomato prices expected to rise 12% this week. Good time to sell.",
    "model_version": "prophet-v1.1"
  }
}
```

### B.3 Price Recommendation — How It Works

**Input:** `{ crop_name, quantity_kg, quality_grade, district, harvest_date, is_organic }`

**Process (rule-based for prototype, ML for final):**
1. Get last 30 days average `modal_price` for crop + district from CSV.
2. Base price = 30-day average.
3. Quality adjustment: Grade A = base × 1.15, Grade B = base × 1.0, Grade C = base × 0.90.
4. Organic adjustment: if `is_organic = true`, × 1.20.
5. Quantity adjustment: if `quantity_kg > 500`, × 0.95 (bulk discount signal).
6. Freshness: if `harvest_date = today`, × 1.05.
7. Return: min = base × 0.85, recommended = adjusted, max = base × 1.30.

**Output:**
```json
{
  "success": true,
  "data": {
    "min_price": 14.0,
    "recommended_price": 18.5,
    "max_price": 24.0,
    "current_market_avg": 16.2,
    "rationale": "Based on 30-day Nashik mandi prices for Grade A Tomato with organic premium"
  }
}
```

### B.4 Route Optimization — How It Works

**Input:** `{ orders: [{ id, lat, lng, address }], driver_location: { lat, lng } }`

**Process (prototype — K-Means + Greedy TSP):**
1. Extract coordinates from all orders.
2. K-Means cluster if > 5 orders (up to 3 clusters for prototype).
3. For each cluster: run nearest-neighbor greedy TSP starting from driver_location.
4. Calculate total distance using Haversine formula between stops.
5. Estimate time: distance_km / 25 (assumed average city speed 25 km/h).
6. Return ordered list of stops with estimated arrival times.

**Output:**
```json
{
  "success": true,
  "data": {
    "clusters": [
      {
        "cluster_id": 1,
        "optimized_route": [
          { "order_id": "uuid-1", "address": "...", "lat": 19.99, "lng": 73.78, "sequence": 1, "eta_minutes": 15 },
          { "order_id": "uuid-2", "address": "...", "lat": 20.01, "lng": 73.79, "sequence": 2, "eta_minutes": 28 }
        ],
        "total_km": 12.4,
        "total_minutes": 45
      }
    ]
  }
}
```

### B.5 Chatbot (Kisan Mitra) — How It Works

**Using Groq API (Free — LLaMA 3.1 8B):**
- Free tier: 14,400 requests/day, 6000 tokens/minute.
- Model: `llama-3.1-8b-instant` (fastest, lowest latency).

**Input:**
```json
{
  "message": "मुझे टमाटर की कीमत कितनी रखनी चाहिए?",
  "language": "hi",
  "user_role": "farmer",
  "conversation_history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**System Prompt (fill dynamically based on role/language):**
```
You are Kisan Mitra, a friendly AI assistant for Kisan Connect — India's direct farm-to-consumer marketplace.
The user is a: {user_role}
Respond in: {language} (if Hindi, use simple Hindi mixed with common English words, not formal Sanskrit-heavy Hindi)
Your personality: Warm, simple, like talking to a helpful village friend. Use short sentences.
You help with:
- For farmers: How to list produce, understanding demand forecast, logistics queries, earnings.
- For consumers: Finding products, order tracking, payment queries, returns.
- For logistics: Assignment queries, proof of delivery.
Always stay on-topic about Kisan Connect. If asked about politics or other topics, politely redirect.
If user wants to file a complaint: ask for order ID and issue description, then say "मैं आपकी शिकायत दर्ज कर रहा हूँ" and return a structured { action: "file_grievance", data: { order_id, description } } in your response.
Keep responses under 3 sentences. Be warm.
```

**Fallback:** If Groq fails, return:
```json
{
  "response": "मुझे अभी कुछ तकनीकी समस्या आ रही है। कृपया कुछ देर बाद दोबारा प्रयास करें।",
  "is_fallback": true
}
```

### B.6 Batch Forecast Endpoint

This is called by Manthan's Antigravity cron every morning.

**Endpoint:** `POST /ai/forecast/batch`  
**Auth:** Verifies `x-antigravity-secret` header.

**Process:**
1. Iterate: 20 crops × 10 districts = 200 combinations.
2. For each combination: run Prophet forecast for 7 days ahead.
3. POST results to backend: `POST /api/internal/forecasts/upsert` (Manthan creates this endpoint).
4. Return summary: `{ processed: 200, failed: 0, duration_ms: 45000 }`.

**Important:** Run forecasts in parallel where possible (Python `concurrent.futures.ThreadPoolExecutor`). This must complete within 5 minutes.

### B.7 Deployment on Railway.app

Railway.app is used for the AI service (Python Flask).

**Railway config file:** Create `railway.json` in `ai-service/`:
```json
{
  "build": { "builder": "nixpacks" },
  "deploy": { "startCommand": "python run.py", "healthcheckPath": "/health" }
}
```

**requirements.txt (create this precisely):**
```
flask==3.0.0
flask-cors==4.0.0
prophet==1.1.5
scikit-learn==1.3.0
pandas==2.1.0
numpy==1.26.0
geopy==2.4.0
requests==2.31.0
groq==0.9.0
google-generativeai==0.7.0
python-dotenv==1.0.0
gunicorn==21.2.0
```

Note: Prophet installs slowly due to pystan dependency. Railway.app handles this, but first build takes ~5 minutes.

---

*Context version: 1.0 | Siddhesh | Kisan Connect SIH 2026*
