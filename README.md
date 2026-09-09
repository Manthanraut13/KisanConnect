# Kisan Connect

SIH 2026 (Problem Statement SIH26033): Direct farm-to-consumer AI-powered marketplace.

A full-stack agricultural marketplace prototype connecting farmers directly to
consumers, bulk buyers and logistics partners, with an AI assistant for prices,
demand forecasting, route optimization and multilingual/voice chatbot support.

## Core features

- Consumer marketplace: browse listings, cart, checkout (Razorpay), order tracking
- Farmer portal: dashboard with real earnings/stock, listing management, order packing,
  demand advisory
- Driver (logistics) portal: online/offline, accept same-district paid orders, proof-of-delivery
- Admin portal: live stats, user management with detail views, order management with
  status override, grievances with SLA, analytics charts
- Grievance system across all roles with severity + SLA deadline and resolution notes
- AI assistant: price recommendations, demand forecasts, route optimization, multilingual
  voice chatbot
- Bilingual UI (English / Hindi)

## Repo layout

```
backend/     Node.js + Express + PostgreSQL API (port 5000)
frontend/    React + Vite SPA (port 3000)
ai-service/  Python FastAPI microservice (port 8000)
database/    Seed script
docs/        Engineering documentation
```

## Quick start

```
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# ai-service
cd ai-service && pip install -r requirements.txt && python run.py
```

Database: run `npm run seed` (from backend) after the models are synced in dev.
Copy `.env.example` files per service and fill in the keys.

Testing logins: admin `9876543210/Admin@123`, driver `9797979797/Driver@1234`,
farmer `9898989898/Test@1234`.

## Documentation

- `documentation.md` - master documentation (architecture, stack, flows, setup, gotchas)
- `docs/FRONTEND_NOTES.md` - frontend structure and conventions
- `docs/BACKEND_NOTES.md` - backend structure, endpoints, models, conventions
- `docs/SERVICES_NOTES.md` - ai-service, database/seed, jobs, notifications
- `docs/Architecture.md` - original design docs

## Git workflow

Work on `feature/*` branches and open pull requests to `dev`, then `main`.
See `GITHUB_GUIDE_TEAM.md`.