# AGENT.md — Siddhesh
## Role: AI/ML Engineer — Python AI Service (Forecasting + Routing + Chatbot)

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Siddhesh**, the **AI/ML Engineer** of Team Kisan Connect, competing in **Smart India Hackathon 2026** (Problem Statement SIH26033).

Siddhesh is an **experienced AI builder** proficient with:
- **OpenCode** — for AI-assisted Python code generation, model pipelines, and Flask APIs
- **Antigravity** — for understanding workflow triggers (Manthan builds them, but they call Siddhesh's endpoints)
- **Omniroute** — for understanding how API traffic reaches his service

Siddhesh owns the **entire AI/ML layer** of Kisan Connect. This is one of the most differentiating parts of the project for SIH judges — the AI features (demand forecasting, price recommendation, route optimization, and chatbot) are what makes this more than just another marketplace app.

---

## WHAT SIDDHESH IS BUILDING

Siddhesh is responsible for the **Python Flask AI microservice**, running on port 8000 (hosted on Railway.app):

1. **Demand Forecasting API** — Given a crop and district, predict the next 7 days of demand and price using Meta Prophet with Agmarknet historical data.
2. **Price Recommendation API** — Given crop details + location + quality, recommend the optimal listing price range.
3. **Route Optimization API** — Given a set of order delivery points, cluster them and return an optimized delivery route.
4. **Chatbot API (Kisan Mitra)** — A context-aware conversational AI using Groq API (LLaMA 3.1 8B) that responds in Hindi and English.
5. **Batch Forecast Endpoint** — A special endpoint called by Manthan's Antigravity cron workflow that refreshes all forecast data for all 10 districts and 20 crops daily.

---

## THE BIGGER PICTURE

**Kisan Connect** is an AI-powered farm-to-consumer marketplace for India (SIH26033). It eliminates middlemen between farmers and consumers. The AI layer (your work) is what makes the platform intelligent.

**Team Division:**
- Manthan — Backend Auth + DB + Antigravity (your service gets called by his Antigravity workflows)
- **Siddhesh (you)** — Python AI Service (this document)
- Tukesh — Marketplace Backend (his backend calls your AI service)
- Sunidhi — Frontend Farmer Dashboard (will display your forecast data)
- Payal — Frontend Consumer Browse/Cart
- Pratham — Frontend Admin + Chatbot Widget (will call your chatbot API)

**How your service connects:**
- Backend (Tukesh) calls `/ai/price/recommend` when a farmer creates a listing.
- Frontend (Sunidhi) fetches forecast charts from `/ai/forecast/demand`.
- Frontend (Pratham) sends chatbot messages to `/ai/chatbot/query`.
- Antigravity cron (Manthan) calls `/ai/forecast/batch` every morning.

---

## HOW TO USE OPENCODE

Siddhesh should use OpenCode for:
- Generating Flask routes and blueprint boilerplate.
- Writing data preprocessing functions (pandas transformations).
- Generating Prophet model integration code.
- Writing K-Means clustering + greedy TSP route optimization.
- Writing Groq API integration with proper prompt engineering.

**Always specify in your OpenCode prompts:**
1. Python 3.11 / Flask framework.
2. Exact input JSON format and output JSON format.
3. Error handling: what to return if the model fails.
4. Fallback strategy.

---

## KEY PRINCIPLE: EVERY AI FUNCTION HAS A FALLBACK

The SIH demo must not break. If Prophet fails, return moving average. If Groq fails, return a canned response. If OR-Tools fails, return greedy TSP. Build every function with 3 layers: primary → fallback → last-resort.

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
