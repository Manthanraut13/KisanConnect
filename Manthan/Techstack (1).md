# TECHSTACK.md — Kisan Connect
## Common for All Team Members

> This document defines every technology, tool, and service used in the Kisan Connect prototype. Every team member MUST read this before writing a single line of code.

---

## 1. OVERVIEW OF THE STACK

Kisan Connect is a **full-stack web application** built as a **Progressive Web App (PWA)**. The stack is divided into four layers:

```
Layer 1 → Frontend         (React.js — what users see)
Layer 2 → Backend          (Node.js/Express — business logic + APIs)
Layer 3 → AI Service       (Python Flask — all AI/ML features)
Layer 4 → Infrastructure   (Database, Cache, Storage, Hosting)
```

All three members with AI experience (Manthan, Siddhesh, Tukesh) use **OpenCode** as their primary coding assistant to generate, review, and refactor code. **Antigravity** is used for workflow automation and event orchestration. **Omniroute** is used for smart API routing and traffic management between services.

Members without AI tool experience (Sunidhi, Payal, Pratham) will build their parts using **OpenCode** with carefully written prompts provided in their Task.md documents.

---

## 2. FRONTEND STACK

| Technology | Purpose | Version | Why This |
|---|---|---|---|
| **React.js** | UI Framework | 18.x | Industry standard, component-based |
| **Vite** | Build Tool | 5.x | Fast HMR, simple config |
| **React Router v6** | Client-side Routing | 6.x | Nested routes, layout support |
| **Zustand** | Global State Management | 4.x | Simpler than Redux, less boilerplate |
| **Tailwind CSS** | Styling | 3.x | Utility-first, responsive by default |
| **shadcn/ui** | Pre-built UI Components | Latest | Accessible, Tailwind-native |
| **Axios** | HTTP Client | 1.x | Interceptors for auth tokens |
| **React Hook Form** | Form State | Latest | Performance-optimized forms |
| **Zod** | Form + API Validation | Latest | TypeScript-ready schema validation |
| **Recharts** | Charts & Graphs | 2.x | React-native charts |
| **React Leaflet** | Maps | Latest | Free, OpenStreetMap-based |
| **react-i18next** | Internationalization | Latest | Hindi/English language toggle |
| **qrcode.react** | QR Code Display | Latest | Produce lot QR codes |
| **sonner** | Toast Notifications | Latest | Clean, minimal |
| **day.js** | Date Formatting | Latest | Lightweight moment.js alternative |
| **Lucide React** | Icon Set | 0.383.0 | Clean, consistent icons |

**Frontend Folder:** `kisan-connect/frontend/`  
**Dev Server Port:** `3000`  
**Build Command:** `npm run build`  
**Dev Command:** `npm run dev`

---

## 3. BACKEND STACK

| Technology | Purpose | Version | Why This |
|---|---|---|---|
| **Node.js** | Runtime | 20.x LTS | Non-blocking I/O, async-friendly |
| **Express.js** | Web Framework | 4.x | Minimal, flexible, widely documented |
| **Sequelize** | ORM | 6.x | PostgreSQL abstraction, migrations |
| **pg (node-postgres)** | PostgreSQL Driver | Latest | Sequelize dependency |
| **jsonwebtoken** | JWT Auth | Latest | Access + refresh token management |
| **bcryptjs** | Password Hashing | Latest | Secure, no native bindings needed |
| **Joi** | Request Validation | Latest | Schema-based validation middleware |
| **Multer** | File Upload Handling | Latest | Middleware for multipart forms |
| **Cloudinary SDK** | Image Upload | Latest | Cloud image storage |
| **Nodemailer** | Email Sending | Latest | Gmail SMTP transactional mail |
| **qrcode** | QR Code Generation | Latest | Generate QR for produce lots |
| **pdfkit** | PDF Generation | Latest | Invoice PDF creation |
| **express-rate-limit** | Rate Limiting | Latest | Prevent abuse |
| **helmet** | HTTP Security Headers | Latest | XSS, clickjacking protection |
| **cors** | Cross-Origin Resource Sharing | Latest | Allow frontend to call backend |
| **morgan** | HTTP Request Logger | Latest | Dev logging |
| **winston** | Application Logger | Latest | Structured logging to files |
| **dotenv** | Environment Variables | Latest | .env file loading |
| **razorpay** | Payment SDK | Latest | Payment order creation + verification |

**Backend Folder:** `kisan-connect/backend/`  
**Server Port:** `5000`  
**Start Command:** `node server.js`  
**Dev Command:** `nodemon server.js`

---

## 4. AI SERVICE STACK

| Technology | Purpose | Version | Why This |
|---|---|---|---|
| **Python** | Language | 3.11.x | Best ML ecosystem |
| **Flask** | Web Framework | 3.x | Lightweight microservice |
| **Prophet** | Demand Forecasting | 1.1.x | Time-series, handles seasonality |
| **scikit-learn** | Route Clustering, ML | Latest | K-Means, regression models |
| **pandas** | Data Manipulation | Latest | CSV/DataFrame operations |
| **numpy** | Numerical Computing | Latest | Array math |
| **geopy** | Geocoding / Distance | Latest | Haversine distance calculation |
| **OR-Tools (Google)** | Route Optimization | 9.x | VRP solver (prototype: not used, greedy TSP instead) |
| **groq** | Chatbot LLM SDK | Latest | Free LLaMA 3.1 API |
| **google-generativeai** | Gemini API | Latest | Fallback LLM |
| **requests** | HTTP Client | Latest | External API calls |
| **flask-cors** | CORS for Flask | Latest | Allow backend to call AI service |

**AI Service Folder:** `kisan-connect/ai-service/`  
**Server Port:** `8000`  
**Start Command:** `python run.py`

---

## 5. DATABASE & STORAGE

| Service | Technology | Free Tier | Purpose |
|---|---|---|---|
| **Supabase** | PostgreSQL 15 | 500MB free | Primary database |
| **Upstash** | Redis 7 | 10K cmd/day free | Caching, session, OTP store |
| **Cloudinary** | Image CDN | 25 credits/month | Product + KYC image storage |

**Database Connection:** Set `DATABASE_URL` in `.env`  
**ORM:** Sequelize (models define tables, migrations create them)  
**Never write raw SQL** — always use Sequelize models or queryInterface in migrations.

---

## 6. AI BUILDER TOOLS (MANDATORY FOR ALL)

### 6.1 OpenCode
- **What it is:** AI coding assistant that generates, reviews, and refactors code from natural language prompts.
- **How to use:** Write a clear, detailed prompt describing exactly what you need. Include: language, framework, input/output, constraints.
- **Rule:** Always review AI-generated code before using it. Never paste blindly.
- **Best for:** Generating boilerplate, writing functions, creating components, writing tests, debugging.

### 6.2 Antigravity
- **What it is:** No-code/low-code AI workflow automation platform.
- **How to use:** Build visual workflows triggered by events (webhooks, cron, HTTP calls).
- **Used for:** Daily forecast refresh cron, order notification flows, grievance auto-triage, bulk buyer matching.
- **Rule:** Manthan owns all Antigravity workflows. Others feed data into them via API webhooks.

### 6.3 Omniroute
- **What it is:** Smart API routing and traffic management tool.
- **How to use:** Define routes between services. All frontend-to-backend and backend-to-AI-service calls go through Omniroute configuration.
- **Used for:** Service discovery, load balancing between backend and AI service, fallback routing.
- **Rule:** Tukesh configures Omniroute routing rules. All team members must respect the defined routes and not hardcode service URLs.

---

## 7. EXTERNAL APIS (FREE TIER ONLY FOR PROTOTYPE)

| API | Purpose | Free Limit | Key Variable |
|---|---|---|---|
| **Groq API** | Chatbot (LLaMA 3.1 8B) | 14,400 req/day | `GROQ_API_KEY` |
| **Google Gemini Flash** | Chatbot fallback | 1M tokens/month | `GEMINI_API_KEY` |
| **Agmarknet** | Crop price data | Free (Govt) | `AGMARKNET_API_KEY` |
| **OpenRouteService** | Route distances | 2000 req/day | `ORS_API_KEY` |
| **Google Maps JS API** | Map display | $200 credit/mo | `GOOGLE_MAPS_API_KEY` |
| **Bhashini** | Hindi translation/TTS | Free (Govt) | `BHASHINI_API_KEY` |
| **Razorpay** | Payments (Test Mode) | Unlimited test | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` |
| **MSG91** | OTP SMS | 10 free/day | `MSG91_AUTH_KEY` |
| **Firebase (FCM)** | Push Notifications | Free | `FIREBASE_SERVER_KEY` |
| **Cloudinary** | Image storage | 25 credits/mo | `CLOUDINARY_API_KEY` etc. |
| **Open-Meteo** | Weather data | Unlimited free | No key needed |
| **Nominatim (OSM)** | Geocoding | Fair use free | No key needed |
| **Gmail SMTP** | Transactional email | 500/day free | `GMAIL_USER` / `GMAIL_APP_PASSWORD` |

---

## 8. HOSTING & DEPLOYMENT (ALL FREE FOR PROTOTYPE)

| Service | What Runs There | URL Pattern |
|---|---|---|
| **Vercel** | Frontend (React build) | `kisan-connect.vercel.app` |
| **Render.com** | Backend (Node.js) | `kisan-connect-api.onrender.com` |
| **Railway.app** | AI Service (Python Flask) | `kisan-connect-ai.railway.app` |
| **Supabase** | PostgreSQL Database | Managed by Supabase |
| **Upstash** | Redis Cache | Managed by Upstash |
| **Cloudinary** | Images | `res.cloudinary.com/...` |

**CI/CD:** GitHub Actions — auto-deploy to Vercel + Render on push to `main` branch.

---

## 9. PROJECT REPOSITORY STRUCTURE

```
kisan-connect/                    ← Root
├── frontend/                     ← React App (Sunidhi, Payal, Pratham)
├── backend/                      ← Node.js API (Manthan, Tukesh)
├── ai-service/                   ← Python Flask AI (Siddhesh)
├── database/                     ← SQL Schema + Seeds
├── infrastructure/               ← Docker, Nginx configs
├── docs/                         ← All documentation
└── .github/workflows/            ← CI/CD pipelines
```

**Git Branching Strategy:**
- `main` — Production-ready, protected
- `dev` — Integration branch (all PRs target here)
- `feature/<member>/<feature-name>` — Individual work branches
- Example: `feature/sunidhi/farmer-dashboard`

**Pull Request Rule:** Every PR needs at least one review before merging to `dev`.

---

## 10. ENVIRONMENT VARIABLES

Every member must create a `.env` file in their service folder. Copy from `.env.example`. NEVER commit `.env` to Git (it is in `.gitignore`).

Key variables every member needs locally:
```
DATABASE_URL=<get from Manthan — Supabase connection string>
JWT_SECRET=<get from Manthan>
CLOUDINARY_CLOUD_NAME=<get from Manthan>
CLOUDINARY_API_KEY=<get from Manthan>
CLOUDINARY_API_SECRET=<get from Manthan>
RAZORPAY_KEY_ID=rzp_test_<get from Tukesh>
GROQ_API_KEY=<get from Siddhesh>
```

Contact Manthan for the shared `.env` values. Each member also has service-specific variables listed in their Task.md.

---

## 11. CODE QUALITY STANDARDS

- **Naming:** camelCase for JS variables/functions, PascalCase for React components, snake_case for Python.
- **Comments:** Every function must have a one-line comment describing what it does.
- **Error Handling:** Always use try/catch in async functions. Never let unhandled promises crash the server.
- **API Responses:** Always use the standard response format: `{ success: true/false, message: "...", data: {...} }`.
- **No Hardcoding:** Never hardcode URLs, API keys, or credentials. Always use `.env` variables.
- **Console.log:** Remove all debug `console.log` before pushing to `dev` branch. Use `winston` logger in backend.
- **Component Size:** Keep React components under 200 lines. Split if larger.
- **Commit Messages:** Use format: `feat: add listing creation form` / `fix: resolve cart state bug` / `docs: update README`.

---

*Last Updated: August 2026 | Kisan Connect — SIH 2026 Team*
