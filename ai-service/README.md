# Kisan Connect — Python AI Microservice (`ai-service`)
## Intelligent Agri-Marketplace Microservice (SIH 2026 | Problem Statement SIH26033)

**Developer**: Siddhesh (AI/ML Engineer)  
**Framework**: Python 3.11 / Flask  
**Default Port**: `8000`  
**Deployment**: Railway.app (`kisan-connect-ai.railway.app`)

---

## 🌟 OVERVIEW & KEY CAPABILITIES

The **AI Microservice** powers all predictive, optimization, and conversational intelligence features of the **Kisan Connect** platform:

1. 📈 **AI Demand Forecasting**: Predicts 7-day crop price trends and 0–100 demand index using Meta Prophet time-series modeling across historical mandi data.
2. 💡 **AI Price Recommendation**: Computes recommended listing prices for farmers based on 30-day regional mandi averages, quality grades (A/B/C), organic certification (+20%), and bulk order discounts (>500kg).
3. 🚚 **AI Route Optimization**: Clusters order destinations using K-Means and generates shortest delivery sequences using nearest-neighbor Traveling Salesperson Problem (TSP) algorithm with ETA calculation.
4. 🎙️ **Multilingual Voice & Text Chatbot (Kisan Mitra)**: Real-time conversational AI in **English (`en`), Hindi (`hi`), and Marathi (`mr`)** supporting text and microphone voice queries with a multi-tiered fail-safe voice engine.
5. 🔄 **Batch Forecast Processing**: Parallel automated batch processing of 200 crop/district combinations for platform-wide morning advisory updates.

---

## 🏗️ SYSTEM ARCHITECTURE & API ENDPOINTS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       OMNIROUTE / BACKEND API GATEWAY                       │
│                        /ai/*  ──► Flask AI Service (:8000)                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ DEMAND FORECAST  │         │  PRICING ENGINE  │         │ ROUTE OPTIMIZER  │
│ Meta Prophet     │         │ Mandi Moving Avg │         │ K-Means + TSP    │
│ /ai/forecast/*   │         │ /ai/price/*      │         │ /ai/logistics/*  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
                                       │
                                       ▼
                             ┌──────────────────┐
                             │ KISAN MITRA AI   │
                             │ Groq LLaMA 3.1   │
                             │ /ai/chatbot/*    │
                             └──────────────────┘
```

### API Reference Table

| Method | Endpoint | Description | Key Inputs |
|---|---|---|---|
| `GET` | `/health` | Service health status | None |
| `POST` | `/ai/forecast/demand` | 7-day crop price/demand forecast | `crop_name`, `district`, `forecast_days` |
| `POST` | `/ai/forecast/batch` | Batch refresh for all 200 combos | None (Runs in background) |
| `POST` | `/ai/price/recommend` | Optimal price recommendation | `crop_name`, `district`, `quantity_kg`, `quality_grade`, `is_organic` |
| `POST` | `/ai/logistics/optimize-route` | Route clustering & TSP ordering | `driver_location` (`lat`,`lng`), `orders` array |
| `POST` | `/ai/chatbot/query` | Text query response (en, hi, mr) | `message`, `language`, `user_role`, `conversation_history` |
| `POST` | `/ai/chatbot/voice` | Microphone voice query & audio | `transcript`, `language`, `user_role` |

---

## 🎙️ MULTI-TIER FAIL-SAFE VOICE ENGINE

```
1. Tier 1 (Primary): Sarvam AI (saaras STT & bulbul TTS) for high-accuracy Indian language voice.
2. Tier 2 (Secondary): gTTS (Google Text-to-Speech) - Free, keyless server-side audio generator in Marathi, Hindi & English.
3. Tier 3 (Tertiary): Browser Native Web Speech API for client-side zero-latency speech synthesis.
```

---

## 📊 DATASET & DATA SOURCING (`DATA_SOURCING.md`)

- **Historical Mandi Dataset**: `app/data/agmarknet_sample.csv`
- **Volume**: 194,800 records spanning 2.5 years (Jan 2024 – Aug 2026).
- **Scope**: 20 crops (Tomato, Onion, Potato, Rice, Wheat, Maize, Chili, Turmeric, Banana, Mango, Brinjal, Cabbage, Cauliflower, Garlic, Ginger, Groundnut, Soybean, Coconut, Sugarcane, Cotton) × 10 districts (Nashik, Pune, Amritsar, Ludhiana, Coimbatore, Mysuru, Guntur, Jaipur, Indore, Varanasi).

---

## 🧪 LOCAL TESTING & VERIFICATION

```bash
# Navigate to AI Service
cd ai-service

# Activate Virtual Environment (Windows)
.\venv\Scripts\activate

# Run pytest unit test suite (30 test cases)
$env:PYTHONPATH="."
python -m pytest -v

# Run live endpoint verification script
python test_live_server.py
```

---

## 🚀 ENVIRONMENT VARIABLES & CONFIGURATION

Copy `.env.example` to `.env`:

```env
PORT=8000
FLASK_ENV=development
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

---

## 📜 JUPYTER NOTEBOOKS

Located in `notebooks/`:
- `01_EDA_Agmarknet.ipynb`: Data exploration and price visualization over time.
- `02_Demand_Forecasting.ipynb`: Time-series forecasting and seasonal decomposition using Prophet.
- `03_Route_Optimization.ipynb`: K-Means spatial clustering and TSP route ordering.

---

*SIH 2026 | Team Kisan Connect | AI Microservice Module*
