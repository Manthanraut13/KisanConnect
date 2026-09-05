# MULTILINGUAL_VOICE_RAG_CHATBOT.md — Kisan Mitra Advanced RAG & Voice Engine
## Specification, Architecture & API Requirements for Marathi, Hindi, English Voice-RAG

---

## 1. OVERVIEW & OBJECTIVES

This document specifies the upgrade of **Kisan Mitra** from a basic prompt-based assistant to a **Production-Grade Advanced Multilingual Voice-Enabled RAG (Retrieval-Augmented Generation) Bot**.

### Key Additions:
1. **Languages**: English (`en`), Hindi (`hi`), **Marathi (`mr`)**.
2. **Voice Interface**: Speech-to-Text (STT) and Text-to-Speech (TTS) pipeline.
3. **Advanced RAG Engine**: Hybrid retrieval (Dense Vector + Sparse BM25 keyword search) over **ALL Kisan Connect Knowledge Base** (DPR.md, Agmarknet Crop Prices, Crop Calendars, Platform Rules, FAQs, HSN/GST Codes, Logistics Policies).
4. **Sarvam AI Integration**: High-accuracy Indian language STT/TTS (`saaras` / `bulbul`) and translation models tailored for Marathi and Hindi dialects.

---

## 2. CREDENTIALS & SERVICE REQUIREMENTS

| Provider | Service | Required Key in `.env` | Purpose | Free Tier / Cost |
|---|---|---|---|---|
| **Sarvam AI** | STT, TTS, Translation | `SARVAM_API_KEY` | High-accuracy Marathi & Hindi Speech-to-Text (`saaras:v1`) and Text-to-Speech (`bulbul:v1`) | Free trial credits (sarvam.ai) |
| **Groq AI** | Primary LLM Generator | `GROQ_API_KEY` | Rapid LLaMA 3.1 8B generation (sub-second response) | 14,400 req/day Free |
| **Google AI** | Secondary LLM Generator | `GEMINI_API_KEY` | Gemini 1.5 Flash fallback for long context | 1M tokens/mo Free |
| **HuggingFace / Local** | Vector Embeddings | N/A (Local / `sentence-transformers`) | `all-MiniLM-L6-v2` or `bge-small-en-v1.5` for vector indexing | 100% Free (Runs locally) |
| **ChromaDB / FAISS** | Vector Database | N/A (In-memory / Persistent Disk) | Embeddings storage & similarity search | 100% Free |

---

## 3. ADVANCED HYBRID RAG ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT PIPELINE                                │
│   Audio Input (.wav / .mp3) ──► Sarvam STT (saaras) ──► Text Query      │
│   Text Input ("मराठी / हिंदी / English") ──────────────► Text Query      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ADVANCED RAG RETRIEVAL                            │
│                                                                         │
│   Query ──► Hybrid Search (Ensemble Retriever)                          │
│             ├─► Dense Vector Search (ChromaDB + SentenceTransformers)   │
│             └─► Sparse Keyword Search (BM25 Algorithm)                  │
│                                    │                                    │
│                                    ▼                                    │
│                     Re-Ranking & Context Compression                    │
│             Top K Relevant Chunks (DPR, Agmarknet CSV, FAQs)           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       LLM GENERATION & TTS                              │
│   Prompt = System Role + Context + Query ──► Groq LLaMA 3.1 8B          │
│                                                    │                    │
│                                                    ▼                    │
│   Text Response ────────────────────────► Sarvam TTS (bulbul)           │
│                                                    │                    │
│                                                    ▼                    │
│                                           Audio Base64 Output           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. KNOWLEDGE BASE DATA SOURCES FOR RAG

The RAG index will ingest and chunk data from 5 core sources across the repository:

1. **Detailed Project Report (`docs/DPR.md`)**: Full platform workflows, commission structures, logistics rules, KYC rules.
2. **Agmarknet Price Dataset (`ai-service/app/data/agmarknet_sample.csv`)**: Historical minimum, maximum, and average prices for 20 crops across 10 districts.
3. **District Coordinates (`ai-service/app/data/district_coords.json`)**: District coordinates, state mappings, and market hubs.
4. **Crop Seasonal Calendar**: Recommended planting, harvesting, and peak pricing windows per crop.
5. **Platform FAQs & Grievance SLA Rules**: Escalation deadlines (4hr for critical, 24hr for high severity), refund policies, and delivery guarantees.

---

## 5. API ENDPOINTS DESIGN

### Endpoint 1: Text Query RAG
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
  "message": "Query processed via Hybrid RAG",
  "data": {
    "response": "नाशिकमध्ये टोमॅटोचा सरासरी दर ₹18.50 प्रति किलो आहे. पुढील आठवड्यात दर वाढण्याची शक्यता आहे.",
    "language": "mr",
    "sources": ["agmarknet_sample.csv", "DPR.md Section 13.1"],
    "is_fallback": false
  }
}
```

### Endpoint 2: Voice Audio Query (STT -> RAG -> TTS)
- **Route**: `POST /ai/chatbot/voice`
- **Request Body**: (Multipart form-data)
  - `audio`: Base64 audio string or file blob (`.wav` / `.mp3`)
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

### Endpoint 3: RAG Ingestion / Re-index Trigger
- **Route**: `POST /ai/chatbot/rag/ingest`
- **Headers**: `x-internal-secret: <secret>`
- **Description**: Parses all files in `docs/` and `app/data/`, creates embeddings, and builds ChromaDB vector index.

---

## 6. MARATHI, HINDI & ENGLISH SYSTEM PROMPTS

### Marathi Prompt Template:
```
तुमचे नाव 'किसान मित्र' (Kisan Mitra) आहे - किसान कनेक्ट (Kisan Connect) डिजिटल मार्केटप्लेसचे AI सहाय्यक.
वापरकर्ता भूमिका: {user_role}

खालील संदर्भ माहितीचा (Context) वापर करून अचूक आणि सोप्या मराठीत उत्तर द्या:
---
{retrieved_context}
---

नियम:
1. उत्तर ३ वाक्यांपेक्षा मोठे नसावे.
2. शेतकरी/ग्राहकांशी आदराने आणि सोप्या मराठीत बोला (उदा. "नमस्कार शेतकरी बंधू").
3. संदर्भात उत्तर नसल्यास स्पष्ट सांगा की माहिती उपलब्ध नाही.
```

---

## 7. IMPLEMENTATION ROADMAP

- [ ] Obtain **`SARVAM_API_KEY`** from [sarvam.ai](https://www.sarvam.ai).
- [ ] Add `chromadb`, `rank_bm25`, `sentence-transformers`, `pydub` to `requirements.txt`.
- [ ] Build `ai-service/app/services/rag_engine.py` (Hybrid BM25 + Vector Search).
- [ ] Build `ai-service/app/services/sarvam_voice.py` (STT & TTS API wrappers).
- [ ] Update `ai-service/app/routes/chatbot.py` to support Marathi, hybrid RAG context, and voice audio payloads.
- [ ] Add unit tests for RAG retrieval and Marathi language processing.

---

*Specification Version: 1.0 | Kisan Connect SIH 2026 | Siddhesh — AI/ML Engineer*
