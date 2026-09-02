# TASK.md — Tukesh
## Marketplace Backend: Listings + Orders + Payments + Logistics + Omniroute

---

## ASSIGNED MODULES

| # | Module | Priority | Est. Days |
|---|---|---|---|
| 1 | Omniroute Configuration | CRITICAL | 0.5 |
| 2 | Listing Module (Backend) | CRITICAL | 2 |
| 3 | Order + Cart Module (Backend) | CRITICAL | 2 |
| 4 | Payment Module (Razorpay) | CRITICAL | 1.5 |
| 5 | Logistics Assignment Backend | HIGH | 1.5 |
| 6 | Internal Forecast Save Endpoint | MEDIUM | 0.5 |
| 7 | Integration + Testing | MEDIUM | 0.5 |
| **Total** | | | **~8.5 days** |

---

## DEPENDENCIES (Get from Manthan by Day 2)

Before starting Module 2, you need from Manthan:
- [ ] Confirmation that `Listing`, `Order`, `OrderItem`, `Payment`, `LogisticsAssignment` models are created in DB
- [ ] Auth middleware: `src/middleware/auth.middleware.js` and `role.middleware.js`
- [ ] Notification service: `src/services/notification.service.js`
- [ ] Validator middleware: `src/middleware/validate.middleware.js`
- [ ] Supabase `DATABASE_URL` (to connect your own Postman tests)
- [ ] `ANTIGRAVITY_WEBHOOK_URL_ORDER_PLACED` (the Antigravity webhook URL for order notifications)

From Siddhesh (get by Day 3):
- [ ] AI service deployed URL on Railway.app
- [ ] Confirmed format of `POST /ai/price/recommend` (input + output)
- [ ] Confirmed format of `POST /ai/logistics/optimize-route`

---

## MODULE 1 — OMNIROUTE CONFIGURATION

### Create Config File

`infrastructure/omniroute/config.yaml` — see Context.md Section B.6 for full content.

### Create Omniroute Setup README

`infrastructure/omniroute/README.md`:
```markdown
# Omniroute Configuration — Kisan Connect

## What Omniroute Does
Routes all incoming requests from the frontend to the correct backend service.
The frontend calls ONE base URL (Omniroute's URL). Omniroute routes to:
- Backend (Node.js :5000) for /api/* routes
- AI Service (Flask :8000) for /ai/* routes

## Setup Steps
1. Sign into Omniroute dashboard
2. Create new project: "kisan-connect"
3. Import config.yaml
4. Set environment variables: BACKEND_URL, AI_SERVICE_URL, FRONTEND_URL
5. Deploy Omniroute project
6. Note the assigned Omniroute URL — this is VITE_API_URL for the frontend

## Testing
curl https://<omniroute-url>/health → should return 200 from backend
curl https://<omniroute-url>/api/auth/test → should route to backend
```

### Notify All Frontend Members

Once Omniroute URL is confirmed: share with Sunidhi, Payal, Pratham.
They set `VITE_API_URL=<omniroute-url>` in their frontend `.env`.

---

## MODULE 2 — LISTING MODULE

### 2.1 Endpoints to Build

```
POST   /api/listings              Create listing (farmer only)
GET    /api/listings              Browse listings (public, paginated, filtered)
GET    /api/listings/:id          Get single listing detail
PUT    /api/listings/:id          Update listing (owner only)
DELETE /api/listings/:id          Soft delete listing (owner only)
GET    /api/listings/farmer/mine  Get own listings (farmer only)
POST   /api/listings/:id/images   Upload additional images
GET    /api/listings/search       Full-text search
```

### 2.2 Listing Service — `src/services/listing.service.js`

**`createListing(data, userId, imageFiles)`:**
1. Find Farmer record by `user_id = userId`. If not found → throw 404.
2. Upload images to Cloudinary: `cloudinary.uploader.upload_stream(...)`. Store URLs array.
3. Generate `lot_number`: `KC-${year}-${stateCode}-${distCode}-${padded_seq}`.
   - Get sequence: `SELECT COUNT(*) FROM listings WHERE district = ?` → increment.
   - State codes: `{ Maharashtra: 'MH', Punjab: 'PB', 'Tamil Nadu': 'TN', Karnataka: 'KA', 'Andhra Pradesh': 'AP', Rajasthan: 'RJ', 'Madhya Pradesh': 'MP', 'Uttar Pradesh': 'UP' }`.
4. Call AI service for price recommendation (with try/catch, non-blocking):
   ```javascript
   let aiPrice = null;
   try {
     const aiResp = await axios.post(`${process.env.AI_SERVICE_URL}/ai/price/recommend`, {
       crop_name: data.crop_name, district: farmer.district,
       quantity_kg: data.quantity_kg, quality_grade: data.quality_grade,
       is_organic: data.is_organic, harvest_date: data.harvest_date
     }, { timeout: 5000 });
     aiPrice = aiResp.data.data.recommended_price;
   } catch (e) { console.warn('AI price service unavailable'); }
   ```
5. Create `Listing` record with all data + `ai_suggested_price = aiPrice`.
6. Generate QR code:
   ```javascript
   const qrData = JSON.stringify({ lot_number, crop_name, farmer_id, district, harvest_date });
   const qrBuffer = await QRCode.toBuffer(qrData);
   const qrUpload = await cloudinary.uploader.upload_stream({ folder: 'qrcodes' }, buffer);
   await listing.update({ qr_code_url: qrUpload.secure_url });
   ```
7. Return complete listing with farmer profile included.

**`getListings(filters, pagination)`:**
- Filters: `crop_name`, `crop_category`, `district`, `state`, `is_organic`, `quality_grade`, `min_price`, `max_price`, `min_quantity`.
- Pagination: `page`, `limit` (default 12).
- Order: `created_at DESC`.
- Include: Farmer's `full_name`, `village`, `rating`.
- Only return: `is_active = true` listings.

**`searchListings(query)`:**
- Use Sequelize `Op.iLike` on `crop_name`, `variety`, `description` for PostgreSQL case-insensitive search.

### 2.3 Listing Validation Schema (Joi)

```javascript
const createListingSchema = Joi.object({
  crop_name:     Joi.string().min(2).max(100).required(),
  crop_category: Joi.string().valid('Vegetable','Fruit','Grain','Spice','Dairy','Other').required(),
  variety:       Joi.string().max(100).optional(),
  quantity_kg:   Joi.number().positive().max(100000).required(),
  price_per_kg:  Joi.number().positive().max(10000).required(),
  min_order_kg:  Joi.number().positive().default(1),
  quality_grade: Joi.string().valid('A','B','C').default('B'),
  harvest_date:  Joi.date().iso().max('now').required(),
  expiry_date:   Joi.date().iso().optional(),
  description:   Joi.string().max(1000).optional(),
  is_organic:    Joi.boolean().default(false),
});
```

---

## MODULE 3 — ORDER + CART MODULE

### 3.1 Cart Endpoints

Cart is stored in **Redis** (not DB). Key: `cart:<userId>`. Value: JSON array of cart items.

```
POST   /api/cart/add            Add item to cart
GET    /api/cart                Get cart contents
PUT    /api/cart/items/:itemId  Update quantity
DELETE /api/cart/items/:itemId  Remove item
DELETE /api/cart/clear          Clear cart
GET    /api/cart/summary        Calculate totals
```

**`addToCart(userId, listingId, quantityKg)`:**
1. Fetch listing from DB. Check `is_active = true` and `available_kg >= quantityKg`.
2. Get existing cart from Redis: `redis.get('cart:' + userId)`.
3. If item already in cart: update quantity. Else: append.
4. Validate: total requested quantity for this listing across cart ≤ `available_kg`.
5. Save back to Redis with 2-hour TTL.

**`getCartSummary(userId)`:**
- Get cart from Redis.
- For each item: fetch current listing price (prices may have changed).
- Calculate: `subtotal`, `delivery_charge` (₹30 flat), `gst` (₹0), `total`.
- Return full summary with item details.

### 3.2 Order Endpoints

```
POST /api/orders              Place order from cart
GET  /api/orders              List orders (buyer: own; farmer: related; admin: all)
GET  /api/orders/:id          Order detail
PUT  /api/orders/:id/status   Update order status (farmer/logistics/admin only)
PUT  /api/orders/:id/cancel   Cancel order (buyer only, before 'packed' status)
GET  /api/orders/:id/invoice  Download invoice PDF
```

**`placeOrder(userId, deliveryAddress, deliverySlot)`** — most complex function:

```javascript
const placeOrder = async (userId, deliveryAddress, deliverySlot) => {
  const t = await sequelize.transaction(); // DB Transaction
  try {
    // 1. Get cart from Redis
    const cart = await getCart(userId);
    if (!cart || cart.length === 0) throw new AppError('Cart is empty', 400);
    
    // 2. Validate stock for each item (inside transaction)
    for (const item of cart) {
      const listing = await Listing.findByPk(item.listingId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!listing || !listing.is_active) throw new AppError(`${item.crop_name} is no longer available`, 400);
      if (listing.available_kg < item.quantity_kg) throw new AppError(`Only ${listing.available_kg}kg of ${item.crop_name} available`, 400);
    }
    
    // 3. Calculate totals
    const subtotal = cart.reduce((sum, i) => sum + (i.quantity_kg * i.price_per_kg), 0);
    const delivery_charge = 30;
    const total_amount = subtotal + delivery_charge;
    
    // 4. Create Order record
    const order = await Order.create({
      buyer_id: userId, status: 'pending', order_type: 'retail',
      subtotal, delivery_charge, gst_amount: 0, total_amount,
      delivery_address: deliveryAddress, delivery_slot: deliverySlot,
      payment_status: 'pending'
    }, { transaction: t });
    
    // 5. Create OrderItem records + deduct stock
    for (const item of cart) {
      const itemTotal = item.quantity_kg * item.price_per_kg;
      await OrderItem.create({
        order_id: order.id, listing_id: item.listingId, farmer_id: item.farmerId,
        crop_name: item.crop_name, quantity_kg: item.quantity_kg, price_per_kg: item.price_per_kg,
        total_price: itemTotal,
        farmer_payout: itemTotal * 0.95,
        platform_commission: itemTotal * 0.05
      }, { transaction: t });
      
      await Listing.decrement('available_kg', { by: item.quantity_kg, where: { id: item.listingId }, transaction: t });
      await Listing.update({ is_active: false }, { where: { id: item.listingId, available_kg: { [Op.lte]: 0 } }, transaction: t });
    }
    
    await t.commit();
    
    // 6. Clear cart
    await redis.del('cart:' + userId);
    
    return order;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};
```

### 3.3 Invoice PDF Generation

```javascript
// src/utils/invoice.utils.js
const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;

const generateInvoice = async (order, items, buyer) => {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  
  // Header
  doc.fontSize(20).text('KISAN CONNECT', { align: 'center' });
  doc.fontSize(10).text('Direct Farm to Consumer Marketplace', { align: 'center' });
  doc.moveDown();
  doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
  doc.text(`Buyer: ${buyer.full_name} | ${buyer.mobile}`);
  doc.moveDown();
  
  // Items table
  doc.text('ITEMS:', { underline: true });
  items.forEach(item => {
    doc.text(`${item.crop_name} — ${item.quantity_kg}kg @ ₹${item.price_per_kg}/kg = ₹${item.total_price}`);
  });
  doc.moveDown();
  
  // Totals
  doc.text(`Subtotal: ₹${order.subtotal}`);
  doc.text(`Delivery: ₹${order.delivery_charge}`);
  doc.text(`Total: ₹${order.total_amount}`, { bold: true });
  doc.end();
  
  const buffer = await new Promise(res => doc.on('end', () => res(Buffer.concat(chunks))));
  
  // Upload to Cloudinary
  const result = await new Promise((res, rej) => {
    cloudinary.uploader.upload_stream({ folder: 'invoices', resource_type: 'raw', format: 'pdf' },
      (err, r) => err ? rej(err) : res(r)
    ).end(buffer);
  });
  
  return result.secure_url;
};
```

---

## MODULE 4 — PAYMENT MODULE

### 4.1 Endpoints

```
POST /api/payments/create-order    Create Razorpay order
POST /api/payments/verify          Verify payment signature
POST /api/payments/webhook         Razorpay webhook (no auth)
GET  /api/payments/history         Payment history (auth user's own)
```

### 4.2 Create Razorpay Order

```javascript
const createRazorpayOrder = async (orderId, userId) => {
  const order = await Order.findOne({ where: { id: orderId, buyer_id: userId } });
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment_status !== 'pending') throw new AppError('Order already paid', 400);
  
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.total_amount * 100), // Razorpay uses paise
    currency: 'INR',
    receipt: order.id.slice(0, 40),
    notes: { order_id: order.id, buyer_id: userId }
  });
  
  await order.update({ razorpay_order_id: rzpOrder.id });
  
  return {
    razorpay_order_id: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    key_id: process.env.RAZORPAY_KEY_ID
  };
};
```

### 4.3 Verify Payment Signature

```javascript
const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }) => {
  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                            .update(body).digest('hex');
  
  if (expectedSig !== razorpay_signature) throw new AppError('Invalid payment signature', 400);
  
  // Update records
  const order = await Order.findByPk(order_id);
  await order.update({ payment_status: 'paid', status: 'confirmed' });
  
  await Payment.create({
    order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
    amount: order.total_amount, status: 'captured'
  });
  
  // Generate invoice
  const invoiceUrl = await generateInvoice(order, ...);
  await order.update({ invoice_url: invoiceUrl });
  
  // Trigger Antigravity notification workflow
  await triggerOrderNotification(order);
  
  return { success: true, order_id };
};
```

### 4.4 Trigger Antigravity Notification

```javascript
const triggerOrderNotification = async (order) => {
  try {
    const items = await OrderItem.findAll({ where: { order_id: order.id }, include: [{ model: Farmer, include: [User] }] });
    const buyer = await User.findByPk(order.buyer_id);
    
    await axios.post(process.env.ANTIGRAVITY_WEBHOOK_ORDER_URL, {
      order_id: order.id,
      buyer_mobile: buyer.mobile,
      buyer_name: buyer.full_name,
      farmer_mobile: items[0].Farmer.User.mobile,  // Primary farmer
      farmer_name: items[0].Farmer.User.full_name,
      crop: items.map(i => i.crop_name).join(', '),
      total_amount: order.total_amount
    }, {
      headers: { 'x-antigravity-secret': process.env.ANTIGRAVITY_WEBHOOK_SECRET },
      timeout: 5000
    });
  } catch (e) {
    console.warn('Antigravity notification failed — non-critical:', e.message);
  }
};
```

---

## MODULE 5 — LOGISTICS ASSIGNMENT

### 5.1 Endpoints

```
POST /api/logistics/assign/:orderId     Assign driver to order
GET  /api/logistics/driver/assignments  Get driver's assignments (logistics role)
PUT  /api/logistics/delivery/:id/start  Mark delivery started
PUT  /api/logistics/delivery/:id/confirm Confirm delivery + upload proof
GET  /api/logistics/track/:orderId      Track order (public with order_id)
POST /api/logistics/cluster             Cluster multiple orders (admin)
```

### 5.2 Driver Assignment Logic

```javascript
const assignDriver = async (orderId) => {
  const order = await Order.findByPk(orderId, { include: ['items'] });
  const deliveryDistrict = order.delivery_address.district;
  
  // Find nearest available driver
  const driver = await LogisticsPartner.findOne({
    where: { status: 'available', district: deliveryDistrict },
    include: [{ model: User, attributes: ['full_name', 'mobile'] }],
    order: [['rating', 'DESC']]
  });
  
  if (!driver) return null; // No driver available — admin will assign manually
  
  // Get route from AI service
  let routeData = null;
  try {
    const farmer = await Farmer.findByPk(order.items[0].farmer_id);
    const aiResp = await axios.post(`${process.env.AI_SERVICE_URL}/ai/logistics/optimize-route`, {
      driver_location: { lat: driver.current_lat, lng: driver.current_lng },
      orders: [{
        id: orderId,
        lat: order.delivery_address.latitude || 20.0,
        lng: order.delivery_address.longitude || 73.8,
        address: order.delivery_address.full_address
      }]
    }, { timeout: 8000 });
    routeData = aiResp.data.data;
  } catch (e) { console.warn('AI routing unavailable'); }
  
  // Create assignment
  const assignment = await LogisticsAssignment.create({
    order_id: orderId,
    driver_id: driver.id,
    pickup_location: { lat: farmer?.latitude, lng: farmer?.longitude },
    delivery_location: order.delivery_address,
    optimized_route: routeData,
    estimated_km: routeData?.clusters?.[0]?.total_km || 10,
    estimated_minutes: routeData?.clusters?.[0]?.total_minutes || 40,
    driver_earnings: order.delivery_charge * 0.80
  });
  
  await driver.update({ status: 'busy' });
  await order.update({ status: 'in_transit' });
  
  return assignment;
};
```

---

## MODULE 6 — INTERNAL FORECAST SAVE ENDPOINT

```javascript
// src/routes/internal.routes.js
router.post('/forecasts/upsert', internalAuthMiddleware, async (req, res, next) => {
  try {
    const { crop_name, district, forecast, model_version } = req.body;
    const { DemandForecast } = require('../models');
    
    let upserted = 0;
    for (const f of forecast) {
      await DemandForecast.upsert({
        crop_name, district,
        forecast_date: f.date,
        predicted_price: f.predicted_price,
        lower_bound: f.lower_bound,
        upper_bound: f.upper_bound,
        demand_index: f.demand_index,
        confidence_score: f.confidence,
        model_version
      });
      upserted++;
    }
    
    return res.json({ success: true, upserted });
  } catch (err) { next(err); }
});

// internalAuthMiddleware — checks x-internal-secret header
const internalAuthMiddleware = (req, res, next) => {
  if (req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized internal call' });
  }
  next();
};
```

---

## DELIVERABLES CHECKLIST

By Day 4 (Siddhesh needs price API to test end-to-end):
- [ ] Omniroute configured and URL shared
- [ ] Listing create endpoint working (calls AI for price suggestion)
- [ ] GET listings (paginated, filtered) working

By Day 6:
- [ ] Full order flow (cart → checkout → Razorpay → confirmation) working
- [ ] Invoice PDF generated and accessible
- [ ] Logistics assignment working
- [ ] Internal forecast endpoint working

By Day 7:
- [ ] All endpoints documented in Postman collection
- [ ] Postman collection exported and pushed to `docs/postman_collection.json`

---

## OPENCODE PROMPTS CHEAT SHEET

**For service generation:**
```
"Generate listing.service.js in /backend/src/services/ for Node.js Express.
Function: createListing(data, userId, imageFiles).
[Paste exact logic from Task.md Module 2.2]
Use: Sequelize Listing model, axios for AI call, cloudinary for images, qrcode package.
Import all dependencies at top. Use async/await. Throw AppError for business errors."
```

**For controller generation:**
```
"Generate listing.controller.js with createListing, getListings, getListingById,
updateListing, deleteListing functions. Each follows: try { call service } catch(err) { next(err) }.
Success returns: { success: true, message: '...', data: result } with appropriate HTTP status codes."
```

---

*Task version: 1.0 | Tukesh | Kisan Connect SIH 2026*
