# Backend Notes - Structure Guide

Companion to `documentation.md`. Read this before touching backend code.

## Layout (backend/)

```
backend/
  server.js            Entry: dotenv, sequelize.authenticate, sync({alter:true}) in dev, initJobs, listen
  src/
    app.js             Express app: middleware + route mounting + error handler
    config/            cloudinary, db, firebase, razorpay, redis configs
    controllers/       Request handlers per domain (order.controller.js, admin.controller.js, ...)
    services/          Business logic (order.service.js, cart.service.js, ...)
    models/            Sequelize models, index.js assembles associations
    routes/            Express routers per domain + middleware (auth, role)
    middleware/        auth, role, error, rateLimit, upload, validate
    jobs/cron.js       Scheduled jobs
    templates/         Email/notification templates
    utils/             AppError, jwt, logger, response, invoice/lot/qrcode helpers
```

## Architecture pattern

`routes -> controllers -> services -> models`

- **Routes** declare HTTP surface + middleware (validate, authMiddleware, requireRole).
- **Controllers** parse/validate request, call services, shape the response.
- **Services** own business rules + DB access, throw `AppError(status, message)`.
- **Models** are Sequelize definitions. `models/index.js` is the single import point
  and defines all associations (e.g. `Order.hasMany(OrderItem, { as: 'items' })`).

The centralized `error.middleware.js` converts any thrown `AppError` into the
JSON `{ success, message, code, errors }` envelope and 500s unknown errors.

## Middleware

| File | Purpose |
| --- | --- |
| `auth.middleware.js` | Reads Bearer JWT, verifies, loads `req.user` |
| `role.middleware.js` | `requireRole(...roles)` - 403 if role not allowed |
| `validate.middleware.js` | joi schema validation of `req.body` |
| `upload.middleware.js` | multer single/multiple image uploads |
| `rateLimit.middleware.js` | global limiter + stricter auth limiter |
| `error.middleware.js` | central error handler |

## Routes / Endpoints

Base prefix `/api`.

### auth.routes.js
- `POST /auth/register` - create user (role in body)
- `POST /auth/login` - returns `{ token, data: { user } }`
- `POST /auth/send-otp`, `POST /auth/verify-otp`
- `POST /auth/refresh-token`
- `POST /auth/logout` (auth)
- `POST /auth/forgot-password`, `POST /auth/reset-password`

### user.routes.js (all `authMiddleware`)
- `GET /users/me` - profile (includes role profile + associates)
- `GET /users/me/dashboard` - role-based dashboard payload (farmer/fpo_admin:
  earnings, stock, order counts; logistics: assignment stats)
- `PUT /users/me` - update profile
- `POST /users/me/profile-image` - `upload.single('image')` -> Cloudinary
- `POST /users/me/complete-profile` - fills role-specific profile

### listing.routes.js
- `GET /listings` - marketplace list (filters, pagination)
- `GET /listings/search`
- `GET /listings/:id`
- `GET /listings/farmer/mine` (farmer/fpo_admin)
- `POST /listings` (farmer/fpo_admin, image upload + validation)
- `PUT /listings/:id`, `DELETE /listings/:id` (farmer/fpo_admin)

### cart.routes.js (auth)
- `GET /cart`, `GET /cart/summary`
- `POST /cart/add`
- `PUT /cart/items/:listingId`, `DELETE /cart/items/:listingId`, `DELETE /cart/clear`

Pricing contract: flat delivery 30 rupees, GST 0, so

`total = subtotal + 30`.

### order.routes.js (auth on all)
- `POST /orders` - place order (creates Order + OrderItems, decrements listing stock, notifies)
- `GET /orders` - scoped by role (farmer sees their produce orders, admin all)
- `GET /orders/:id`
- `PUT /orders/:id/cancel`
- `PUT /orders/:id/status` (farmer/fpo_admin/admin/logistics) - status transitions

### payment.routes.js
- `POST /payments/create-order` - Razorpay order
- `POST /payments/verify` - client-side verification
- `POST /payments/webhook` - Razorpay signature-verified server webhook
- `GET /payments/history`

### logistics.routes.js
- `POST /logistics/assign/:orderId` (admin) - manual driver assignment
- `GET /logistics/driver/dashboard` (logistics)
- `GET /logistics/driver/available-orders` - paid, packed/confirmed, unassigned, same district
- `POST /logistics/driver/accept/:orderId` - self-accept (creates assignment, order -> in_transit, driver -> busy, 80% of delivery charge as earnings)
- `GET /logistics/driver/assignments`
- `PUT /logistics/delivery/:id/start` - start delivery (-> in_transit)
- `PUT /logistics/delivery/:id/confirm` - proof image (`upload.single('proof')`), marks delivered, credits driver
- `PUT /logistics/driver/status` - online/offline
- `GET /logistics/track/:orderId` - public tracking

### grievance.routes.js (auth)
- `POST /grievances` - create (severity accepted, `sla_deadline` auto +48h)
- `GET /grievances` - my tickets (includes Order when linked)
- `GET /grievances/:id`

### admin.routes.js (admin only)
- `GET /admin/stats` - cached 60s in Redis, `?refresh=1` bypasses
- `GET /admin/orders` - list + search (buyer name/mobile) + status/payment filters + pagination + buyer/items/assignment includes
- `PUT /admin/orders/:id/status`
- `GET /admin/users` - list w/ district from role profile
- `GET /admin/users/:id` - detail + order/listing/grievance counts
- `PUT /admin/users/:id/status` - activate/deactivate (+SMS on deactivate)
- `GET /admin/grievances`, `PUT /admin/grievances/:id` (resolve with note)
- `GET /admin/reports/analytics` - avg order value, orders this month, active districts, top 5 crops, 14-day daily orders+gmv
- `GET /admin/reports/orders`, `GET /admin/reports/farmers`
- `POST /admin/notifications/broadcast`

### webhook.routes.js (internal / ai-service)
- `POST /webhooks/refresh-forecasts`, `/webhooks/order-placed`, `/webhooks/new-grievance`, `/webhooks/log`

## Models

`backend/src/models/index.js` exports: User, Farmer, FPO, BulkBuyer,
LogisticsPartner, LogisticsAssignment, Listing, Order, OrderItem, Payment,
Grievance, NotificationLog, DemandForecast, WorkflowLog.

Notable associations (as used in code):

- `User.belongsTo roles via hasOne(Farmer, BulkBuyer, LogisticsPartner)` aliased `farmerProfile`, `bulkBuyerProfile`, `logisticsProfile`
- `Order.belongsTo(User, as: 'buyer')`; `Order.hasMany(OrderItem, as: 'items')`
- `OrderItem.belongsTo(Listing)` (listing carries `available_kg`)
- `Order.hasOne(LogisticsAssignment, as: 'logisticsAssignment')`
- `Grievance.belongsTo(User, as: 'user')`, and includes `Order` when `order_id` set
- `User.hasMany(Order, as: 'orders')`

## Timestamp gotcha (read before querying orders)

`Order.model.js` sets `underscored: true`, but in practice the returned
attributes are camelCase: use **`createdAt`** everywhere (where clauses,
`order: [['createdAt','DESC']]`, attributes). `created_at` returns null / empty
results silently. This was a live bug in admin analytics at least once.

When in doubt check actual attribute names:

```
node -e "require('dotenv').config(); const { Order } = require('./src/models');
Order.findAll({ limit: 1, raw: true }).then(rows => console.log(Object.keys(rows[0])))"
```

## Cron jobs (jobs/cron.js)

Runs scheduled work via node-cron (forecast refresh, pending-order
notifications, etc.). Called from `server.js: initJobs()`.

## Key configs

- `config/db.config.js` - Sequelize connection (Postgres), `sequelize` export
- `config/redis.config.js` - Upstash Redis (stats cache, OTP) 
- `config/cloudinary.config.js` - media upload destination
- `config/razorpay.config.js` - payment gateway keys
- `config/firebase.config.js` - push notifications

## Utilities

- `utils/AppError.js` - `new AppError(message, statusCode, code)`
- `utils/jwt.utils.js` - sign/verify
- `utils/logger.js` - structured logger
- `utils/response.utils.js` - response envelope helper
- `utils/invoice.utils.js`, `qrcode.utils.js`, `lotNumber.utils.js` - order artifacts
- `templates/` - notification/email templates

## Conventions

- Controllers catch with `next(error)`; never swallow errors.
- Response envelope: `{ success: true, message, data, pagination? }`.
- All new endpoints should mount with the same `authMiddleware` / `requireRole` pattern.
- Every new endpoint should be added to this file's route inventory.

## Checks

- `cd backend && npm run dev` for local (nodemon auto-reloads on save).
- No test suite is maintained beyond jest scaffolding; verify by calling the
  endpoint (PowerShell `Invoke-RestMethod` with a logged-in token) and confirm
  the shape against the envelopes above.