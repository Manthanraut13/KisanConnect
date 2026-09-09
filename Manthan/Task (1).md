# TASK.md — Manthan
## Backend Foundation: Auth + Database + Notifications + Admin + Antigravity

---

## ASSIGNED MODULES

| # | Module | Priority | Estimated Days |
|---|---|---|---|
| 1 | Project Setup & Repository | CRITICAL | 0.5 days |
| 2 | Database Schema (All Models + Migrations) | CRITICAL | 1.5 days |
| 3 | Authentication Module (Full) | CRITICAL | 2 days |
| 4 | Notification Service | HIGH | 1 day |
| 5 | Admin API Endpoints | HIGH | 1.5 days |
| 6 | Antigravity Workflows (3 workflows) | MEDIUM | 1.5 days |
| 7 | CI/CD & Deployment | MEDIUM | 0.5 day |
| **Total** | | | **~8.5 days** |

---

## MODULE 1 — PROJECT SETUP

### 1.1 GitHub Repository Setup

Create repository: `kisan-connect` with the following:

```
kisan-connect/
├── frontend/              (Sunidhi, Payal, Pratham work here)
├── backend/               (Manthan, Tukesh work here)
├── ai-service/            (Siddhesh works here)
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .gitignore
├── README.md
└── docker-compose.yml
```

Branch setup:
- `main` — Protected. Only Manthan can push.
- `dev` — Integration branch. All PRs merge here. Requires 1 review.
- Members create: `feature/<name>/<feature>`.

### 1.2 Backend Project Init

```bash
mkdir backend && cd backend
npm init -y
npm install express sequelize pg pg-hstore bcryptjs jsonwebtoken joi multer
npm install cloudinary nodemailer qrcode pdfkit razorpay
npm install express-rate-limit helmet cors morgan winston dotenv
npm install @upstash/redis groq firebase-admin
npm install -D nodemon jest supertest
```

Create `backend/.env.example` with ALL variables (from Context.md B.9).

### 1.3 Docker Setup

Create `docker-compose.yml` at root with services:
- `backend` — Node.js on port 5000
- `ai-service` — Python Flask on port 8000
- `postgres` — PostgreSQL (for local dev only; prod uses Supabase)
- `redis` — Redis (for local dev only; prod uses Upstash)

---

## MODULE 2 — DATABASE SCHEMA

### 2.1 Sequelize Setup

```javascript
// backend/src/config/db.config.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false } // Required for Supabase
  },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = { sequelize };
```

### 2.2 Models to Create (Full List)

For each model, create: `backend/src/models/<Name>.model.js`

**Model 1: User**
Fields: `id (UUID PK)`, `full_name (STRING 100, not null)`, `email (STRING 150, unique)`, `mobile (STRING 15, unique, not null)`, `password_hash (STRING 255)`, `role (ENUM: farmer/fpo_admin/consumer/bulk_buyer/logistics/admin)`, `is_verified (BOOLEAN, default false)`, `is_active (BOOLEAN, default true)`, `profile_image (STRING 500)`, `preferred_lang (STRING 10, default 'hi')`, `fcm_token (STRING 500, null)`, timestamps.

**Model 2: Farmer**
Fields: `id (UUID PK)`, `user_id (UUID FK → users.id)`, `aadhaar_hash (STRING 64)`, `bank_account (STRING 20)`, `bank_ifsc (STRING 11)`, `bank_name (STRING 100)`, `village (STRING 100)`, `taluka (STRING 100)`, `district (STRING 100, not null)`, `state (STRING 100, not null)`, `pin_code (STRING 6)`, `latitude (DECIMAL 10,8)`, `longitude (DECIMAL 11,8)`, `land_area_acres (DECIMAL 8,2)`, `is_kyc_done (BOOLEAN, default false)`, `kyc_document_url (STRING 500)`, `total_earnings (DECIMAL 12,2, default 0)`, `rating (DECIMAL 3,2, default 0)`, `rating_count (INTEGER, default 0)`, `fpo_id (UUID FK → fpos.id, null)`, timestamps.

**Model 3: FPO**
Fields: `id (UUID PK)`, `admin_user_id (UUID FK → users.id)`, `name (STRING 200, not null)`, `registration_number (STRING 50, unique)`, `district (STRING 100)`, `state (STRING 100)`, `contact_email (STRING 150)`, `contact_mobile (STRING 15)`, `is_verified (BOOLEAN, default false)`, `is_active (BOOLEAN, default true)`, timestamps.

**Model 4: BulkBuyer**
Fields: `id (UUID PK)`, `user_id (UUID FK → users.id)`, `business_name (STRING 200)`, `gstin (STRING 15)`, `business_type (ENUM: hotel/restaurant/canteen/school/exporter/retailer/other)`, `district (STRING 100)`, `state (STRING 100)`, `is_verified (BOOLEAN, default false)`, timestamps.

**Model 5: LogisticsPartner**
Fields: `id (UUID PK)`, `user_id (UUID FK → users.id)`, `vehicle_type (ENUM: bike/auto/mini_truck/truck)`, `vehicle_number (STRING 20)`, `license_number (STRING 20)`, `district (STRING 100)`, `state (STRING 100)`, `current_lat (DECIMAL 10,8)`, `current_lng (DECIMAL 11,8)`, `status (ENUM: available/busy/offline, default offline)`, `is_verified (BOOLEAN, default false)`, `total_earnings (DECIMAL 12,2, default 0)`, `rating (DECIMAL 3,2, default 0)`, timestamps.

**Model 6: Listing** (you create, Tukesh fills logic)
Fields: `id (UUID PK)`, `farmer_id (UUID FK → farmers.id)`, `crop_name (STRING 100, not null)`, `crop_category (STRING 50)`, `variety (STRING 100)`, `quantity_kg (DECIMAL 10,2, not null)`, `available_kg (DECIMAL 10,2, not null)`, `price_per_kg (DECIMAL 8,2, not null)`, `ai_suggested_price (DECIMAL 8,2)`, `min_order_kg (DECIMAL 8,2, default 1)`, `quality_grade (ENUM: A/B/C, default B)`, `harvest_date (DATEONLY, not null)`, `expiry_date (DATEONLY)`, `description (TEXT)`, `images (ARRAY of TEXT)`, `is_organic (BOOLEAN, default false)`, `is_active (BOOLEAN, default true)`, `district (STRING 100)`, `state (STRING 100)`, `latitude (DECIMAL 10,8)`, `longitude (DECIMAL 11,8)`, `qr_code_url (STRING 500)`, `lot_number (STRING 50, unique)`, `views_count (INTEGER, default 0)`, timestamps.

**Model 7: Order** (you create, Tukesh fills logic)
Fields: `id (UUID PK)`, `buyer_id (UUID FK → users.id)`, `status (ENUM: pending/confirmed/packed/in_transit/delivered/cancelled/refunded, default pending)`, `order_type (ENUM: retail/bulk, default retail)`, `subtotal (DECIMAL 12,2, not null)`, `delivery_charge (DECIMAL 8,2, default 0)`, `discount (DECIMAL 8,2, default 0)`, `gst_amount (DECIMAL 8,2, default 0)`, `total_amount (DECIMAL 12,2, not null)`, `delivery_address (JSON, not null)`, `delivery_slot (DATE)`, `payment_status (ENUM: pending/paid/refunded/failed, default pending)`, `notes (TEXT)`, `invoice_url (STRING 500)`, `razorpay_order_id (STRING 100)`, timestamps.

**Model 8: OrderItem** (you create, Tukesh fills)
Fields: `id (UUID PK)`, `order_id (UUID FK → orders.id)`, `listing_id (UUID FK → listings.id)`, `farmer_id (UUID FK → farmers.id)`, `crop_name (STRING 100)`, `quantity_kg (DECIMAL 10,2)`, `price_per_kg (DECIMAL 8,2)`, `total_price (DECIMAL 10,2)`, `farmer_payout (DECIMAL 10,2)`, `platform_commission (DECIMAL 8,2)`, timestamps.

**Model 9: Payment** (you create, Tukesh fills)
Fields: `id (UUID PK)`, `order_id (UUID FK → orders.id)`, `razorpay_order_id (STRING 100)`, `razorpay_payment_id (STRING 100)`, `razorpay_signature (STRING 500)`, `amount (DECIMAL 12,2)`, `currency (STRING 5, default INR)`, `status (ENUM: pending/captured/failed/refunded)`, `method (STRING 20)`, `refund_id (STRING 100)`, timestamps.

**Model 10: LogisticsAssignment** (you create, Tukesh/Siddhesh fills)
Fields: `id (UUID PK)`, `order_id (UUID FK → orders.id)`, `driver_id (UUID FK → logistics_partners.id)`, `pickup_location (JSON)`, `delivery_location (JSON)`, `optimized_route (JSON)`, `estimated_km (DECIMAL 8,2)`, `estimated_minutes (INTEGER)`, `actual_delivery_at (DATE)`, `status (ENUM: assigned/picked_up/in_transit/delivered/failed, default assigned)`, `proof_image (STRING 500)`, `driver_earnings (DECIMAL 8,2)`, timestamps.

**Model 11: Grievance** (you create + own)
Fields: `id (UUID PK)`, `user_id (UUID FK → users.id)`, `order_id (UUID FK → orders.id, null)`, `category (ENUM: payment/logistics/quality/fraud/other)`, `severity (ENUM: low/medium/high/critical, default medium)`, `description (TEXT, not null)`, `status (ENUM: open/in_progress/resolved/closed, default open)`, `assigned_to (UUID FK → users.id, null)`, `resolution_note (TEXT)`, `sla_deadline (DATE)`, `resolved_at (DATE)`, timestamps.

**Model 12: NotificationLog** (you create + own)
Fields: `id (UUID PK)`, `user_id (UUID FK → users.id)`, `channel (ENUM: sms/email/push)`, `recipient (STRING 200)`, `subject (STRING 200)`, `body (TEXT)`, `status (ENUM: sent/failed)`, `error_message (TEXT)`, timestamps.

**Model 13: DemandForecast** (you create, Siddhesh fills)
Fields: `id (UUID PK)`, `crop_name (STRING 100, not null)`, `district (STRING 100)`, `state (STRING 100)`, `forecast_date (DATEONLY, not null)`, `predicted_price (DECIMAL 8,2)`, `lower_bound (DECIMAL 8,2)`, `upper_bound (DECIMAL 8,2)`, `confidence_score (DECIMAL 5,4)`, `demand_index (INTEGER)`, `model_version (STRING 20)`, timestamps. Unique: `(crop_name, district, forecast_date)`.

**Model 14: WorkflowLog** (you create + own)
Fields: `id (UUID PK)`, `workflow_name (STRING 100)`, `trigger_type (STRING 50)`, `status (ENUM: success/failed)`, `execution_time_ms (INTEGER)`, `payload (JSON)`, `error_message (TEXT)`, timestamps.

### 2.3 Associations File

Create `backend/src/models/associations.js`:
```javascript
const User = require('./User.model');
const Farmer = require('./Farmer.model');
// ... all models

User.hasOne(Farmer, { foreignKey: 'user_id', as: 'farmerProfile' });
Farmer.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasOne(Payment, { foreignKey: 'order_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

Farmer.hasMany(Listing, { foreignKey: 'farmer_id', as: 'listings' });
Listing.belongsTo(Farmer, { foreignKey: 'farmer_id' });
// ... etc
```

### 2.4 Seed Data

Create `database/seed.sql` with:
- 5 test farmers (districts: Nashik, Pune, Amritsar, Coimbatore, Jaipur)
- 3 test consumers
- 2 test bulk buyers
- 1 test admin account
- 20 test produce listings (4 per farmer)
- 10 test orders in various statuses
- 5 test grievances

---

## MODULE 3 — AUTHENTICATION MODULE

### 3.1 API Endpoints to Build

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/refresh-token
POST /api/auth/logout
GET  /api/auth/google               (Google OAuth redirect)
GET  /api/auth/google/callback      (Google OAuth callback)
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/users/me                  (get own profile)
PUT  /api/users/me                  (update own profile)
POST /api/users/me/profile-image    (upload profile photo)
POST /api/users/me/complete-profile (submit KYC + farmer details)
```

### 3.2 Validation Schemas (Joi)

```javascript
// middleware/validators/auth.validator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  full_name:  Joi.string().min(2).max(100).required(),
  mobile:     Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
                'string.pattern.base': 'Enter a valid 10-digit Indian mobile number'
              }),
  email:      Joi.string().email().optional(),
  password:   Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
                .messages({ 'string.pattern.base': 'Password must have uppercase, lowercase, and number' }),
  role:       Joi.string().valid('farmer','consumer','bulk_buyer','logistics').required(),
});

const loginSchema = Joi.object({
  mobile:   Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  email:    Joi.string().email().optional(),
  password: Joi.string().required(),
}).or('mobile', 'email');

const otpSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp:    Joi.string().length(6).pattern(/^\d{6}$/).required(),
});
```

### 3.3 OTP Service

```javascript
// backend/src/services/otp.service.js
// Uses Redis to store OTP with TTL
// Uses MSG91 to send SMS
// Exports: sendOTP(mobile), verifyOTP(mobile, otp)
```

Key logic:
- Generate 6-digit OTP using `Math.floor(100000 + Math.random() * 900000)`.
- Store in Redis: key `otp:${mobile}`, value `JSON.stringify({otp, attempts: 0})`, TTL 600.
- Before sending: check if `lock:${mobile}` exists in Redis → if yes, return error "Too many attempts".
- Send via MSG91 REST API.
- Verify: GET from Redis, compare, increment attempts. If attempts >= 3: set lock, delete OTP key.

### 3.4 JWT Utils

```javascript
// backend/src/utils/jwt.utils.js
const generateAccessToken = (userId, role) => 
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateRefreshToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  // Store in Redis: SET refresh:${userId} ${token} EX 2592000
  return token;
};

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
```

---

## MODULE 4 — NOTIFICATION SERVICE

### 4.1 SMS via MSG91

```javascript
// backend/src/services/notification.service.js
const sendSMS = async (mobile, message) => {
  // POST to MSG91 API
  // Log to NotificationLog model
  // Return { success: true/false }
};
```

MSG91 API endpoint: `https://api.msg91.com/api/v5/flow/`  
Use template-based SMS for OTP (required by TRAI).  
For other SMS: use transactional route.

### 4.2 Email via Nodemailer

```javascript
const sendEmail = async (to, subject, htmlBody) => {
  // Use Gmail SMTP transporter
  // Log to NotificationLog model
};
```

Templates to create (HTML files in `backend/src/templates/email/`):
- `welcome.html` — After registration
- `order-confirmation.html` — After successful order
- `otp.html` — OTP email fallback
- `invoice.html` — Order invoice

### 4.3 Push Notification via Firebase FCM

```javascript
const sendPush = async (fcmToken, title, body, data = {}) => {
  // Use firebase-admin SDK
  // admin.messaging().send({ token: fcmToken, notification: {title, body}, data })
};
```

---

## MODULE 5 — ADMIN API ENDPOINTS

Build all endpoints listed in Context.md Section B.8.

Key implementation details:
- `GET /api/admin/stats`: Run 5 COUNT queries on users, orders, listings. Calculate GMV (SUM of orders.total_amount WHERE payment_status = 'paid'). Cache result in Redis with 5-minute TTL.
- `GET /api/admin/users`: Paginated with filters (role, is_active, district). Use Sequelize `findAndCountAll`.
- `PUT /api/admin/users/:id/status`: Toggle `is_active`. Send notification to user if deactivated.
- Grievance endpoints: Use Sequelize with associations to include user name and order info.
- All routes protected by `authMiddleware + requireRole('admin')`.

---

## MODULE 6 — ANTIGRAVITY WORKFLOWS

### Workflow 1: Daily Forecast Refresh
```
Trigger: CRON — 5:00 AM IST daily
Node 1: HTTP POST to /api/webhooks/antigravity/refresh-forecasts
         Headers: { x-antigravity-secret: <ANTIGRAVITY_WEBHOOK_SECRET> }
Node 2: Backend endpoint calls AI service /ai/forecast/batch
Node 3: Results saved to demand_forecasts table
Node 4: Log to workflow_logs via /api/webhooks/antigravity/log
```

Create the webhook endpoint in backend:
```
POST /api/webhooks/antigravity/refresh-forecasts
POST /api/webhooks/antigravity/order-placed
POST /api/webhooks/antigravity/new-grievance
POST /api/webhooks/antigravity/log
```

Each webhook verifies `x-antigravity-secret` header matches `.env` value.

### Workflow 2: Order Notification Flow
```
Trigger: Webhook POST from Tukesh's order service
         (Tukesh calls /api/webhooks/antigravity/order-placed after payment success)
Node 1: Extract { order_id, farmer_mobile, consumer_mobile, farmer_name, crop, amount }
Node 2: Send SMS to farmer: "New order! {crop} {qty}kg for ₹{amount}. Prepare by {date}."
Node 3: Send SMS to consumer: "Order confirmed! {crop} from {farmer_name}. Track: /orders/{id}"
Node 4: Log workflow execution
```

### Workflow 3: Grievance Auto-Triage
```
Trigger: Webhook POST from grievance submission endpoint
Node 1: Extract { grievance_id, description, user_name, order_id }
Node 2: HTTP POST to Groq API
         Prompt: "Classify this grievance. Category: payment/logistics/quality/fraud/other.
                  Severity: low/medium/high/critical. Return JSON only: {category, severity, suggested_resolution}"
         Body: { description }
Node 3: PATCH /api/grievances/:id with { category, severity, sla_deadline }
Node 4: Send email to appropriate admin based on severity
Node 5: Send SMS to user: "Grievance #{id} received. We'll resolve it by {sla_deadline}."
```

---

## MODULE 7 — CI/CD

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD — Kisan Connect
on:
  push:
    branches: [main]
  pull_request:
    branches: [dev]

jobs:
  lint-and-test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test

  deploy-frontend:
    needs: lint-and-test-backend
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: lint-and-test-backend
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## DELIVERABLES CHECKLIST

By Day 2 (handoff to team):
- [ ] GitHub repo created with branch protection
- [ ] Backend folder structure complete
- [ ] All 14 Sequelize models created
- [ ] All migrations written and tested against Supabase
- [ ] Seed data loaded into dev database
- [ ] `.env.example` shared with team
- [ ] Auth endpoints working (tested in Postman)
- [ ] Notification service working (SMS + email tested)

By Day 5:
- [ ] Admin API endpoints complete
- [ ] Antigravity workflows built and tested

By Day 7:
- [ ] CI/CD pipeline working
- [ ] Backend deployed to Render.com

---

## OPENCODE PROMPTS CHEAT SHEET

Use these exact prompts with OpenCode:

**For Sequelize Model generation:**
```
"Generate a Sequelize model for the [ModelName] table in /backend/src/models/[Name].model.js.
Fields: [paste field list from Module 2.2].
Rules: UUID primary key with UUIDV4 default, timestamps: true, underscored: true.
Import sequelize from '../config/db.config'. Do NOT define associations here."
```

**For Controller generation:**
```
"Generate a Node.js Express controller function [functionName] in /backend/src/controllers/[name].controller.js.
Purpose: [describe what it does].
Inputs: req.body = { [fields] }, req.user = { id, role } (set by auth middleware).
It calls [serviceName].[function] from ../services/[name].service.js.
Returns: { success: true, message: '...', data: result } with status [code].
Use async/await. Pass errors to next(error)."
```

---

*Task version: 1.0 | Manthan | Kisan Connect SIH 2026*
