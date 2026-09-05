# MULTILINGUAL_VOICE_RAG_CHATBOT.md — Kisan Mitra Advanced RAG & Voice Engine
## Specification, Architecture & API Requirements for Marathi, Hindi, English Voice-RAG

---

## 0. PHASED IMPLEMENTATION STRATEGY & CHATBOT PURPOSE

### 0.1 Purpose & Target Use Cases
The **Kisan Mitra** AI Chatbot is built to solve key accessibility barriers in agricultural digital platforms:
- **Low-Literacy Farmer Assistance**: Farmers can speak directly via microphone in **Marathi, Hindi, or English** to inquire about crop listing procedures, market prices, and payment statuses without typing.
- **Real-Time Price & Demand Advisories**: Answers queries regarding 7-day crop demand forecasts, peak selling times, and recommended market prices.
- **Consumer Order Guidance**: Provides instant answers regarding order tracking, payment verification, delivery slots, and refund policies.
- **Logistics Driver Hands-Free Support**: Provides hands-free audio guidance to drivers regarding delivery assignments and route stops.

### 0.2 Implementation Phases
```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: IMMEDIATE / CURRENT FOCUS (Real-Time Voice & Text Engine)       │
│                                                                         │
│  • Languages: English ('en'), Hindi ('hi'), Marathi ('mr')              │
│  • Text Input  ──► Text Output                                          │
│  • Voice Input (Microphone Stream) ──► Real-Time Voice Audio Output     │
│  • Pipeline: Microphone Audio ──► Sarvam STT ──► Groq LLM ──► Sarvam TTS│
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼ (After Full Platform Build)
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: POST-PLATFORM COMPLETION (Complex Vector RAG Indexing)         │
│                                                                         │
│  • Vector Indexing over live PostgreSQL DB, Data Tables & User FAQs     │
│  • Hybrid Search (ChromaDB + BM25) for Deep Contextual Retrieval         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. OVERVIEW & OBJECTIVES

This document specifies the upgrade of **Kisan Mitra** from a basic prompt-based assistant to a **Production-Grade Advanced Multilingual Voice-Enabled RAG (Retrieval-Augmented Generation) Bot**.

### Key Additions:
1. **Languages**: English (`en`), Hindi (`hi`), **Marathi (`mr`)**.
2. **Real-time Voice Interface**: Direct microphone Speech-to-Text (STT) and Text-to-Speech (TTS) audio output pipeline.
3. **Sarvam AI Integration**: High-accuracy Indian language STT/TTS (`saaras` / `bulbul`) and translation models tailored for Marathi and Hindi dialects.
4. **Phase 2 Hybrid RAG Engine**: Retrieval over user-facing rules (commission rates, refund policies, KYC requirements, and listing guidelines).

---

## 2. CREDENTIALS & SERVICE REQUIREMENTS

| Provider | Service | Required Key in `.env` | Purpose | Free Tier / Cost |
|---|---|---|---|---|
| **Sarvam AI** | STT, TTS, Translation | `SARVAM_API_KEY` | High-accuracy Marathi & Hindi Speech-to-Text (`saaras:v1`) and Text-to-Speech (`bulbul:v1`) | Free trial credits (sarvam.ai) |
| **Groq AI** | Primary LLM Generator | `GROQ_API_KEY` | Rapid LLaMA 3.1 8B generation (sub-second response) | 14,400 req/day Free |
| **Google AI** | Secondary LLM Generator | `GEMINI_API_KEY` | Gemini 1.5 Flash fallback for long context | 1M tokens/mo Free |
| **HuggingFace / Local** | Vector Embeddings (Phase 2) | N/A (Local / `sentence-transformers`) | `all-MiniLM-L6-v2` or `bge-small-en-v1.5` for vector indexing | 100% Free (Runs locally) |
| **ChromaDB / FAISS** | Vector Database (Phase 2) | N/A (In-memory / Persistent Disk) | Embeddings storage & similarity search | 100% Free |

---

## 3. REAL-TIME VOICE & TEXT ARCHITECTURE (PHASE 1)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT PIPELINE                                │
│   Audio (Microphone Stream / Blob) ──► Sarvam STT (saaras) ──► Text Query│
│   Text Input ("मराठी / हिंदी / English") ─────────────► Text Query      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LLM PROCESSING                                    │
│   Prompt = System Role + Query ──► Groq LLaMA 3.1 8B                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       OUTPUT SELECTION                                  │
│   Text Input  ──► Returns Text Response                                 │
│   Voice Input ──► Sarvam TTS (bulbul) ──► Returns Spoken Audio (Base64) │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. KNOWLEDGE BASE DATA SOURCES FOR RAG (PHASE 2)

The RAG index will ingest and chunk data from core sources across the repository after platform completion:

1. **Detailed Project Report (`docs/DPR.md`)**: Filtered user-facing rules (commission rates, refund policies, KYC requirements, listing guidelines, and complaint resolution SLAs). Technical architectural code details are excluded.
2. **Agmarknet Price Dataset (`ai-service/app/data/agmarknet_sample.csv`)**: Historical minimum, maximum, and average prices for 20 crops across 10 districts.
3. **District Coordinates (`ai-service/app/data/district_coords.json`)**: District coordinates, state mappings, and market hubs.
4. **Crop Seasonal Calendar**: Recommended planting, harvesting, and peak pricing windows per crop.
5. **Platform FAQs & Grievance SLA Rules**: Escalation deadlines (4hr for critical, 24hr for high severity), refund policies, and delivery guarantees.

---

## 5. API ENDPOINTS DESIGN

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
  "message": "Text query processed successfully",
  "data": {
    "response": "नाशिकमध्ये टोमॅटोचा सरासरी दर ₹18.50 प्रति किलो आहे.",
    "language": "mr",
    "is_fallback": false
  }
}
```

### Endpoint 2: Real-time Voice Audio Query (Voice In -> Voice Audio Out)
- **Route**: `POST /ai/chatbot/voice`
- **Request Body**: (Multipart form-data)
  - `audio`: Base64 audio string or microphone audio blob (`.wav` / `.mp3`)
  - `language`: `mr` | `hi` | `en`
  - `user_role`: `farmer` | `consumer` | `logistics`
- **Response**:
```json
{
  "success": true,
  "data": {
    "transcript": "नाशिकमध्ये टोमॅटोचा दर काय आहे?",
    "response_text": "नाशिकमध्ये टोमॅटोचा सरासरी दर ₹18.50 प्रति किलो आहे.",
    "audio_base64": "data:audio/wav;base64,UklGRi...",
    "language": "mr"
  }
}
```

---

## 6. MARATHI, HINDI & ENGLISH SYSTEM PROMPTS

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

## 7. IMPLEMENTATION ROADMAP

- [x] Phase 1 Text Chatbot active with Groq API (LLaMA 3.1 8B).
- [ ] Obtain **`SARVAM_API_KEY`** from [sarvam.ai](https://www.sarvam.ai).
- [ ] Build `ai-service/app/services/sarvam_voice.py` (STT `saaras` & TTS `bulbul` integration).
- [ ] Implement `POST /ai/chatbot/voice` endpoint for real-time audio interaction.
- [ ] Post-Platform Completion: Deploy Phase 2 Hybrid RAG over live PostgreSQL DB tables.

---

*Specification Version: 2.0 | Kisan Connect SIH 2026 | Siddhesh — AI/ML Engineer*
