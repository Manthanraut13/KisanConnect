# Kisan Connect - Master Documentation

SIH 2026 (PS SIH26033): Direct farm-to-consumer AI-powered marketplace.

This is the single source of truth for the whole prototype. It links to the
per-service notes for fine-grained implementation detail.

## Contents

- [documentation.md](./documentation.md) (this file) - overall architecture, stack, flows, setup
- [docs/FRONTEND_NOTES.md](./docs/FRONTEND_NOTES.md) - frontend structure, every folder and pattern
- [docs/BACKEND_NOTES.md](./docs/BACKEND_NOTES.md) - backend structure, every folder, route, model, flow
- [docs/SERVICES_NOTES.md](./docs/SERVICES_NOTES.md) - ai-service, database/seed, cron jobs, notifications, integrations
- [docs/Architecture.md](./docs/Architecture.md) - original high-level design (author: team)
- [README.md](./README.md) - short prototype overview

## Repository layout

```
ai-service/      Python FastAPI microservice (chatbot, price, forecast, logistics AI)
backend/         Node.js Express API (port 5000)
frontend/        React + Vite SPA (port 3000)
database/        Seed script (seed.js)
docs/            Design + engineering notes
*.md             Team working docs (DPR, guides, per-member folders)
```

## Roles

The platform has six roles. They are set at registration:

| Role | Home page | Notes |
| --- | --- | --- |
| `consumer` | `/marketplace` | Retail buyer |
| `bulk_buyer` | `/marketplace` | Bulk orders (retail flow for now) |
| `farmer` | `/farmer/dashboard` | Lists produce, packs orders |
| `fpo_admin` | `/farmer/dashboard` | Same farmer capabilities |
| `logistics` | `/driver` | Driver portal, accepts deliveries |
| `admin` | `/admin` | Full admin portal |

`frontend/src/lib/roles.js` maps role to home route.

Predefined accounts for testing:

- Admin: `9876543210` / `Admin@123`
- Test driver (Nagpur): `9797979797` / `Driver@1234`
- Test farmer (Nagpur): `9898989898` / `Test@1234`

## Technology stack

### Backend (backend/)
- Node.js, Express 5
- Sequelize ORM + PostgreSQL
- JWT auth (Bearer token in `Authorization` header)
- joi validation, multer uploads, Cloudinary storage
- Razorpay payments (orders, verification, webhook)
- Firebase Admin for push notifications, SMS/email helpers
- Upstash Redis (admin stats cache, OTP, rate-limit stores)
- express-rate-limit (global limiter + stricter auth limiter)
- node-cron jobs (forecast refresh, notifications)

### Frontend (frontend/)
- React 18 + Vite
- React Router v6
- Zustand stores (auth, cart)
- Axios instance with interceptor (auto Bearer header, 401 handling)
- Tailwind CSS (shadcn/ui-style primitives)
- i18next (en/hi), lucide-react icons
- recharts (admin analytics), react-leaflet (maps), sonner (toasts)
- react-hook-form + zod (forms)

### ai-service (ai-service/)
- Python 3.12 + FastAPI (port 8000)
- Scikit-learn models (price recommender, demand forecaster, route optimizer)
- Sample data under `app/data/`, notebooks for model development

## Backend overview

Mount points (`backend/src/app.js`):

```
/api/auth      auth (register, login, OTP, refresh, forgot/reset)
/api/users     profile, dashboard, profile image, complete profile
/api/admin     admin portal (stats, users, orders, grievances, analytics)
/api/grievances user grievance CRUD
/api/listings  marketplace listings CRUD + search
/api/cart      cart CRUD + summary
/api/orders    place, list, detail, cancel, status
/api/payments  Razorpay create/verify/history + webhook
/api/logistics driver portal + admin assignment + public tracking
/api/webhooks  internal webhooks (forecast refresh, order, grievance, log)
```

Architecture pattern: `routes -> controllers -> services -> models`.

- Controllers own request/response, validate input, call services.
- Services own business logic and DB access.
- Models are Sequelize definitions in `backend/src/models/index.js`.

Role + auth enforcement is middleware-based:

- `auth.middleware.js` - verifies JWT, loads current user.
- `role.middleware.js` - `requireRole('farmer', 'admin', ...)` guard.

Full route/endpoint inventory and model fields: [docs/BACKEND_NOTES.md](./docs/BACKEND_NOTES.md).

### Key domain flows

1. **Auth** - register -> OTP verify (optional) -> login -> JWT access token. Predefined admin/farrmer drivers are seeded in `database/seed.js`.
2. **Marketplace** - listings reflect live DB. Cart is a per-user server-side cart; delivery charge is a flat 30 rupees, GST is 0. Totals match between `cartStore` (frontend) and `cart.service` (backend): `subtotal + 30 delivery`.
3. **Checkout** - consumer fills delivery address (district constrained from `INDIA_DISTRICTS` in Checkout.jsx), order is placed, Razorpay order created, payment verified via webhook, order moves `pending -> confirmed`.
4. **Order lifecycle** - `pending -> confirmed -> packed -> in_transit -> delivered` (plus `cancelled`, `refunded`). Farmers pack/unpack; admins can force-advance status; logistics drivers accept and deliver.
5. **Logistics** - admin assigns driver or driver self-accepts paid orders in their district (`POST /api/logistics/driver/accept/:orderId`). Driver earns 80% of the delivery charge. Proof image uploaded via `proof` multipart field.
6. **Grievances** - user raises ticket with severity; SLA deadline auto-set +48h; admin resolves with note; user sees resolution.
7. **Admin portal** - real-time stats (60s cache), users with activation toggle + detail (order/listing/grievance counts), orders with search/filter/pagination + status override + detail modal, grievances with SLA, analytics (avg order value, monthly orders, active districts, top crops, 14-day daily orders + revenue).

## Dataset / seed

`database/seed.js` creates the platform state: predefined users (admin, farmers, logistics partners), sample listings, sample orders/grievances/assignments. Run:

```
cd backend && npm run seed
```

## Known gotchas (learned while building)

These bit us before; read before making changes.

- **Timestamps**: The Order model is defined with `underscored: true` in options, but the live attribute names are camelCase (`createdAt`, `updatedAt`). Write queries with `createdAt`, not `created_at`. (Orders on other models must be checked individually.)
- **Multer field names**: upload routes declare the exact field (`upload.single('proof')`, `upload.single('image')`). The frontend must send the same field name or you get `LIMIT_UNEXPECTED_FILE` 500.
- **Login rate limiting**: an `auth` limiter is still active in development and heavy test loops hit `429 Too many requests`. Increase the window/limit in `rateLimit.middleware.js` if you are doing load-testing, or relax it in dev builds before release.
- **Delivery date optional**: Checkout treats `delivery_slot` as optional (`null` if empty); keep that contract.
- **Admin orders must come from `/api/admin/orders`** (not the public order list) so buyer/items/assignment are included with pagination and search.

## Setup

Requirements: Node 18+, Python 3.12+, PostgreSQL, Redis (can be Upstash URL), Cloudinary account, Razorpay keys, Firebase service account.

1. Backend: `cd backend && npm install`
2. `.env` - copy the example (see backend/.env.example if present) and fill DB, JWT, Redis, Cloudinary, Razorpay, Firebase, SMS keys.
3. Frontend: `cd frontend && npm install` and `.env` for `VITE_API_URL`.
4. ai-service: `cd ai-service && pip install -r requirements.txt`, `.env` from `.env.example`, run `python run.py`.
5. Database: start Postgres, run `backend` with `NODE_ENV=development` to auto `sync({ alter: true })`, then `npm run seed`.

### Running in development

- Backend: `cd backend && npm run dev` (nodemon, port 5000)
- Frontend: `cd frontend && npm run dev` (Vite, port 3000)
- ai-service: `cd ai-service && python run.py` (port 8000)
- CORS is open (`FRONTEND_URL` or `*`) so the frontend can call backend directly.

## Deployment notes

See `ai-service/railway.json` (deployed on Railway) and repo deploy configs. Environment variables are the deployment contract; keep `.env.example` files in sync when adding one.