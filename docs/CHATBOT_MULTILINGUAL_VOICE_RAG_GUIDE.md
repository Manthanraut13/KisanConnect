# CHATBOT_MULTILINGUAL_VOICE_RAG_GUIDE.md — Kisan Mitra Advanced Voice & RAG Engine
## Complete Guide, Architecture & API Reference for Marathi, Hindi, English Voice Chatbot

---

## 0. PURPOSE & MULTI-TIER VOICE ARCHITECTURE

### 0.1 Purpose & Target Use Cases
The **Kisan Mitra** AI Chatbot is designed for high accessibility across diverse agricultural stakeholders:
- **Low-Literacy Farmer Assistance**: Farmers can speak directly via microphone in **Marathi (`mr`), Hindi (`hi`), or English (`en`)** to inquire about crop listing procedures, market prices, and payment statuses without typing.
- **Real-Time Price & Demand Advisories**: Instant answers regarding 7-day crop demand forecasts, peak selling times, and recommended market prices.
- **Consumer Order Guidance**: Provides instant answers regarding order tracking, payment verification, delivery slots, and refund policies.
- **Logistics Driver Hands-Free Support**: Provides hands-free audio guidance to drivers regarding delivery assignments and route stops.

### 0.2 Multi-Tier Fail-Safe Voice Engine (Implemented)
```
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 1: PRIMARY VOICE ENGINE (Sarvam AI)                                │
│   High-accuracy Indian language STT (saaras:v1) & TTS (bulbul:v1)       │
│   Activated when SARVAM_API_KEY is present in .env                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (If quota limit hit / API offline)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 2: SECONDARY SERVER FALLBACK (gTTS - Google Text-to-Speech)        │
│   Free, keyless, unlimited server-side audio generation in Marathi,    │
│   Hindi, and English. Guarantees live demo voice never fails.           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (If offline network)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ TIER 3: TERTIARY CLIENT FALLBACK (Browser Native Web Speech API)        │
│   Client-side zero-latency speech synthesis directly in browser         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. OVERVIEW & IMPLEMENTATION STATUS

- **Languages Supported**: English (`en`), Hindi (`hi`), Marathi (`mr`).
- **Live Endpoints**:
  - `POST /ai/chatbot/query` — Text query in -> Text response out.
  - `POST /ai/chatbot/voice` — Microphone transcript/voice query in -> Audio output Base64 + Text response out.
- **LLM Generator**: Groq LLaMA 3.1 8B (`llama-3.1-8b-instant`).

---

## 2. CREDENTIALS & SERVICE REQUIREMENTS

| Provider | Service | Required Key in `.env` | Status | Purpose |
|---|---|---|---|---|
| **Sarvam AI** | STT (`saaras`), TTS (`bulbul`) | `SARVAM_API_KEY` | ✅ Active | High-accuracy Marathi & Hindi voice STT/TTS |
| **Groq AI** | Primary LLM Generator | `GROQ_API_KEY` | ✅ Active | Rapid LLaMA 3.1 8B text generation |
| **Google AI** | Secondary LLM Generator | `GEMINI_API_KEY` | ✅ Active | Backup LLM generation |
| **gTTS** | Secondary Voice Fallback | N/A (Keyless) | ✅ Active | Fail-safe server-side audio generation |

---

## 3. API ENDPOINTS REFERENCE

### Endpoint 1: Text Query (Text In -> Text Out)
- **Route**: `POST /ai/chatbot/query`
- **Request Body**:
```json
{
  "message": "नाशिकमध्ये टोमॅटोचा आजचा दर काय आहे?",
  "language": "mr",
  "user_role": "farmer",
  "conversation_history": []
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Chatbot query processed successfully",
  "data": {
    "response": "नाशिकमध्ये टोमॅटोचा सरासरी दर ₹18.50 प्रति किलो आहे.",
    "language": "mr",
    "is_fallback": false
  }
}
```

### Endpoint 2: Real-time Voice Query (Voice In -> Spoken Audio Out)
- **Route**: `POST /ai/chatbot/voice`
- **Request Body**:
```json
{
  "transcript": "टोमॅटोचा भाव सांगा",
  "language": "mr",
  "user_role": "farmer"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Voice chat processed successfully",
  "data": {
    "transcript": "टोमॅटोचा भाव सांगा",
    "response_text": "नाशिकमध्ये टोमॅटोचा सरासरी दर ₹18.50 प्रति किलो आहे.",
    "audio_base64": "data:audio/mp3;base64,SUQz...",
    "language": "mr",
    "tts_provider": "sarvam"
  }
}
```

---

## 4. MARATHI, HINDI & ENGLISH SYSTEM PROMPTS

### Marathi Prompt Template:
```
तुमचे नाव 'किसान मित्र' (Kisan Mitra) आहे - किसान कनेक्ट (Kisan Connect) डिजिटल मार्केटप्लेसचे AI सहाय्यक.
वापरकर्ता भूमिका: {user_role}

नियम:
1. उत्तर ३ वाक्यांपेक्षा मोठे नसावे.
2. शेतकरी/ग्राहकांशी आदराने आणि सोप्या मराठीत बोला (उदा. "नमस्कार शेतकरी बंधू").
3. थेट आणि स्पष्ट माहिती द्या.
```

---

## 5. POST-PLATFORM PHASE 2 RAG ROADMAP

After the entire platform (PostgreSQL DB, Frontend UI) is completed by all team members:
- Build `ai-service/app/services/rag_engine.py` using ChromaDB + BM25 hybrid search over live PostgreSQL DB tables, FAQs, and `DPR.md` user guidelines.

---

*Guide Version: 3.0 | Kisan Connect SIH 2026 | Siddhesh — AI/ML Engineer*
