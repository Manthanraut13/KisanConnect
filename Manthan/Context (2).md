# CONTEXT.md — Manthan
## Full Project Context + Auth & Infrastructure Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect is an AI-powered direct farm-to-consumer marketplace for India. The core problem it solves: Indian farmers earn only 15–30% of the final consumer price because of 10+ middlemen (dalals, mandis, distributors, retailers). We eliminate these middlemen by giving farmers a direct digital channel to consumers and bulk buyers.

### The Prototype Must Show (for SIH judges)
1. A farmer can register, create a produce listing, and see an AI-recommended price.
2. A consumer can browse listings, add to cart, checkout, and pay via Razorpay (test mode).
3. A demand forecast dashboard showing 7-day crop price/demand predictions.
4. A route optimization map showing how delivery orders are clustered.
5. A chatbot (Kisan Mitra) responding in Hindi and English.
6. A basic admin panel showing platform metrics.

### User Roles
| Role | What They Do |
|---|---|
| `farmer` | Lists produce, views earnings, sees demand advisory |
| `fpo_admin` | Same as farmer but manages group listings |
| `consumer` | Browses, orders, tracks delivery |
| `bulk_buyer` | Places large orders, posts bulk requirements |
| `logistics` | Delivery driver — sees assigned orders, marks delivered |
| `admin` | Platform admin — manages users, orders, grievances |

### Tech Stack Summary
- **Frontend:** React.js + Vite + Tailwind CSS + shadcn/ui (Vercel)
- **Backend:** Node.js + Express.js + Sequelize ORM (Render.com)
- **AI Service:** Python + Flask + Prophet + Groq API (Railway.app)
- **Database:** PostgreSQL on Supabase (free)
- **Cache:** Redis on Upstash (free)
- **Images:** Cloudinary (free)
- **AI Tools:** OpenCode (code generation), Antigravity (workflow automation), Omniroute (API routing)

### Team Division
| Member | Module |
|---|---|
| **Manthan** | Backend Auth + DB + Infra + Antigravity |
| Siddhesh | Python AI Service (Forecast + Route + Chatbot) |
| Tukesh | Marketplace Backend (Listings + Orders + Payments + Omniroute) |
| Sunidhi | Frontend — Farmer Dashboard + Marketplace UI |
| Payal | Frontend — Consumer Browse + Cart + Checkout |
| Pratham | Frontend — Admin Panel + Chatbot Widget + Driver PWA |

### Key API URLs (Prototype)
- Frontend: `https://kisan-connect.vercel.app`
- Backend: `https://kisan-connect-api.onrender.com`
- AI Service: `https://kisan-connect-ai.railway.app`

### Final vs Prototype Distinction
The prototype is built for SIH demo only — it uses:
- Razorpay Test Mode (no real money)
- Mock/static data for Aadhaar verification
- 10 Indian districts for AI data coverage
- Groq free API for chatbot (not Gemini)
- Greedy TSP for routing (not full OR-Tools VRP)
- Static i18n translations (not live Bhashini API)

The final production app would use all real APIs, all 600+ Indian districts, full OR-Tools VRP, Bhashini live translation, real Aadhaar verification, and Razorpay live mode.

---

## PART B — MANTHAN'S SPECIFIC WORK CONTEXT

### B.1 Why Auth Is the Most Critical Module

Every other feature depends on authentication. Siddhesh's AI service calls are protected by JWT. Tukesh's listing creation requires a verified farmer token. Sunidhi's farmer dashboard requires a logged-in farmer user. If auth breaks, everything breaks.

Therefore, the auth module must be built first (target: Day 1–2) and must be stable before anyone else starts connecting to the backend.

### B.2 Database Schema — What You Need to Know

You are creating the schema for the ENTIRE system, not just auth. This means Tukesh, Siddhesh, and all frontend members depend on your models being correct. The critical tables you must create:

**Tables you own (primary):**
- `users` — All user types
- `farmers` — Farmer profile extension
- `fpos` — FPO organizations
- `fpo_memberships` — FPO-farmer many-to-many
- `bulk_buyers` — Bulk buyer profiles
- `logistics_partners` — Driver profiles
- `otp_logs` — OTP tracking in Redis (not a DB table, but Redis key pattern)
- `notification_logs` — Log of all sent notifications
- `grievances` — User complaints
- `workflow_logs` — Antigravity workflow execution logs
- `admin_actions` — Audit log for admin operations

**Tables you create but Tukesh populates:**
- `listings` — Produce listings (you create model + migration, Tukesh adds the service)
- `orders` — Orders (you create model + migration, Tukesh adds service)
- `order_items` — Order line items
- `payments` — Payment records
- `logistics_assignments` — Delivery assignments

**Tables you create but Siddhesh populates:**
- `demand_forecasts` — Cached AI forecast results
- `price_recommendations` — AI price recommendation logs

The reason you create ALL migrations is to ensure consistent UUID primary key patterns, consistent `is_active` soft-delete patterns, and consistent `created_at`/`updated_at` timestamps across all tables.

### B.3 OTP Flow — Redis-Based

OTP is NOT stored in the database. It is stored in Redis with a TTL. The pattern:

```
Redis Key:  otp:<mobile>          Value: { otp: "123456", attempts: 0 }
TTL:        600 seconds (10 min)

On OTP Send:   SET otp:9876543210 '{"otp":"847201","attempts":0}' EX 600
On OTP Verify: GET otp:9876543210 → compare → if match: DEL key
               if attempts >= 3: SET lock:9876543210 '1' EX 1800 (30 min lockout)
```

### B.4 JWT Token Strategy

- **Access Token:** Expires in 7 days. Contains: `{ id, role, email, mobile }`. Signed with `JWT_SECRET`.
- **Refresh Token:** Expires in 30 days. Stored in Redis as `refresh:<userId>`. Used to generate new access tokens.
- **Token Blacklist:** When user logs out, add their token to Redis set `blacklist:<token>` with TTL = token's remaining lifetime.
- Auth middleware checks blacklist before verifying token.

### B.5 Role Hierarchy

```
admin > fpo_admin > farmer = bulk_buyer = logistics = consumer
```

- `admin` can access all routes.
- `fpo_admin` can do everything a `farmer` can, plus manage FPO members.
- Other roles are peers with separate resource ownership.

### B.6 Notification Service Architecture

You are building ONE notification service that all other backend modules call. It has three channels:

```javascript
notificationService.sendSMS(mobile, message)        // MSG91
notificationService.sendEmail(email, subject, html)  // Gmail SMTP
notificationService.sendPush(fcmToken, title, body)  // Firebase FCM
```

Other modules (Tukesh's order module, etc.) call `notificationService.sendSMS(...)` — they never call MSG91 directly. You own this service.

### B.7 Antigravity — What You're Automating

After your backend is live, you will build 3 workflows in Antigravity:

**Workflow 1 — Daily Demand Forecast Refresh:**
Every morning at 5 AM IST, call your backend's `/api/webhooks/antigravity/refresh-forecasts` endpoint, which then calls Siddhesh's AI service to regenerate forecasts for all 10 districts × 20 crops.

**Workflow 2 — Order Notification Flow:**
When an order is placed (Tukesh's order service calls a webhook endpoint you provide: `/api/webhooks/antigravity/order-placed`), trigger: SMS to farmer, SMS to consumer, push notification if they have FCM token.

**Workflow 3 — Grievance Auto-Triage:**
When a grievance is submitted, POST to `/api/webhooks/antigravity/new-grievance`, which calls Groq API to classify severity, then routes to the right admin and sets SLA deadline.

### B.8 Admin API — What You Build

The admin module is backend-only from your side (Pratham builds the frontend for it).

Your admin endpoints:
```
GET /api/admin/stats          — Platform KPIs (total users, orders, GMV, active listings)
GET /api/admin/users          — Paginated user list with filters
PUT /api/admin/users/:id/status — Activate/deactivate a user
GET /api/admin/grievances     — List grievances with filters
PUT /api/admin/grievances/:id — Update grievance status + resolution note
GET /api/admin/reports/orders — Order volume by date range
GET /api/admin/reports/farmers — Top earning farmers
POST /api/admin/notifications/broadcast — Send SMS/push to all users of a role
```

All admin routes protected by: `authMiddleware + requireRole('admin')`.

### B.9 Environment Variables You Manage

You set up and share these with the team:
```
DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
JWT_SECRET, JWT_REFRESH_SECRET
MSG91_AUTH_KEY, MSG91_TEMPLATE_ID
GMAIL_USER, GMAIL_APP_PASSWORD
FIREBASE_PROJECT_ID, FIREBASE_SERVER_KEY
ANTIGRAVITY_WEBHOOK_SECRET
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
```

Siddhesh provides: `GROQ_API_KEY`, `GEMINI_API_KEY`
Tukesh provides: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_*`, `ORS_API_KEY`

---

*Context version: 1.0 | Manthan | Kisan Connect SIH 2026*
