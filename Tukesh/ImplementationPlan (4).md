# IMPLEMENTATION PLAN — Tukesh
## Day-by-Day Build Guide: Marketplace Backend + Payments + Logistics + Omniroute

---

## PRE-START CHECKLIST

- [ ] Sign up for Razorpay → https://dashboard.razorpay.com/signup → Get Test API Keys
- [ ] Sign up for Cloudinary → https://cloudinary.com → Free account → Get Cloud Name, API Key, API Secret
- [ ] Sign up for OpenRouteService → https://openrouteservice.org/sign-up → Get API Key
- [ ] Wait for Manthan to set up GitHub repo (Day 1) — then clone
- [ ] Wait for Manthan to share `DATABASE_URL`, `JWT_SECRET`, auth middleware files (Day 2)
- [ ] Get Siddhesh's Railway URL once AI service is deployed (Day 3–4)
- [ ] Register on Omniroute dashboard

---

## DAY 1 — OMNIROUTE + ENVIRONMENT SETUP

### Step 1: Clone Repo and Set Up Backend Folder

```bash
git clone https://github.com/<org>/kisan-connect.git
cd kisan-connect
git checkout -b feature/tukesh/marketplace
cd backend
npm install  # Manthan already set up package.json
```

Add your `.env` variables:
```
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ORS_API_KEY=your_ors_key
AI_SERVICE_URL=http://localhost:8000  # Update after Siddhesh deploys
ANTIGRAVITY_WEBHOOK_ORDER_URL=<get from Manthan>
INTERNAL_SECRET=<agree with Manthan, same value on both sides>
```

### Step 2: Configure Omniroute

Create `infrastructure/omniroute/config.yaml` — copy from Context.md Section B.6.

Log into Omniroute dashboard:
1. Create new project: "kisan-connect"
2. Import the config.yaml
3. Set environment variables in Omniroute dashboard (BACKEND_URL, AI_SERVICE_URL, FRONTEND_URL)
4. Deploy
5. Note the Omniroute public URL
6. **Share URL immediately with Sunidhi, Payal, Pratham** — they need this for `VITE_API_URL`
7. Share URL with Manthan (he adds it to backend CORS config)

### Step 3: Initialize Cloudinary Config

Create `backend/src/config/cloudinary.config.js`:
```javascript
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
module.exports = cloudinary;
```

### Step 4: Create Multer Middleware

```javascript
// backend/src/middleware/upload.middleware.js
const multer = require('multer');

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WEBP images allowed'), false);
};

const upload = multer({
  storage: multer.memoryStorage(), // Store in memory, upload to Cloudinary directly
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB max, 5 files max
  fileFilter: imageFilter
});

module.exports = upload;
```

### Step 5: Create Cloudinary Upload Helper

```javascript
// backend/src/services/cloudinary.service.js
const cloudinary = require('../config/cloudinary.config');

const uploadImage = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => err ? reject(err) : resolve(result.secure_url)
    ).end(buffer);
  });
};

const uploadMultiple = async (files, folder) => {
  return Promise.all(files.map(f => uploadImage(f.buffer, folder)));
};

module.exports = { uploadImage, uploadMultiple };
```

**Commit: `feature/tukesh/omniroute-and-setup`**

---

## DAY 2 — LISTING MODULE (PART 1): SERVICE + HELPERS

### Step 1: Get Manthan's Files

Confirm you have:
- `src/models/index.js` (all models exported)
- `src/middleware/auth.middleware.js`
- `src/middleware/role.middleware.js`
- `src/middleware/validate.middleware.js`
- `src/utils/AppError.js`

If any missing, ask Manthan before proceeding.

### Step 2: Create QR Code Utility

```javascript
// backend/src/utils/qrcode.utils.js
const QRCode = require('qrcode');
const cloudinaryService = require('../services/cloudinary.service');

const generateListingQR = async (listing) => {
  const qrData = JSON.stringify({
    version: '1.0',
    platform: 'KisanConnect',
    lot_number: listing.lot_number,
    crop: listing.crop_name,
    district: listing.district,
    harvest_date: listing.harvest_date,
    lot_kg: listing.quantity_kg,
    verify_url: `https://kisan-connect.vercel.app/trace/${listing.lot_number}`
  });
  
  const qrBuffer = await QRCode.toBuffer(qrData, { type: 'png', width: 400, margin: 2 });
  const url = await cloudinaryService.uploadImage(qrBuffer, 'qrcodes');
  return url;
};

module.exports = { generateListingQR };
```

### Step 3: Create Lot Number Generator

```javascript
// backend/src/utils/lotNumber.utils.js
const { Listing } = require('../models');

const STATE_CODES = {
  'Maharashtra': 'MH', 'Punjab': 'PB', 'Tamil Nadu': 'TN', 'Karnataka': 'KA',
  'Andhra Pradesh': 'AP', 'Rajasthan': 'RJ', 'Madhya Pradesh': 'MP',
  'Uttar Pradesh': 'UP', 'Gujarat': 'GJ', 'Bihar': 'BR'
};

const DISTRICT_CODES = {
  'Nashik': 'NAS', 'Pune': 'PUN', 'Amritsar': 'AMR', 'Ludhiana': 'LUD',
  'Coimbatore': 'CBE', 'Mysuru': 'MYS', 'Guntur': 'GNT', 'Jaipur': 'JPR',
  'Indore': 'IND', 'Varanasi': 'VNS'
};

const generateLotNumber = async (state, district) => {
  const year = new Date().getFullYear();
  const stateCode = STATE_CODES[state] || 'XX';
  const distCode = DISTRICT_CODES[district] || 'XXX';
  const count = await Listing.count({ where: { district } });
  const seq = String(count + 1).padStart(5, '0');
  return `KC-${year}-${stateCode}-${distCode}-${seq}`;
};

module.exports = { generateLotNumber };
```

### Step 4: Create Listing Service (first half)

Use OpenCode to generate `src/services/listing.service.js` with `createListing` and `getListings` functions. Use exact logic from Task.md Module 2.2.

---

## DAY 3 — LISTING MODULE (PART 2): CONTROLLER + ROUTES + TEST

### Step 1: Complete Listing Service

Add remaining functions using OpenCode:
- `getListingById(id)` — with farmer profile included
- `updateListing(id, userId, data)` — ownership check
- `deleteListing(id, userId)` — soft delete (`is_active = false`)
- `searchListings(query, pagination)` — PostgreSQL iLike search

### Step 2: Create Listing Controller

Use OpenCode:
```
"Generate listing.controller.js with: createListing, getListings, getListingById,
updateListing, deleteListing, getFarmerListings, searchListings.
Each: async(req,res,next) → try { service call } catch(err) { next(err) }.
Success returns: res.status(201 or 200).json({ success:true, message:'...', data:... })"
```

### Step 3: Create Listing Routes

```javascript
// backend/src/routes/listing.routes.js
const router = require('express').Router();
const listingController = require('../controllers/listing.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createListingSchema, updateListingSchema } = require('../middleware/validators/listing.validator');
const upload = require('../middleware/upload.middleware');

// Public routes
router.get('/', listingController.getListings);
router.get('/search', listingController.searchListings);
router.get('/:id', listingController.getListingById);

// Farmer-only routes
router.post('/',
  authMiddleware, requireRole('farmer', 'fpo_admin'),
  upload.array('images', 5),
  validate(createListingSchema),
  listingController.createListing
);
router.put('/:id', authMiddleware, requireRole('farmer', 'fpo_admin'), validate(updateListingSchema), listingController.updateListing);
router.delete('/:id', authMiddleware, requireRole('farmer', 'fpo_admin'), listingController.deleteListing);
router.get('/farmer/mine', authMiddleware, requireRole('farmer', 'fpo_admin'), listingController.getFarmerListings);

module.exports = router;
```

### Step 4: Register in `app.js`

Ask Manthan to add this line to his `src/app.js`:
```javascript
app.use('/api/listings', require('./routes/listing.routes'));
```

Or add it yourself if you both have access to app.js.

### Step 5: Test Listing Endpoints in Postman

1. Register a farmer (Manthan's auth endpoint).
2. Login → get JWT token.
3. `POST /api/listings` with token + image files + listing data.
4. Verify: listing created, QR code URL present, ai_suggested_price populated.
5. `GET /api/listings` → verify listing appears.
6. `GET /api/listings/:id` → verify farmer profile included.
7. `GET /api/listings/search?q=tomato` → verify search works.

**Commit: `feature/tukesh/listing-module`**

---

## DAY 4 — CART + ORDER MODULE

### Morning: Cart Service

Create `src/services/cart.service.js`:
- `addToCart(userId, { listingId, quantityKg })` — Redis-based, see Task.md Module 3.1
- `getCart(userId)` — returns array with current listing prices
- `updateCartItem(userId, itemIndex, quantityKg)`
- `removeCartItem(userId, itemIndex)`
- `clearCart(userId)`
- `getCartSummary(userId)` — calculates totals

Create `src/routes/cart.routes.js` and `src/controllers/cart.controller.js`.

### Afternoon: Order Service

Create `src/services/order.service.js` with `placeOrder` — copy exact implementation from Task.md Module 3.2.

Also create:
- `getOrders(userId, role, filters)` — role-aware (buyer sees own, farmer sees orders with their items, admin sees all)
- `getOrderById(id, userId, role)` — with items, payment, logistics
- `cancelOrder(id, userId)` — check status is 'pending' or 'confirmed'
- `updateOrderStatus(id, newStatus, userId, role)` — role-aware updates

Create `src/controllers/order.controller.js` and `src/routes/order.routes.js`.

**Test Order Flow:**
1. Login as consumer → add items to cart → place order
2. Verify: order created, stock deducted from listing, cart cleared
3. Verify: if listing quantity hits 0, `is_active` becomes false

**Commit: `feature/tukesh/cart-order-module`**

---

## DAY 5 — PAYMENT MODULE

### Step 1: Initialize Razorpay

```javascript
// backend/src/config/razorpay.config.js
const Razorpay = require('razorpay');
module.exports = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

### Step 2: Create Payment Service

Use OpenCode to generate `src/services/payment.service.js` with:
- `createRazorpayOrder(orderId, userId)` — see Task.md Module 4.2
- `verifyPayment(data)` — see Task.md Module 4.3 including invoice generation + Antigravity trigger
- `handleWebhook(payload, signature)` — verify Razorpay webhook signature, handle `payment.captured`

### Step 3: Invoice Utility

Create `src/utils/invoice.utils.js` — copy from Task.md Module 3.3.

### Step 4: Payment Routes

```javascript
// src/routes/payment.routes.js
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, paymentController.verify);
router.post('/webhook', paymentController.webhook); // NO auth — uses Razorpay signature
router.get('/history', authMiddleware, paymentController.getHistory);
```

### Step 5: Test Complete Payment Flow

1. Place order (Day 4 test order) → note order ID
2. `POST /api/payments/create-order` → get Razorpay order ID
3. Open Razorpay test checkout (test via Postman or simple HTML file)
4. Complete test payment with card `4111 1111 1111 1111`
5. `POST /api/payments/verify` with payment details
6. Verify: order status = 'confirmed', payment record created, invoice URL present

**Commit: `feature/tukesh/payment-module`**

---

## DAY 6 — LOGISTICS + INTERNAL ENDPOINT + INTEGRATION

### Step 1: Logistics Routes and Controller

Create `src/services/logistics.service.js` with `assignDriver` — see Task.md Module 5.2.

Add endpoints:
```javascript
// src/routes/logistics.routes.js
router.post('/assign/:orderId', authMiddleware, requireRole('admin'), logisticsController.assignDriver);
router.get('/driver/assignments', authMiddleware, requireRole('logistics'), logisticsController.getDriverAssignments);
router.put('/delivery/:id/start', authMiddleware, requireRole('logistics'), logisticsController.startDelivery);
router.put('/delivery/:id/confirm', authMiddleware, requireRole('logistics'), upload.single('proof'), logisticsController.confirmDelivery);
router.get('/track/:orderId', logisticsController.trackOrder); // Public
```

### Step 2: Internal Forecast Endpoint

Create `src/routes/internal.routes.js` — copy from Task.md Module 6.

Register in app.js:
```javascript
app.use('/api/internal', require('./routes/internal.routes'));
```

Test: ask Siddhesh to call this endpoint once his batch forecast runs.

### Step 3: Full Integration Test

Run through the complete user journey:
1. Farmer creates listing → AI price shown ✓
2. Consumer browses → searches → finds listing ✓
3. Consumer adds to cart → views summary ✓
4. Consumer places order → stock deducted ✓
5. Consumer pays → order confirmed → invoice generated ✓
6. Admin assigns driver → route optimized ✓
7. Driver confirms delivery → order delivered ✓

**Commit: `feature/tukesh/logistics-and-integration`**

---

## DAY 7 — POSTMAN COLLECTION + BUFFER

### Export Postman Collection

Create a complete Postman collection with all endpoints:
- Auth endpoints (register, login, OTP)
- Listing endpoints (CRUD + search)
- Cart endpoints
- Order endpoints
- Payment endpoints (create-order, verify)
- Logistics endpoints
- Admin endpoints

Export as JSON → save to `docs/postman_collection.json` → commit.

### Add Test Data for Demo

Using seed scripts or direct Postman calls, create:
- 3 demo farmer accounts with complete profiles
- 10 demo listings across 5 crops
- 3 demo consumer accounts
- 2 demo orders in various statuses (for admin panel demo)
- 1 demo logistics partner

Document demo credentials in `docs/DEMO_CREDENTIALS.md` (do NOT commit to public repo).

---

## COMMIT SCHEDULE

| Day | Branch | Target |
|---|---|---|
| Day 1 | `feature/tukesh/omniroute-and-setup` | Omniroute live + Cloudinary configured |
| Day 2 | `feature/tukesh/listing-helpers` | QR util + lot gen + cloudinary service |
| Day 3 | `feature/tukesh/listing-module` | Full listing CRUD working + Postman tested |
| Day 4 | `feature/tukesh/cart-order-module` | Cart + Order placement working |
| Day 5 | `feature/tukesh/payment-module` | Razorpay payment flow working end-to-end |
| Day 6 | `feature/tukesh/logistics-integration` | Driver assignment + internal endpoint |
| Day 7 | `dev` | PR merged, Postman collection committed |

---

*Implementation Plan v1.0 | Tukesh | Kisan Connect SIH 2026*
