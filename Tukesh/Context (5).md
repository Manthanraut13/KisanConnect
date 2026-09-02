# CONTEXT.md — Tukesh
## Full Project Context + Marketplace Backend Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect eliminates 10+ intermediaries between Indian farmers and consumers. Farmers earn only 15–30% of consumer prices today. Our platform gives them a direct digital marketplace with AI-recommended pricing, demand forecasting, and optimized logistics.

### Prototype Must Show
1. Farmer creates listing → sees AI price suggestion.
2. Consumer browses, adds to cart, pays via Razorpay (test).
3. AI demand forecast dashboard (Siddhesh's AI + your DB endpoint).
4. Route optimization map (Siddhesh's AI + your logistics assignment).
5. Admin panel, chatbot.

### Full Tech Stack
- Frontend: React.js + Vite + Tailwind + shadcn/ui (Vercel)
- **Backend: Node.js + Express + Sequelize + PostgreSQL** ← Shared with Manthan
- AI Service: Python Flask (Railway.app)
- Database: PostgreSQL (Supabase) + Redis (Upstash)
- Images: Cloudinary
- Payments: Razorpay
- AI Tools: OpenCode + Antigravity (Manthan's) + **Omniroute (yours)**

### Team Interfaces
| Member | How they depend on you |
|---|---|
| Manthan | You use his: DB models, auth middleware, notification service |
| Siddhesh | You call his: `/ai/price/recommend` on listing create; `/ai/logistics/optimize-route` for driver assignment |
| Sunidhi | She calls your: GET/POST `/api/listings/*`, farmer dashboard data APIs |
| Payal | She calls your: GET `/api/listings`, POST `/api/cart/*`, POST `/api/orders`, GET `/api/orders/:id` |
| Pratham | He calls your: GET `/api/admin/orders`, GET/PUT `/api/logistics/*` |

---

## PART B — TUKESH'S SPECIFIC CONTEXT

### B.1 Listing Module — Key Business Rules

- Only users with role `farmer` or `fpo_admin` can create listings.
- A listing's `lot_number` must be unique and auto-generated: format `KC-{YEAR}-{STATE_CODE}-{DISTRICT_CODE}-{5_DIGIT_SEQUENCE}`. Example: `KC-2026-MH-NAS-00042`.
- `available_kg` starts equal to `quantity_kg` and decreases as orders are placed.
- If `available_kg` reaches 0, set `is_active = false` automatically.
- When a listing is created: call Siddhesh's `/ai/price/recommend` to populate `ai_suggested_price`. If AI service is down, set `ai_suggested_price = null` (do not fail the listing creation).
- After listing is created: generate a QR code using the `qrcode` npm package. Upload to Cloudinary. Save URL as `qr_code_url`.
- Images: accept up to 5 images via Multer. Upload each to Cloudinary. Save array of URLs.

### B.2 Order Module — Key Business Rules

- Orders are atomic: either all items in cart are ordered, or none (use DB transactions).
- `subtotal` = sum of (quantity_kg × price_per_kg) for all items.
- `delivery_charge` = ₹30 if within 10km (use fixed ₹30 for prototype).
- `gst_amount` = 0 for fresh vegetables/fruits (GST rate = 0%).
- `total_amount` = subtotal + delivery_charge + gst_amount - discount.
- `farmer_payout` per item = item_total × 0.95 (platform takes 5% commission).
- `platform_commission` per item = item_total × 0.05.
- When order placed: deduct `quantity_kg` from listing's `available_kg` using a DB transaction to prevent race conditions.
- After payment confirmed: trigger Manthan's Antigravity webhook `order-placed` (POST to `/api/webhooks/antigravity/order-placed`).
- Invoice: generate PDF using pdfkit, upload to Cloudinary, save URL as `invoice_url`.

### B.3 Payment Module — Razorpay Flow (Test Mode)

**Step 1 — Frontend calls:** `POST /api/payments/create-order`  
Backend creates a Razorpay order (`razorpay.orders.create({ amount, currency, receipt })`).  
Returns `{ razorpay_order_id, amount, currency, key_id }` to frontend.

**Step 2 — Frontend:** Opens Razorpay checkout modal with these details. User pays.

**Step 3 — On payment success:** Razorpay gives frontend: `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`.

**Step 4 — Frontend calls:** `POST /api/payments/verify`  
Backend verifies signature: `razorpay.webhooks.verify(orderId + "|" + paymentId, signature, secret)`.  
If valid: update Order `payment_status = 'paid'`, create Payment record, trigger notification webhook.

**Step 5 — Razorpay Webhook (backup):** `POST /api/payments/webhook`  
Verify webhook signature. Handle `payment.captured` event to ensure payment is marked paid even if frontend fails.

**Test Cards for Demo:**
- Success: Card `4111 1111 1111 1111`, CVV `123`, Expiry any future
- UPI: `success@razorpay`
- Failure: Card `4000 0000 0000 0002`

### B.4 Logistics Module — Key Business Rules

- After an order's `payment_status = 'paid'`, it is eligible for logistics assignment.
- Driver assignment: find nearest `LogisticsPartner` with `status = 'available'` and `district = order.delivery_address.district`.
- If no driver found: set Order status to `packed` (awaiting driver). Retry every hour (Antigravity future feature — prototype: manual admin assignment).
- Once driver assigned: POST to Siddhesh's AI service for route optimization.
- Driver earnings: 80% of `delivery_charge`.
- Delivery confirmation: driver uploads a photo (Multer → Cloudinary). Update Assignment `status = 'delivered'`, Order `status = 'delivered'`.

### B.5 Internal Forecast Save Endpoint

Siddhesh's batch job calls this after running all forecasts:
```
POST /api/internal/forecasts/upsert
Headers: x-internal-secret: <INTERNAL_SECRET>
Body: { crop_name, district, forecast: [{date, predicted_price, ...}], model_version }
```

This endpoint: verifies internal secret, upserts into `demand_forecasts` table (insert if not exists, update if exists for same crop+district+date). Returns `{ success: true, upserted: N }`.

### B.6 Omniroute Configuration

Omniroute is a YAML/JSON-based API gateway configuration. You define routes and rules.

Create `infrastructure/omniroute/config.yaml`:
```yaml
services:
  backend:
    url: ${BACKEND_URL}
    health: /health
  ai_service:
    url: ${AI_SERVICE_URL}
    health: /health

routes:
  - path: /api/auth/*
    service: backend
    auth: none
  
  - path: /api/payments/webhook
    service: backend
    auth: none
    methods: [POST]
  
  - path: /api/internal/*
    service: backend
    auth: internal_secret
  
  - path: /api/*
    service: backend
    auth: jwt
  
  - path: /ai/*
    service: ai_service
    auth: jwt

rate_limits:
  - path: /api/auth/send-otp
    max: 5
    window: 900  # 15 minutes
  - path: /api/*
    max: 100
    window: 900

cors:
  allowed_origins:
    - ${FRONTEND_URL}
  allowed_methods: [GET, POST, PUT, DELETE, OPTIONS]
  allowed_headers: [Content-Type, Authorization]
```

### B.7 Commission Structure in Code

```javascript
const PLATFORM_COMMISSION_RATE = 0.05;   // 5%
const DELIVERY_CHARGE_FLAT = 30;          // ₹30 flat prototype
const DRIVER_COMMISSION_RATE = 0.80;      // 80% of delivery charge
const GST_RATE_FRESH_PRODUCE = 0.00;     // 0% for fresh veg/fruit
```

---

*Context version: 1.0 | Tukesh | Kisan Connect SIH 2026*
