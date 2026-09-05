# ARCHITECTURE.md — Kisan Connect
## How Every Feature Must Be Built

> This document defines the architectural rules, patterns, and conventions that govern how EVERY feature is built across the entire Kisan Connect platform. All six team members MUST follow these rules. Deviation breaks integration.

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│   React.js PWA (Vercel)                                          │
│   ┌────────────┐  ┌─────────────┐  ┌──────────────┐            │
│   │ Marketplace│  │ Farmer View │  │ Admin / Driver│            │
│   └─────┬──────┘  └──────┬──────┘  └──────┬───────┘            │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │    ALL calls go through Omniroute │
          ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────┐
│              OMNIROUTE API GATEWAY                               │
│        (Route → Auth Check → Service → Response)                │
│   /api/*  → Backend (Node.js, Render.com :5000)                 │
│   /ai/*   → AI Service (Python Flask, Railway :8000)            │
└─────────────────────────┬────────────────────────────────────────┘
                          │
          ┌───────────────┴──────────────────┐
          ▼                                  ▼
┌──────────────────────┐          ┌─────────────────────────┐
│  BACKEND (Node.js)   │          │  AI SERVICE (Python)    │
│  Express.js REST API │          │  Flask REST API         │
│  Port: 5000          │◄────────►│  Port: 8000             │
│                      │          │                         │
│  • Auth Module       │          │  • Demand Forecasting   │
│  • User Module       │          │  • Price Recommendation │
│  • Listing Module    │          │  • Route Optimization   │
│  • Order Module      │          │  • Chatbot (Groq/Gemini)│
│  • Payment Module    │          │                         │
│  • Logistics Module  │          └─────────────────────────┘
│  • Admin Module      │
│  • Notification Svc  │
└──────────┬───────────┘
           │
    ┌──────┴──────────────────────────────────┐
    ▼                    ▼                    ▼
┌──────────┐      ┌────────────┐      ┌───────────┐
│PostgreSQL│      │  Redis     │      │ Cloudinary│
│(Supabase)│      │ (Upstash)  │      │ (Images)  │
└──────────┘      └────────────┘      └───────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   ANTIGRAVITY (Workflow Automation) │
│   Cron Jobs + Event Triggers        │
│   • Daily Forecast Refresh          │
│   • Order Notification Flow         │
│   • Grievance Auto-Triage           │
└─────────────────────────────────────┘
```

---

## 2. TRADITIONAL SOFTWARE ARCHITECTURE RULES

### 2.1 Separation of Concerns (SoC)

Every module — frontend or backend — must follow the strict three-layer pattern:

**Backend Three-Layer Pattern:**
```
Route Layer       → Only defines the endpoint URL + HTTP method + middleware chain
Controller Layer  → Only handles request/response. Calls service. Returns response.
Service Layer     → Contains ALL business logic. Calls models. Returns data.
Model Layer       → Defines DB schema. Only handles DB queries.
```

**Example — Creating a Listing:**
```
POST /api/listings
    ↓ auth.middleware.js (verify JWT)
    ↓ validate.middleware.js (Joi schema check)
    ↓ listing.controller.js → createListing(req, res)
        ↓ listing.service.js → createListingService(data)
            ↓ Listing.model.js → Listing.create({ ... })
            ↓ ai.service.js → getPriceRecommendation(crop, district)
            ↓ cloudinary.service.js → uploadImages(files)
        ↑ returns { listing }
    ↑ returns res.status(201).json({ success: true, data: listing })
```

**RULE: Controllers must NEVER contain business logic. Services must NEVER touch req/res.**

**Frontend Three-Layer Pattern:**
```
Page Component    → Composes sections, handles routing state
Section Component → Groups related UI, handles local UI state
Atom Component    → Single-responsibility UI element (Button, Card, Input)
Service Layer     → axios calls, data transformation (in /services/)
```

### 2.2 Single Responsibility Principle

- One file = one responsibility.
- `auth.controller.js` handles ONLY authentication endpoints.
- `listing.service.js` handles ONLY listing-related business logic.
- `ProductCard.jsx` renders ONLY a single product card.

### 2.3 DRY (Don't Repeat Yourself)

- If the same logic appears in two places, extract it to a shared utility or service.
- Frontend: common API calls go in `/services/`. Common UI in `/components/common/`.
- Backend: common logic goes in `/utils/` or `/services/`.

### 2.4 Fail-Safe Defaults

- If an external API (Agmarknet, Groq) fails, the system must not crash.
- Every external API call must have a try/catch with a fallback response.
- AI features degrade gracefully: if AI service is down, show cached/static data.

---

## 3. BACKEND ARCHITECTURE — DETAILED RULES

### 3.1 Express App Structure

```javascript
// server.js — Entry point ONLY
const app = require('./src/app');
const { sequelize } = require('./src/config/db.config');

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('DB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

// src/app.js — App setup ONLY
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware (order matters)
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/listings', require('./routes/listing.routes'));
// ... other routes

// Global error handler (ALWAYS last)
app.use(require('./middleware/error.middleware'));

module.exports = app;
```

### 3.2 Controller Pattern — Mandatory Format

```javascript
// Every controller function follows this exact pattern:
const createListing = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.id; // set by auth middleware
    const files = req.files;    // set by multer middleware
    
    const result = await listingService.createListing(data, userId, files);
    
    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: result
    });
  } catch (error) {
    next(error); // ALWAYS pass to error middleware, never handle here
  }
};
```

### 3.3 Service Pattern — Mandatory Format

```javascript
// Every service function follows this exact pattern:
const createListing = async (listingData, farmerId, imageFiles) => {
  // 1. Business validation (beyond what Joi does)
  const farmer = await Farmer.findOne({ where: { user_id: farmerId } });
  if (!farmer) throw new AppError('Farmer profile not found', 404);
  
  // 2. External calls (with try/catch fallback)
  let aiPrice = null;
  try {
    aiPrice = await aiService.getPriceRecommendation(listingData.crop_name, farmer.district);
  } catch (err) {
    console.warn('AI price service unavailable, skipping');
  }
  
  // 3. Image upload
  const imageUrls = await cloudinaryService.uploadMultiple(imageFiles);
  
  // 4. Database operation
  const listing = await Listing.create({
    ...listingData,
    farmer_id: farmer.id,
    images: imageUrls,
    ai_suggested_price: aiPrice?.recommended_price || null,
    lot_number: generateLotNumber(farmer.district)
  });
  
  return listing;
};
```

### 3.4 Standard API Response Format

ALL endpoints must return this format. No exceptions:

```javascript
// Success
{
  "success": true,
  "message": "Listings fetched successfully",
  "data": { ... },            // For single items
  "data": [ ... ],            // For lists
  "pagination": {             // Only for paginated lists
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [                 // Optional: for validation errors
    { "field": "mobile", "message": "Must be 10 digits" }
  ]
}
```

### 3.5 Authentication Middleware — How It Works

Every protected route passes through `auth.middleware.js`:

```javascript
// auth.middleware.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findByPk(decoded.id); // Attaches user to req
  next();
};

// role.middleware.js — Used after authMiddleware
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// Usage in routes:
router.post('/listings', authMiddleware, requireRole('farmer', 'fpo_admin'), listingController.create);
```

### 3.6 Sequelize Model Pattern

```javascript
// models/Listing.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  crop_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 100] }
  },
  // ... other fields
}, {
  tableName: 'listings',
  timestamps: true,          // adds createdAt, updatedAt
  underscored: true,         // snake_case column names
});

// Associations defined in separate associations.js file:
// Listing.belongsTo(Farmer, { foreignKey: 'farmer_id' });

module.exports = Listing;
```

---

## 4. FRONTEND ARCHITECTURE — DETAILED RULES

### 4.1 Routing Structure

```javascript
// routes.jsx — Central route definitions
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/marketplace', element: <Marketplace /> },
  { path: '/marketplace/:id', element: <ProductDetail /> },
  {
    path: '/farmer',
    element: <ProtectedRoute roles={['farmer', 'fpo_admin']} />,
    children: [
      { path: 'dashboard', element: <FarmerDashboard /> },
      { path: 'listings', element: <MyListings /> },
      { path: 'listings/new', element: <CreateListing /> },
    ]
  },
  // ... other routes
]);
```

### 4.2 State Management Rules

- **Local state** (useState): Component-specific UI state (modal open/closed, form inputs).
- **Zustand store**: Shared state accessed by multiple components (cart, auth user, language).
- **React Query / SWR**: Server state (data fetched from API). Use for all API data.
- **NEVER** store sensitive data (tokens) in localStorage. Use memory (Zustand) + httpOnly cookie for tokens.

```javascript
// stores/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

### 4.3 API Service Pattern

```javascript
// services/api.js — Central Axios instance
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // from .env
  timeout: 10000,
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response.data, // Unwrap data automatically
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

// services/listing.service.js — Feature-specific service
import api from './api';

export const listingService = {
  getAll: (params) => api.get('/api/listings', { params }),
  getById: (id) => api.get(`/api/listings/${id}`),
  create: (formData) => api.post('/api/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/listings/${id}`, data),
  delete: (id) => api.delete(`/api/listings/${id}`),
};
```

### 4.4 Component Pattern

```jsx
// components/marketplace/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Props definition at top of file (always document props)
/**
 * ProductCard — Displays a single produce listing
 * @param {string} id - Listing UUID
 * @param {string} crop_name - Name of the crop
 * @param {string[]} images - Cloudinary image URLs
 * @param {number} price_per_kg - Price in INR per kg
 * @param {number} available_kg - Available quantity
 * @param {string} farmer_name - Farmer's display name
 * @param {string} district - Farmer's district
 * @param {boolean} is_organic - Organic flag
 * @param {string} quality_grade - A, B, or C
 */
const ProductCard = ({ id, crop_name, images, price_per_kg, available_kg, farmer_name, district, is_organic, quality_grade }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={images?.[0] || '/placeholder-crop.jpg'}
          alt={crop_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{crop_name}</h3>
          <div className="flex gap-1">
            {is_organic && <Badge variant="outline" className="text-green-600 border-green-600">Organic</Badge>}
            <Badge variant="secondary">Grade {quality_grade}</Badge>
          </div>
        </div>
        
        <p className="text-2xl font-bold text-green-700">₹{price_per_kg}<span className="text-sm font-normal text-gray-500">/kg</span></p>
        <p className="text-sm text-gray-500 mt-1">{available_kg} kg available • {district}</p>
        <p className="text-xs text-gray-400 mt-1">by {farmer_name}</p>
        
        <Button
          onClick={() => navigate(`/marketplace/${id}`)}
          className="w-full mt-3 bg-green-700 hover:bg-green-800"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
```

---

## 5. AI SERVICE ARCHITECTURE — DETAILED RULES

### 5.1 Flask App Structure

```python
# run.py — Entry point
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)

# app/__init__.py — App factory
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, origins=[os.getenv('BACKEND_URL'), os.getenv('FRONTEND_URL')])
    
    # Register blueprints
    from app.routes.forecast import forecast_bp
    from app.routes.logistics import logistics_bp
    from app.routes.pricing import pricing_bp
    from app.routes.chatbot import chatbot_bp
    
    app.register_blueprint(forecast_bp, url_prefix='/ai/forecast')
    app.register_blueprint(logistics_bp, url_prefix='/ai/logistics')
    app.register_blueprint(pricing_bp, url_prefix='/ai/price')
    app.register_blueprint(chatbot_bp, url_prefix='/ai/chatbot')
    
    return app
```

### 5.2 Flask Route Pattern

```python
# app/routes/forecast.py
from flask import Blueprint, request, jsonify
from app.models.demand_forecaster import DemandForecaster

forecast_bp = Blueprint('forecast', __name__)
forecaster = DemandForecaster()

@forecast_bp.route('/demand', methods=['POST'])
def get_demand_forecast():
    """Predict demand and price for a given crop + district"""
    try:
        data = request.get_json()
        
        # Validate input
        required = ['crop_name', 'district', 'forecast_days']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing field: {field}'}), 400
        
        # Run forecast
        result = forecaster.predict(
            crop_name=data['crop_name'],
            district=data['district'],
            days_ahead=int(data['forecast_days'])
        )
        
        return jsonify({'success': True, 'data': result}), 200
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
```

### 5.3 AI Fallback Pattern (Critical Rule)

Every AI function must have a fallback:

```python
def predict_with_fallback(crop_name, district, days):
    try:
        # Primary: Prophet model
        return prophet_model.predict(crop_name, district, days)
    except Exception as e:
        print(f"Prophet failed: {e}. Using moving average fallback.")
        try:
            # Fallback: Moving average
            return moving_average_predict(crop_name, district, days)
        except Exception as e2:
            # Last resort: Return static sample data
            return get_static_sample_forecast(crop_name, days)
```

---

## 6. INTER-SERVICE COMMUNICATION (Via Omniroute)

```
Frontend calls:   VITE_API_URL/api/...     → Omniroute → Backend :5000
Frontend calls:   VITE_API_URL/ai/...      → Omniroute → AI Service :8000
Backend calls:    AI_SERVICE_URL/ai/...    → Direct HTTP (internal)
Antigravity:      Webhook POST to backend  → /api/webhooks/antigravity/...
```

**Environment variables for service URLs:**
```
# Frontend .env
VITE_API_URL=https://api.kisanconnect.com   # Omniroute URL

# Backend .env
AI_SERVICE_URL=http://ai-service:8000       # Internal Docker network
FRONTEND_URL=https://kisan-connect.vercel.app
ANTIGRAVITY_WEBHOOK_SECRET=xxxxx

# AI Service .env
BACKEND_URL=http://backend:5000
```

---

## 7. DATABASE ARCHITECTURE RULES

### 7.1 Migration-First Approach

- NEVER modify the database directly in production.
- ALL schema changes go through Sequelize migrations.
- Migration files are numbered: `001_create_users.js`, `002_create_farmers.js`, etc.
- Run migrations: `npx sequelize-cli db:migrate`

### 7.2 UUID Primary Keys

- ALL tables use UUID primary keys (`DataTypes.UUID`, `defaultValue: DataTypes.UUIDV4`).
- NEVER use auto-increment integers for primary keys.

### 7.3 Soft Delete Pattern

- NEVER hard-delete records in the database.
- Add `is_active: boolean, default: true` to sensitive tables.
- To delete: `await record.update({ is_active: false })`.
- All queries must filter by `is_active: true` unless specifically fetching deleted records.

### 7.4 Index Strategy

Essential indexes (Manthan creates these in migration):
- `users.mobile` — Unique index (login lookup)
- `listings.crop_name` — Index (search)
- `listings.district` — Index (filter)
- `listings.farmer_id` — Index (farmer's listings)
- `orders.buyer_id` — Index (buyer's orders)
- `orders.status` — Index (status filter)

---

## 8. SECURITY ARCHITECTURE RULES

1. **JWT:** Access token: 7 days. Refresh token: 30 days. Store ONLY in memory (Zustand), never localStorage.
2. **Password Hashing:** bcryptjs with saltRounds = 12. Never store plain passwords.
3. **OTP:** 6-digit, stored in Redis with 10-minute TTL. Max 3 attempts, then lock for 30 minutes.
4. **File Upload:** Only accept `image/jpeg`, `image/png`, `image/webp`. Max size: 5MB. Upload directly to Cloudinary (not stored locally).
5. **Razorpay Webhooks:** Always verify webhook signature using `razorpay.webhooks.verify()`.
6. **Helmet:** Enabled in Express app. Never disable it.
7. **CORS:** Only allow requests from `process.env.FRONTEND_URL`. No wildcard `*` in production.
8. **Input Validation:** Every POST/PUT endpoint has a Joi validation middleware. No raw `req.body` usage without validation.
9. **API Keys:** Backend proxies ALL external API calls. Frontend NEVER calls external APIs directly.
10. **Rate Limiting:** 100 requests per 15 minutes per IP globally. Auth endpoints: 5 per 15 min.

---

## 9. OMNIROUTE CONFIGURATION RULES

Omniroute is configured by Tukesh. The rules are:

- All routes starting with `/api/auth/*` → Backend, no auth required.
- All routes starting with `/api/*` → Backend, JWT auth required by default.
- All routes starting with `/ai/*` → AI Service, JWT auth required.
- `/api/payments/webhook` → Backend, bypass JWT (uses Razorpay signature instead).
- Health check routes `/health` on both services → no auth.

If Omniroute is down, backend and frontend must fail gracefully with a 503 error page.

---

## 10. ANTIGRAVITY WORKFLOW RULES (Manthan Manages)

Workflows must:
- Have a unique name following: `kc-<trigger>-<action>` format.
- Log every execution to a database table `workflow_logs`.
- Have error alerting: if a workflow fails 3 times, send email to `manthan@team.kisanconnect.in`.
- Be idempotent: running the same workflow twice with same input must produce the same result.
- Never directly modify the database — always call backend API endpoints.

---

*Architecture Version: 1.0 | Kisan Connect SIH 2026*
