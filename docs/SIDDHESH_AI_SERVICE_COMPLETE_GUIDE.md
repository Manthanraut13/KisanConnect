# SIDDHESH_AI_SERVICE_COMPLETE_GUIDE.md — AI Microservice Documentation
## Master Guide for AI Service, Data Sourcing, Voice Chatbot & Integration

---

## 1. OVERVIEW & RESPONSIBILITIES

This document serves as the master reference for the **Python Flask AI Microservice (`ai-service/`)** built by **Siddhesh (AI/ML Engineer)** for Team Kisan Connect (Smart India Hackathon 2026, Problem Statement SIH26033).

The microservice runs on **Port 8000** (deployed on Railway.app) and provides 4 intelligent capabilities:
1. **Demand Forecasting API** — 7-day crop price and demand index predictions using Meta Prophet.
2. **Price Recommendation API** — Optimal farmer listing prices based on 30-day mandi averages, quality grades, and organic premiums.
3. **Route Optimization API** — K-Means clustering and nearest-neighbor TSP delivery routing for logistics drivers.
4. **Multilingual Voice & Text AI Chatbot (Kisan Mitra)** — Real-time AI assistant supporting English, Hindi, and Marathi with multi-tiered voice fail-safes.

---

## 2. COMPREHENSIVE LIST OF CREATED & ADDED FEATURES

### A. Microservice Core & Architecture
- **Flask Application Factory**: Built `ai-service/app/__init__.py` with CORS support for Port 5000 (Backend) and Port 3000 (Frontend).
- **Production Server Config**: Configured `run.py`, `railway.json`, `requirements.txt`, and virtual environment dependencies.
- **Unified Standard Envelope**: Built `ai-service/app/utils/response.py` enforcing `{ success, message, data }` response shapes across all endpoints.

### B. Data Sourcing Layer (`DATA_SOURCING.md`)
- **Historical Dataset**: Created `ai-service/app/data/agmarknet_sample.csv` (194,800 records across 2.5 years: Jan 2024 – Aug 2026).
- **Coverage**: 20 crops (Tomato, Onion, Potato, Rice, Wheat, Maize, Chili, Turmeric, Banana, Mango, Brinjal, Cabbage, Cauliflower, Garlic, Ginger, Groundnut, Soybean, Coconut, Sugarcane, Cotton) × 10 districts (Nashik, Pune, Amritsar, Ludhiana, Coimbatore, Mysuru, Guntur, Jaipur, Indore, Varanasi).
- **Cached Loader**: Built `ai-service/app/utils/data_loader.py` with in-memory caching and Rs/quintal to Rs/kg unit conversion.
- **Geospatial Loader**: Built `ai-service/app/data/district_coords.json` and `ai-service/app/utils/geocoder.py` (Haversine formula for exact km calculation).

### C. Demand Forecasting Module
- **Model**: Built `ai-service/app/models/demand_forecaster.py` wrapping Meta Prophet with 3-tier fallback (Prophet → 14-day Moving Average → Static Default).
- **Endpoints**:
  - `POST /ai/forecast/demand` — Accepts `crop_name`, `district`, `forecast_days` (default 7).
  - `POST /ai/forecast/batch` — Refreshes all 200 crop/district combinations in parallel using `ThreadPoolExecutor`.

### D. Price Recommendation Module
- **Model**: Built `ai-service/app/models/price_recommender.py`.
- **Logic**: Computes recent 30-day mandi average, quality grade multipliers (Grade A: +15%, Grade B: 0%, Grade C: -10%), organic premium (+20%), and bulk volume discount (-5% for >500kg).
- **Endpoint**: `POST /ai/price/recommend`.

### E. Route Optimization Module
- **Model**: Built `ai-service/app/models/route_optimizer.py`.
- **Logic**: Skips clustering for ≤3 orders; runs K-Means clustering into sub-routes for >3 orders; computes shortest sequence from driver starting location using greedy TSP; calculates total distance (km) and estimated delivery time (minutes).
- **Endpoint**: `POST /ai/logistics/optimize-route`.

### F. Multilingual Voice & Text Chatbot (Kisan Mitra)
- **Languages**: Full support for **English (`en`), Hindi (`hi`), and Marathi (`mr`)**.
- **Role-based Prompts**: Tailored system prompts for farmers, consumers, and logistics drivers.
- **Multi-Tier Fail-Safe Voice Engine**:
  - **Tier 1 (Sarvam AI)**: Server-side `saaras` Speech-to-Text & `bulbul` Text-to-Speech (`SARVAM_API_KEY`).
  - **Tier 2 (gTTS)**: Keyless Google Text-to-Speech fallback (100% free server-side audio generation).
  - **Tier 3 (Web Speech API)**: Browser native microphone & speech synthesis.
- **Endpoints**:
  - `POST /ai/chatbot/query` — Text query in → Text response out.
  - `POST /ai/chatbot/voice` — Voice query transcript/audio in → Spoken audio Base64 + Text out.

### G. Unit Testing & Notebooks
- **Test Suite**: Created 30 comprehensive unit test cases (`tests/test_health.py`, `test_forecasting.py`, `test_pricing.py`, `test_routing.py`, `test_chatbot.py`) with 100% pass rate.
- **Jupyter Notebooks**: Created exploratory notebooks in `notebooks/`:
  - `01_EDA_Agmarknet.ipynb`
  - `02_Demand_Forecasting.ipynb`
  - `03_Route_Optimization.ipynb`

---

## 3. CREDENTIALS & ENVIRONMENT VARIABLES SPECIFICATION

> ⚠️ **IMPORTANT INSTRUCTION FOR ALL TEAM MEMBERS (Manthan, Tukesh, Sunidhi, Payal, Pratham):**  
> You MUST add `SARVAM_API_KEY` to your environment variables files (`.env` & `.env.example`). The original backend `.env.example` template did not include this field.

### Required AI Service Environment Variables (`ai-service/.env`):

```env
# ===== SERVER CONFIG =====
PORT=8000
FLASK_ENV=development

# ===== API KEYS (DO NOT COMMIT REAL KEYS TO GIT) =====
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here

# ===== INTER-SERVICE URLS =====
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Security & Privacy Rules:
- **Never commit `.env` files** containing raw API keys to Git. `.env` is listed in `.gitignore`.
- Only commit template files (`.env.example`) with placeholder descriptions.
- Share actual secret API keys via private messaging (WhatsApp group).

---

## 4. SUMMARY OF DATA SOURCING (`DATA_SOURCING.md`)

- **Official Source**: Data originates from physical APMC Mandis, reported to the Directorate of Marketing & Inspection (DMI), Ministry of Agriculture & Farmers Welfare, Govt of India, published on `agmarknet.gov.in`.
- **Fetch Methods**:
  1. `fetch_real_agmarknet_history.py` (Agmarknet Python SDK) — fetches 2.5 years of historical price records directly from the official portal.
  2. `generate_data.py` (Local Generator) — generates realistic seasonal price data matching the exact schema (`agmarknet_sample.csv`).
- **Schema Format**:
  ```csv
  date,state,district,market,commodity,variety,min_price,max_price,modal_price,unit
  ```

---

## 5. RAILWAY DEPLOYMENT CHECKLIST

When deploying the AI microservice on **Railway.app**:

1. Select Root Directory: **`ai-service`**
2. Build Command: Uses `railway.json` (`nixpacks` builder).
3. Start Command: `gunicorn run:app --bind 0.0.0.0:$PORT`
4. Set Environment Variables in Railway Dashboard:
   - `PORT` = `8000`
   - `FLASK_ENV` = `production`
   - `GROQ_API_KEY` = `<your_key>`
   - `GEMINI_API_KEY` = `<your_key>`
   - `SARVAM_API_KEY` = `<your_key>`
   - `BACKEND_URL` = `https://kisan-connect-api.onrender.com`
   - `FRONTEND_URL` = `https://kisan-connect.vercel.app`
5. Copy the generated Railway public URL (e.g. `https://ai-service-production.up.railway.app`) and share with Tukesh, Sunidhi, and Pratham.

---

*Guide Version: 1.0 | Kisan Connect SIH 2026 | Siddhesh — AI/ML Engineer*
