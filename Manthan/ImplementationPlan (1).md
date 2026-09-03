# IMPLEMENTATION PLAN — Manthan
## Day-by-Day Build Guide: Backend Foundation + Auth + Admin + Antigravity

---

## PRE-START CHECKLIST (Before Day 1)

- [ ] Sign up for Supabase → Create project → Copy `DATABASE_URL`
- [ ] Sign up for Upstash → Create Redis DB → Copy `UPSTASH_REDIS_REST_URL` and token
- [ ] Sign up for Render.com → Create a Web Service (Node.js, free)
- [ ] Sign up for MSG91 → Get Auth Key + Create OTP template
- [ ] Set up Gmail App Password (Google Account → Security → App Passwords)
- [ ] Set up Firebase project → Enable Cloud Messaging → Get Server Key
- [ ] Sign up for GitHub → Create repo `kisan-connect` → Set as private (add all 5 team members)
- [ ] Sign up for Antigravity → Create a new project

---

## DAY 1 — PROJECT FOUNDATION

### Morning (4 hours): Repo + Backend Structure

**Step 1: Initialize Repository**
```bash
# Create folder structure
mkdir kisan-connect && cd kisan-connect
git init
git remote add origin https://github.com/<org>/kisan-connect.git

# Create all directories
mkdir -p frontend backend ai-service database/migrations docs .github/workflows

# Create root files
touch .gitignore README.md docker-compose.yml
```

`.gitignore` content:
```
node_modules/
.env
.env.local
__pycache__/
*.pyc
dist/
build/
.DS_Store
*.log
```

**Step 2: Initialize Backend**
```bash
cd backend
npm init -y
npm install express sequelize pg pg-hstore bcryptjs jsonwebtoken joi multer cloudinary nodemailer qrcode pdfkit razorpay express-rate-limit helmet cors morgan winston dotenv @upstash/redis groq firebase-admin
npm install -D nodemon jest supertest

# Create folder structure
mkdir -p src/{config,models,controllers,routes,middleware,services,utils,templates/email}
touch src/app.js server.js .env .env.example
```

**Step 3: Create Core Configuration Files**

Using OpenCode, generate:
- `src/config/db.config.js` — Sequelize + PostgreSQL setup
- `src/config/redis.config.js` — Upstash Redis client
- `src/config/cloudinary.config.js` — Cloudinary SDK init
- `src/config/firebase.config.js` — Firebase Admin SDK init

**Step 4: Create `src/app.js`**

Use OpenCode prompt:
```
"Generate Express.js app.js file with: helmet, cors (from env FRONTEND_URL), 
express-rate-limit (100/15min), express.json(10mb), morgan(dev). 
Import and mount these route files: auth.routes, user.routes, admin.routes, 
grievance.routes, webhook.routes. Add global error handler middleware at the end.
Export the app."
```

**Step 5: Create `server.js`**
```javascript
require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config/db.config');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    // Sync models in development only
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
    }
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
};

start();
```

**Step 6: Share `.env.example` with team**
Push to GitHub main immediately.

---

### Afternoon (4 hours): All Sequelize Models

Use OpenCode to generate each model one by one. Generate in this order (dependencies first):

1. `User.model.js`
2. `FPO.model.js`
3. `Farmer.model.js` (depends on User, FPO)
4. `BulkBuyer.model.js` (depends on User)
5. `LogisticsPartner.model.js` (depends on User)
6. `Listing.model.js` (depends on Farmer)
7. `Order.model.js` (depends on User)
8. `OrderItem.model.js` (depends on Order, Listing, Farmer)
9. `Payment.model.js` (depends on Order)
10. `LogisticsAssignment.model.js` (depends on Order, LogisticsPartner)
11. `Grievance.model.js` (depends on User, Order)
12. `NotificationLog.model.js` (depends on User)
13. `DemandForecast.model.js`
14. `WorkflowLog.model.js`

After all models: create `src/models/index.js`:
```javascript
const { sequelize } = require('../config/db.config');
const User = require('./User.model');
// ... all models

// Define associations
User.hasOne(Farmer, { foreignKey: 'user_id', as: 'farmerProfile' });
Farmer.belongsTo(User, { foreignKey: 'user_id' });
// ... all associations

module.exports = { sequelize, User, Farmer, FPO, BulkBuyer, LogisticsPartner,
                   Listing, Order, OrderItem, Payment, LogisticsAssignment,
                   Grievance, NotificationLog, DemandForecast, WorkflowLog };
```

**Test database sync:**
```bash
NODE_ENV=development node server.js
# Should print: ✅ Database connected + ✅ Server running
```

---

## DAY 2 — AUTHENTICATION MODULE

### Morning (4 hours): Auth Service + OTP

**Step 1: OTP Service**

Use OpenCode:
```
"Generate otp.service.js in /backend/src/services/ using @upstash/redis.
Functions:
- sendOTP(mobile): Generate 6-digit OTP, store in Redis key 'otp:<mobile>' as JSON 
  {otp, attempts:0} with 600s TTL. Check lock:<mobile> key first — if exists, throw 
  AppError('Too many OTP attempts', 429). Call MSG91 API to send SMS. Return { success: true }.
- verifyOTP(mobile, otp): GET otp:<mobile> from Redis. If null, throw AppError('OTP expired', 400).
  Compare otp. If wrong: increment attempts. If attempts >= 3: delete OTP key, set 
  lock:<mobile> for 1800s, throw AppError('Account locked for 30 minutes', 429).
  If correct: delete key, return { success: true }.
MSG91 base URL: https://api.msg91.com/api/v5/flow/
Use process.env for all keys."
```

**Step 2: JWT Utils**

```javascript
// src/utils/jwt.utils.js
const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis.config');

const generateTokens = async (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
  // Store refresh token in Redis
  await redis.set(`refresh:${userId}`, refreshToken, { ex: 2592000 });
  return { accessToken, refreshToken };
};

module.exports = { generateTokens, /* verifyAccessToken, verifyRefreshToken, blacklistToken */ };
```

**Step 3: Auth Middleware**

Use OpenCode:
```
"Generate auth.middleware.js in /backend/src/middleware/.
It extracts Bearer token from Authorization header, verifies using JWT_SECRET,
checks Redis blacklist key 'blacklist:<token>' — if exists, return 401.
If valid, fetch User from DB using decoded.id, attach to req.user, call next().
Handle: no token → 401, invalid token → 401, user not found → 401, user inactive → 403."
```

Also generate `role.middleware.js`:
```javascript
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied: insufficient role' });
  }
  next();
};
module.exports = { requireRole };
```

### Afternoon (4 hours): Auth Controller + Routes

**Step 4: Auth Controller**

Use OpenCode to generate `src/controllers/auth.controller.js` with functions:
- `register(req, res, next)` — validate → check duplicate mobile → hash password → create User → create role-specific profile (Farmer/BulkBuyer/etc) → generate tokens → send welcome SMS → return tokens + user.
- `login(req, res, next)` — find user by mobile/email → compare password → generate tokens → return.
- `sendOTP(req, res, next)` — call otpService.sendOTP(mobile).
- `verifyOTP(req, res, next)` — call otpService.verifyOTP → mark user as verified → generate tokens.
- `refreshToken(req, res, next)` — verify refresh token → check Redis → generate new access token.
- `logout(req, res, next)` — blacklist current access token in Redis → delete refresh token from Redis.
- `forgotPassword` → `resetPassword` — OTP-based password reset.

**Step 5: Auth Routes**

```javascript
// src/routes/auth.routes.js
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, otpSchema } = require('../middleware/validators/auth.validator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', validate(otpSchema), authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
```

**Step 6: User Routes**

```javascript
// src/routes/user.routes.js
router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.post('/me/profile-image', authMiddleware, upload.single('image'), userController.uploadProfileImage);
router.post('/me/complete-profile', authMiddleware, userController.completeProfile);
```

**Step 7: Test All Auth Endpoints in Postman**
- Register a farmer → login → get profile → refresh token → logout.
- Verify OTP flow works (or mock MSG91 in development).

---

## DAY 3 — NOTIFICATION SERVICE + GLOBAL ERROR HANDLING

### Morning (3 hours): Notification Service

Generate `src/services/notification.service.js` with:
- `sendSMS(mobile, message)` — MSG91 transactional, logs to NotificationLog.
- `sendEmail(to, subject, templateName, variables)` — Nodemailer + template engine (simple string replace).
- `sendPush(fcmToken, title, body, data)` — Firebase Admin SDK.
- `sendOrderNotification(order)` — Orchestration: calls SMS + email + push for order events.
- `sendGrievanceAcknowledgement(grievance, user)` — SMS + email.

### Afternoon (3 hours): Global Error Handling + Validate Middleware

**Error Middleware:**
```javascript
// src/middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Sequelize errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    status = 409;
    message = `${err.errors[0].path} already exists`;
  }
  if (err.name === 'SequelizeValidationError') {
    status = 400;
    message = err.errors.map(e => e.message).join(', ');
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }
  
  // Log to winston
  logger.error({ status, message, path: req.path, method: req.method });
  
  res.status(status).json({ success: false, message });
};
```

**AppError Class:**
```javascript
// src/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
module.exports = AppError;
```

**Validate Middleware:**
```javascript
// src/middleware/validate.middleware.js
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(d => ({ field: d.path[0], message: d.message }))
    });
  }
  next();
};
```

**Sync with team at end of Day 3:**
- Share Postman collection with all auth endpoints.
- Confirm Siddhesh has the AI service URL and can call backend if needed.
- Confirm Tukesh has all model files and can start building listing service.

---

## DAY 4 — ADMIN MODULE + GRIEVANCE ENDPOINTS

### Morning (4 hours): Admin Controller + Routes

Generate all admin endpoints listed in Task.md Module 5.

Key implementation: `GET /api/admin/stats`
```javascript
const getStats = async (req, res, next) => {
  try {
    // Check Redis cache first
    const cached = await redis.get('admin:stats');
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });
    
    const [totalUsers, totalFarmers, totalOrders, totalListings, gmvResult] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Farmer.count(),
      Order.count(),
      Listing.count({ where: { is_active: true } }),
      Payment.sum('amount', { where: { status: 'captured' } })
    ]);
    
    const stats = { totalUsers, totalFarmers, totalOrders, totalListings, gmv: gmvResult || 0 };
    await redis.set('admin:stats', JSON.stringify(stats), { ex: 300 }); // 5-min cache
    
    return res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};
```

### Afternoon (3 hours): Grievance Module + Webhook Endpoints

**Grievance Endpoints:**
```
POST /api/grievances           — Submit grievance (any authenticated user)
GET  /api/grievances           — List (admin: all; users: own)
GET  /api/grievances/:id       — Get single grievance
PUT  /api/grievances/:id       — Update status/resolution (admin only)
```

**Webhook Endpoints (for Antigravity):**
```javascript
// src/routes/webhook.routes.js
// All routes verify x-antigravity-secret header
router.post('/refresh-forecasts', webhookMiddleware, webhookController.refreshForecasts);
router.post('/order-placed', webhookMiddleware, webhookController.orderPlaced);
router.post('/new-grievance', webhookMiddleware, webhookController.newGrievance);
router.post('/log', webhookMiddleware, webhookController.logWorkflow);
```

---

## DAY 5 — ANTIGRAVITY WORKFLOWS

### Setting Up in Antigravity Dashboard

**Workflow 1: Daily Forecast Refresh**
1. Create new workflow: `kc-cron-refresh-forecasts`.
2. Add CRON trigger: `0 23 * * *` (5 AM IST = 11:30 PM UTC).
3. Add HTTP Request node: POST to `https://kisan-connect-api.onrender.com/api/webhooks/antigravity/refresh-forecasts`. Header: `x-antigravity-secret: <value>`.
4. Add conditional: if response.success === false → add Email Alert node (send to manthan's email).
5. Add Log node: POST to `/api/webhooks/antigravity/log` with execution summary.

**Workflow 2: Order Notification**
1. Create workflow: `kc-webhook-order-placed`.
2. Trigger: Incoming Webhook (Antigravity gives you a webhook URL). Save this URL — give to Tukesh so his order service calls it.
3. Node 1: Extract data from payload.
4. Node 2: SMS node — farmer mobile.
5. Node 3: SMS node — consumer mobile.
6. Node 4: Conditional: if consumer fcm_token exists → Push Notification node.
7. Node 5: Log node.

**Workflow 3: Grievance Triage**
1. Create workflow: `kc-webhook-grievance-triage`.
2. Trigger: Incoming Webhook.
3. Node 1: HTTP POST to Groq API (`https://api.groq.com/openai/v1/chat/completions`). Prompt: classify grievance.
4. Node 2: Parse Groq response JSON.
5. Node 3: HTTP PATCH to `/api/grievances/:id` with classification + SLA.
6. Node 4: Conditional on severity → Email Alert node.
7. Node 5: SMS to user with ticket acknowledgement.

---

## DAY 6 — DEPLOYMENT + INTEGRATION TESTING

### Backend Deployment to Render.com

1. Go to Render.com → New Web Service → Connect GitHub repo.
2. Settings: Root directory = `backend`, Build command = `npm install`, Start command = `node server.js`.
3. Set all environment variables in Render dashboard.
4. Deploy and verify: `curl https://kisan-connect-api.onrender.com/health`

### Integration Testing with Team

Test these cross-module flows:
1. Register as farmer (your auth) → Create listing (Tukesh's endpoint) → Verify listing appears.
2. Consumer places order (Tukesh) → Antigravity workflow fires → SMS sent (your notification service).
3. AI service demand forecast endpoint callable from backend (your AI service call).
4. Admin can see all orders in admin dashboard.

### Load Test
```bash
# Install k6 and run basic load test
k6 run --vus 10 --duration 30s tests/load/auth.js
```

---

## DAY 7 — BUFFER + DOCUMENTATION

- Fix any integration bugs found during Day 6 testing.
- Write API documentation for all your endpoints in `docs/API_DOCUMENTATION.md`.
- Ensure seed data is populated for demo.
- Prepare demo account credentials for the SIH presentation.
- Review and merge all team PRs before final demo build.

---

## DAILY COMMIT TARGETS

| Day | Branch | Commit Target |
|---|---|---|
| Day 1 | `feature/manthan/setup` | Repo structure + all models + DB sync confirmed |
| Day 2 | `feature/manthan/auth` | Full auth working, Postman tested |
| Day 3 | `feature/manthan/notifications` | Notification service + error handling |
| Day 4 | `feature/manthan/admin` | Admin endpoints + grievance module |
| Day 5 | `feature/manthan/antigravity` | All 3 workflows live in Antigravity |
| Day 6 | `dev` | Backend deployed + integration tested |
| Day 7 | `main` | Final stable build |

---

*Implementation Plan version: 1.0 | Manthan | Kisan Connect SIH 2026*
