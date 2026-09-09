# DETAILED PROJECT REPORT (DPR)
## Smart India Hackathon 2026 | Problem Statement ID: SIH26033

---

# KISAN CONNECT — AI-Powered Direct Farm-to-Consumer Digital Marketplace

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement Analysis](#2-problem-statement-analysis)
3. [Solution Overview](#3-solution-overview)
4. [System Architecture](#4-system-architecture)
5. [Feature Breakdown — Prototype vs Final](#5-feature-breakdown--prototype-vs-final)
6. [Project Structure & Directory Layout](#6-project-structure--directory-layout)
7. [Technology Stack](#7-technology-stack)
8. [AI & Automation Platforms](#8-ai--automation-platforms)
9. [APIs, Keys & Third-Party Integrations](#9-apis-keys--third-party-integrations)
10. [Database Design](#10-database-design)
11. [Module-Wise Development Plan](#11-module-wise-development-plan)
12. [UI/UX Design Plan](#12-uiux-design-plan)
13. [AI Features — Detailed Design](#13-ai-features--detailed-design)
14. [Logistics Module — Detailed Design](#14-logistics-module--detailed-design)
15. [Security & Compliance](#15-security--compliance)
16. [Testing Strategy](#16-testing-strategy)
17. [Deployment Plan](#17-deployment-plan)
18. [Timeline & Milestones](#18-timeline--milestones)
19. [Team Roles & Responsibilities](#19-team-roles--responsibilities)
20. [Risk Assessment & Mitigation](#20-risk-assessment--mitigation)
21. [Cost Estimation](#21-cost-estimation)
22. [Future Roadmap](#22-future-roadmap)
23. [Appendices](#23-appendices)

---

## 1. EXECUTIVE SUMMARY

| Parameter | Detail |
|---|---|
| **Project Name** | Kisan Connect |
| **Tagline** | Khet Se Ghar Tak — From Farm to Your Table |
| **SIH Problem Statement ID** | SIH26033 |
| **Problem Statement Title** | Multiple intermediaries reduce farmers earnings and increase consumer prices |
| **Organizing Ministry** | Ministry of Consumer Affairs, Food & Public Distribution |
| **Department** | Department of Consumer Affairs (DoCA) |
| **Category** | Software |
| **Theme** | Agriculture, FoodTech & Rural Development |
| **Idea Submission Deadline** | 20 September 2026 |
| **Submission Slots** | 0/500 (open) |
| **Project Type** | Web Application + Mobile App (Progressive Web App) |
| **Primary Language** | English + Hindi + Regional Languages |
| **Target Beneficiaries** | Farmers, FPOs, Bulk Buyers, End Consumers |

### 1.1 Problem in Numbers

- India has 10–12 layers of intermediaries between farm and consumer.
- Farmers receive only 15–30% of the final consumer price for most vegetables.
- Food wastage due to inefficient logistics: 16–18% of total produce.
- 86% of Indian farmers are small or marginal landholders, making direct negotiation almost impossible.

### 1.2 Proposed Solution Summary

Kisan Connect is an AI-enabled, multi-stakeholder digital marketplace that eliminates intermediaries by directly connecting farmers and Farmer Producer Organizations (FPOs) with consumers and bulk buyers. The platform integrates:

- A real-time produce listing and bidding marketplace.
- AI-driven demand forecasting to help farmers grow the right crops.
- Route-optimized logistics using AI.
- Multilingual interface with voice-based navigation for low-literacy users.
- Cold-chain visibility and delivery tracking.

---

## 2. PROBLEM STATEMENT ANALYSIS

### 2.1 Root Cause Analysis

```
Consumer Pays High Price
        ↑
    Retailer (Markup: 20–40%)
        ↑
    Distributor (Markup: 10–20%)
        ↑
    Wholesale Market / Mandi (Commission: 5–10%)
        ↑
    Village Aggregator / Dalal (Commission: 10–15%)
        ↑
    Farmer (Receives: 15–30% of final price)
```

### 2.2 Stakeholder Mapping

| Stakeholder | Current Pain Point | Desired Outcome |
|---|---|---|
| Small Farmers | Cannot access markets; sell at distress prices | Fair price, direct access to buyers |
| FPOs | Lack of visibility; logistics issues | Bulk deal access, better logistics |
| Bulk Buyers (Hotels, Canteens, Exporters) | Unreliable supply, inconsistent quality | Consistent supply with quality assurance |
| Urban Consumers | High prices, no transparency on origin | Fresh produce at lower cost, traceability |
| Logistics Providers | Underutilized capacity | Efficient, route-optimized load |

### 2.3 What the Problem Statement Expects

The problem statement explicitly expects a solution that:

1. **Connects** farmers/FPOs directly with consumers and bulk buyers.
2. **Provides** logistics support.
3. **Uses AI** for demand forecasting and route optimization.

### 2.4 What We Are Building Beyond the Minimum

- Cold-chain status monitoring (simulated via IoT data for prototype).
- Voice-assisted multilingual interface.
- QR-based produce traceability.
- Farmer credit scoring based on past transactions (MVP post-prototype).
- Grievance redressal mechanism.

---

## 3. SOLUTION OVERVIEW

### 3.1 Platform Users (Roles)

| Role | Description |
|---|---|
| **Farmer** | Individual small/marginal farmer who lists produce |
| **FPO Admin** | Manages group listings on behalf of a Farmer Producer Organization |
| **Consumer** | Individual buyer (retail) who orders directly |
| **Bulk Buyer** | Restaurant, hotel, canteen, school, exporter |
| **Logistics Partner** | Registered transporter / last-mile delivery agent |
| **Platform Admin** | DoCA / SIH team managing the platform |
| **Cold Storage Partner** | Registered cold storage facility |

### 3.2 Core Workflows

#### Workflow A — Farmer Lists Produce

```
Farmer Registers → Verifies via Aadhaar OTP → Adds Produce Listing
(Photo + Quantity + Price + Harvest Date + Location) → Listing Goes Live
→ AI suggests optimal price → Buyers Browse & Order → Payment Released
→ Logistics Triggered → Farmer Receives Net Amount
```

#### Workflow B — Consumer Places Order

```
Consumer Registers → Browses Marketplace → Filters by Crop/Location/Price
→ Adds to Cart → Selects Delivery Slot → Pays (UPI/COD/Wallet)
→ Order Assigned to Logistics Partner → Delivery Tracked in Real-Time
→ Order Received → Review & Rating
```

#### Workflow C — Bulk Buyer Places Bulk Order

```
Bulk Buyer Registers (GSTIN Verification) → Posts Requirement (Crop,
Quantity, Delivery Date, Location) → AI Matches with FPOs/Farmers
→ Negotiation Chat → Contract Locked → Logistics Arranged
→ Delivery + Invoice Generated → Payment via NEFT/UPI
```

#### Workflow D — Logistics Routing

```
Orders Aggregated by Region → AI Clusters Orders by Pin Code
→ Optimal Route Generated → Nearest Available Logistics Partner Assigned
→ Driver App Shows Route → Proof of Delivery Captured
→ Payment Released to Logistics Partner
```

---

## 4. SYSTEM ARCHITECTURE

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │  Web App     │  │  PWA Mobile │  │  Admin Panel  │               │
│  │  (React.js)  │  │  (React PWA)│  │  (React.js)   │               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘               │
└─────────┼────────────────┼────────────────┼────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Nginx / Cloudflare)               │
│                   Rate Limiting | Auth | SSL Termination            │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────┐
│                       BACKEND SERVICES (Node.js + Express)          │
│                                                                     │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────────────┐ │
│  │  Auth Service │ │ Marketplace    │ │  Logistics Service        │ │
│  │  (JWT + OTP)  │ │ Service        │ │  (Route Optimization)     │ │
│  └──────────────┘ └────────────────┘ └───────────────────────────┘ │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────────────┐ │
│  │  Payment Svc  │ │  AI/ML Service │ │  Notification Service     │ │
│  │  (Razorpay)   │ │  (Python Flask)│ │  (FCM + SMS)              │ │
│  └──────────────┘ └────────────────┘ └───────────────────────────┘ │
│  ┌──────────────┐ ┌────────────────┐                               │
│  │  File/Image   │ │  Analytics Svc │                               │
│  │  Service      │ │                │                               │
│  └──────────────┘ └────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌────────────────┐  ┌───────────────┐
│  PostgreSQL   │  │  Redis Cache   │  │  Cloudinary   │
│  (Primary DB) │  │                │  │  (Image Store)│
└──────────────┘  └────────────────┘  └───────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AI / ML LAYER (Python)                          │
│  ┌──────────────────┐  ┌────────────────────┐  ┌─────────────────┐ │
│  │  Demand Forecast  │  │  Route Optimization │  │  Price         │ │
│  │  (Prophet / LSTM) │  │  (OR-Tools / OSRM)  │  │  Recommender   │ │
│  └──────────────────┘  └────────────────────┘  └─────────────────┘ │
│  ┌──────────────────┐  ┌────────────────────┐                      │
│  │  Crop Matching    │  │  Chatbot (Gemini    │                      │
│  │  Engine           │  │  API / Groq)        │                      │
│  └──────────────────┘  └────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│               EXTERNAL INTEGRATIONS                                 │
│  eNAM API | Agmarknet | GSTN | ONDC | Google Maps | Msg91          │
│  Razorpay | Cloudinary | Firebase | mKisan | Bhashini              │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Microservice Communication

- All services communicate over **REST + JSON** (prototype).
- Event-driven communication via **Redis Pub/Sub** for notifications (prototype).
- Final app will use **Apache Kafka** for event streaming between services.

### 4.3 Data Flow Diagram — Order Placement

```
Consumer → POST /api/orders → Order Service → 
  ├─ Validates stock (Marketplace Service)
  ├─ Locks inventory (Redis atomic operation)
  ├─ Initiates payment (Payment Service → Razorpay)
  ├─ On payment success → Publishes order_placed event
  ├─ Notification Service → SMS to Farmer + Consumer
  └─ Logistics Service → Assigns route + driver
```

---

## 5. FEATURE BREAKDOWN — PROTOTYPE VS FINAL

> Legend: 🔵 = Prototype Feature | 🟢 = Final Application Feature

---

### 5.1 Authentication & User Management

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Email/Password Registration | ✅ | ✅ |
| Mobile OTP Login | ✅ | ✅ |
| Aadhaar OTP Verification | ❌ Mock data | ✅ Real Aadhaar API (UIDAI) |
| Google SSO | ✅ | ✅ |
| Role-Based Access Control | ✅ | ✅ |
| KYC Document Upload | ✅ Upload only | ✅ AI-based OCR verification |
| FPO Admin Multi-user Accounts | ❌ | ✅ |
| Two-Factor Authentication | ❌ | ✅ |
| Biometric Login (Mobile) | ❌ | ✅ (WebAuthn) |

---

### 5.2 Marketplace — Farmer/FPO Side

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Create Produce Listing | ✅ | ✅ |
| Upload Produce Photos | ✅ (Cloudinary) | ✅ |
| AI Price Recommendation | ✅ (Rule-based + Agmarknet data) | ✅ (ML model trained on 5yr data) |
| Set Minimum Order Quantity | ✅ | ✅ |
| Listing Expiry & Renewal | ✅ | ✅ |
| Bulk Listing Upload (CSV) | ❌ | ✅ |
| QR Code for Produce Lot | ✅ (Static QR) | ✅ (Dynamic, traceable QR) |
| Inventory Auto-deduction | ✅ | ✅ |
| FPO Group Listing | ❌ | ✅ |
| eNAM API Integration | ❌ | ✅ (Live price feed) |
| ONDC Network Integration | ❌ | ✅ |
| Voice-based Listing (Hindi) | ❌ | ✅ (Bhashini API) |
| Crop Health Photo Scan | ❌ | ✅ (Gemini Vision) |
| Cold Storage Booking | ❌ | ✅ |

---

### 5.3 Marketplace — Buyer Side

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Browse Listings | ✅ | ✅ |
| Filter by Crop / Location / Price | ✅ | ✅ |
| Search (Full-text) | ✅ | ✅ |
| Wishlist / Saved Items | ✅ | ✅ |
| Add to Cart | ✅ | ✅ |
| Real-time Stock Status | ✅ (Polling) | ✅ (WebSocket) |
| Bulk Order Request Form | ✅ | ✅ |
| Negotiation Chat (Bulk Buyers) | ❌ | ✅ |
| Subscription / Recurring Orders | ❌ | ✅ |
| Traceability: Farm Origin Map | ✅ (Mock location) | ✅ (GPS-verified) |
| AI Product Recommendation | ✅ (Collaborative filter) | ✅ (Advanced ML) |
| Multilingual UI (Hindi) | ✅ (Static i18n) | ✅ (All 22 scheduled languages via Bhashini) |

---

### 5.4 Payment Module

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| UPI Payment | ✅ (Razorpay Test Mode) | ✅ (Razorpay Live) |
| Debit/Credit Card | ✅ (Test) | ✅ (Live) |
| Cash on Delivery | ✅ | ✅ |
| Wallet Top-up | ❌ | ✅ |
| NEFT/RTGS for Bulk Orders | ❌ | ✅ |
| Escrow-based Payment Hold | ❌ | ✅ (Money held until delivery confirmed) |
| Farmer Payout (T+1) | ✅ (Simulated) | ✅ (Razorpay Route) |
| Invoice Generation (PDF) | ✅ | ✅ |
| GST Compliance | ✅ (Hardcoded rates) | ✅ (GSTN API integration) |
| Refund Management | ✅ | ✅ |

---

### 5.5 AI — Demand Forecasting

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Crop Demand Dashboard | ✅ (Static charts from historical data) | ✅ (Live forecast updated daily) |
| Weekly Demand Prediction | ✅ (Prophet model, static dataset) | ✅ (LSTM trained on 5yr Agmarknet + order data) |
| Regional Demand Heatmap | ✅ (Mock data visualization) | ✅ (Live, updated every 6 hours) |
| Crop Price Forecast | ✅ (7-day ahead) | ✅ (30-day ahead) |
| Seasonal Advisory Alerts | ✅ (Rule-based) | ✅ (ML + Weather API integration) |
| SMS Crop Advisory (mKisan) | ❌ | ✅ |
| WhatsApp Crop Advisory | ❌ | ✅ (WhatsApp Business API) |

---

### 5.6 AI — Route Optimization & Logistics

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Route Visualization on Map | ✅ (Google Maps Static API) | ✅ (OSRM + Mapbox) |
| Order Clustering by Pin Code | ✅ (K-Means, Python script) | ✅ (OR-Tools VRP Solver) |
| Driver Assignment | ✅ (Nearest driver, rule-based) | ✅ (AI-based, considers load/time/rating) |
| Estimated Delivery Time | ✅ (Static estimate) | ✅ (Real-time traffic aware) |
| Driver Mobile App (PWA) | ✅ (Basic) | ✅ (Full-featured) |
| Delivery Proof (Photo Upload) | ✅ | ✅ |
| Cold-chain Status Alert | ❌ | ✅ (IoT sensor data via MQTT) |
| Multi-stop Optimization | ✅ (Simple greedy) | ✅ (Traveling Salesman via OR-Tools) |
| Return Logistics | ❌ | ✅ |

---

### 5.7 Analytics & Admin

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| Admin Dashboard | ✅ | ✅ |
| Farmer Earnings Report | ✅ | ✅ |
| Order Volume Chart | ✅ | ✅ |
| Logistics Performance KPIs | ✅ | ✅ |
| Grievance Ticket System | ✅ | ✅ |
| Fraud Detection Alerts | ❌ | ✅ (ML anomaly detection) |
| Export Reports (Excel/PDF) | ✅ | ✅ |
| Role-wise Report Access | ✅ | ✅ |
| DoCA Integration API | ❌ | ✅ |

---

### 5.8 Chatbot & Support

| Feature | Prototype 🔵 | Final 🟢 |
|---|---|---|
| AI Chatbot (English) | ✅ (Groq API — Free Tier) | ✅ (Gemini 1.5 Flash) |
| AI Chatbot (Hindi) | ✅ (Groq + i18n prompt) | ✅ (Bhashini + Gemini) |
| Voice Chatbot | ❌ | ✅ |
| FAQ Bot | ✅ | ✅ |
| Complaint Filing via Chat | ✅ | ✅ |
| Live Human Support Escalation | ❌ | ✅ (Freshdesk integration) |

---

## 6. PROJECT STRUCTURE & DIRECTORY LAYOUT

```
kisan-connect/
│
├── README.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
│
├── frontend/                          # React.js Web App + PWA
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json             # PWA manifest
│   │   └── sw.js                     # Service Worker
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   │
│   │   │   ├── marketplace/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── FilterSidebar.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── OrderSummary.jsx
│   │   │   │
│   │   │   ├── farmer/
│   │   │   │   ├── ListingForm.jsx
│   │   │   │   ├── PriceAdvisor.jsx
│   │   │   │   ├── EarningChart.jsx
│   │   │   │   └── InventoryTable.jsx
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── DemandForecastChart.jsx
│   │   │   │   ├── RouteMap.jsx
│   │   │   │   ├── PriceRecommend.jsx
│   │   │   │   └── Chatbot.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── StatsCard.jsx
│   │   │       ├── DataTable.jsx
│   │   │       └── GrievancePanel.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderTracking.jsx
│   │   │   ├── farmer/
│   │   │   │   ├── FarmerDashboard.jsx
│   │   │   │   ├── MyListings.jsx
│   │   │   │   ├── CreateListing.jsx
│   │   │   │   ├── FarmerEarnings.jsx
│   │   │   │   └── DemandAdvisory.jsx
│   │   │   ├── buyer/
│   │   │   │   ├── BuyerDashboard.jsx
│   │   │   │   ├── BulkRequest.jsx
│   │   │   │   └── OrderHistory.jsx
│   │   │   ├── logistics/
│   │   │   │   ├── DriverDashboard.jsx
│   │   │   │   └── RouteView.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── Analytics.jsx
│   │   │       └── Grievances.jsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useGeolocation.js
│   │   │   └── useFetch.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance + interceptors
│   │   │   ├── auth.service.js
│   │   │   ├── marketplace.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── logistics.service.js
│   │   │   └── ai.service.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── locales/                  # i18n translation files
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   ├── mr.json
│   │   │   ├── ta.json
│   │   │   └── te.json
│   │   │
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── routes.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.config.js          # PostgreSQL + Sequelize config
│   │   │   ├── redis.config.js
│   │   │   ├── cloudinary.config.js
│   │   │   ├── razorpay.config.js
│   │   │   └── firebase.config.js
│   │   │
│   │   ├── models/                   # Sequelize ORM Models
│   │   │   ├── User.model.js
│   │   │   ├── Farmer.model.js
│   │   │   ├── FPO.model.js
│   │   │   ├── BulkBuyer.model.js
│   │   │   ├── Listing.model.js
│   │   │   ├── Order.model.js
│   │   │   ├── OrderItem.model.js
│   │   │   ├── Payment.model.js
│   │   │   ├── Logistics.model.js
│   │   │   ├── Driver.model.js
│   │   │   ├── Review.model.js
│   │   │   └── Grievance.model.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── farmer.controller.js
│   │   │   ├── listing.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── logistics.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── admin.controller.js
│   │   │   └── grievance.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── farmer.routes.js
│   │   │   ├── listing.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── logistics.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── grievance.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # JWT verification
│   │   │   ├── role.middleware.js     # RBAC
│   │   │   ├── upload.middleware.js   # Multer
│   │   │   ├── validate.middleware.js # Joi validation
│   │   │   ├── rateLimit.middleware.js
│   │   │   └── logger.middleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── otp.service.js         # MSG91 / Twilio
│   │   │   ├── notification.service.js # FCM + SMS
│   │   │   ├── payment.service.js
│   │   │   ├── logistics.service.js
│   │   │   ├── ai.service.js          # Calls Python AI service
│   │   │   └── email.service.js       # Nodemailer
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.utils.js
│   │   │   ├── qrcode.utils.js
│   │   │   ├── invoice.utils.js
│   │   │   └── response.utils.js
│   │   │
│   │   ├── migrations/               # Sequelize migrations
│   │   ├── seeders/                  # Seed data
│   │   └── app.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── ai-service/                       # Python Flask AI Microservice
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── forecast.py           # Demand forecasting endpoints
│   │   │   ├── logistics.py          # Route optimization endpoints
│   │   │   ├── pricing.py            # Price recommendation endpoints
│   │   │   └── chatbot.py            # Chatbot endpoints
│   │   │
│   │   ├── models/
│   │   │   ├── demand_forecaster.py  # Prophet / LSTM model
│   │   │   ├── route_optimizer.py    # OR-Tools / OSRM
│   │   │   ├── price_recommender.py  # Regression model
│   │   │   └── crop_matcher.py       # Matching algorithm
│   │   │
│   │   ├── data/
│   │   │   ├── agmarknet_sample.csv  # Sample Agmarknet price data
│   │   │   ├── crop_calendar.json    # Crop seasonal calendar
│   │   │   └── district_codes.json   # India district codes
│   │   │
│   │   ├── utils/
│   │   │   ├── data_loader.py
│   │   │   ├── preprocessor.py
│   │   │   └── geocoder.py
│   │   │
│   │   └── config.py
│   │
│   ├── notebooks/                    # Jupyter notebooks for model training
│   │   ├── 01_EDA_Agmarknet.ipynb
│   │   ├── 02_Demand_Forecasting.ipynb
│   │   ├── 03_Route_Optimization.ipynb
│   │   └── 04_Price_Recommendation.ipynb
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── run.py
│
├── database/
│   ├── schema.sql                    # Full database schema
│   ├── seed.sql                      # Initial seed data
│   └── migrations/
│       ├── 001_create_users.sql
│       ├── 002_create_listings.sql
│       ├── 003_create_orders.sql
│       └── 004_create_logistics.sql
│
├── infrastructure/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   ├── docker/
│   │   ├── Dockerfile.frontend
│   │   ├── Dockerfile.backend
│   │   └── Dockerfile.ai
│   └── k8s/                          # Kubernetes (Final only)
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml
│
├── docs/
│   ├── DPR.md                        # This document
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── USER_MANUAL.md
│
└── tests/
    ├── unit/
    │   ├── backend/
    │   └── ai-service/
    ├── integration/
    └── e2e/
        └── cypress/
```

---

## 7. TECHNOLOGY STACK

### 7.1 Frontend

| Layer | Technology | Version | License |
|---|---|---|---|
| **Framework** | React.js | 18.x | MIT |
| **Build Tool** | Vite | 5.x | MIT |
| **Routing** | React Router v6 | 6.x | MIT |
| **State Management** | Zustand | 4.x | MIT |
| **UI Component Library** | shadcn/ui + Tailwind CSS | Latest | MIT |
| **Charts** | Recharts | 2.x | MIT |
| **Maps** | React Leaflet (Prototype) / Mapbox (Final) | Latest | MIT |
| **HTTP Client** | Axios | 1.x | MIT |
| **Form Handling** | React Hook Form + Zod | Latest | MIT |
| **Internationalization** | react-i18next | Latest | MIT |
| **QR Code** | qrcode.react | Latest | MIT |
| **File Upload** | react-dropzone | Latest | MIT |
| **Toast Notifications** | sonner | Latest | MIT |
| **Date Handling** | day.js | Latest | MIT |
| **PWA** | Vite PWA Plugin | Latest | MIT |
| **Payment UI** | Razorpay Checkout.js | — | Proprietary |

### 7.2 Backend

| Layer | Technology | Version | License |
|---|---|---|---|
| **Runtime** | Node.js | 20.x LTS | MIT |
| **Framework** | Express.js | 4.x | MIT |
| **ORM** | Sequelize | 6.x | MIT |
| **Authentication** | jsonwebtoken + bcryptjs | Latest | MIT |
| **Validation** | Joi | Latest | MIT |
| **File Upload** | Multer | Latest | MIT |
| **Image Storage** | Cloudinary SDK | Latest | MIT |
| **Email** | Nodemailer | Latest | MIT |
| **QR Code Gen** | qrcode (npm) | Latest | MIT |
| **PDF Generation** | pdfkit | Latest | MIT |
| **Rate Limiting** | express-rate-limit | Latest | MIT |
| **Logging** | Winston + Morgan | Latest | MIT |
| **CORS** | cors | Latest | MIT |
| **Env Vars** | dotenv | Latest | MIT |
| **Security** | helmet + xss-clean | Latest | MIT |
| **WebSocket** | socket.io (Final) | 4.x | MIT |

### 7.3 AI / ML Service

| Layer | Technology | Version | License |
|---|---|---|---|
| **Language** | Python | 3.11.x | PSF |
| **Web Framework** | Flask | 3.x | BSD |
| **Demand Forecast** | Prophet (Meta) | 1.1.x | MIT |
| **Deep Learning** | TensorFlow / Keras | 2.x | Apache 2.0 |
| **Route Optimization** | Google OR-Tools | 9.x | Apache 2.0 |
| **Data Processing** | pandas + numpy | Latest | BSD |
| **ML Framework** | scikit-learn | Latest | BSD |
| **Geospatial** | geopy + shapely | Latest | MIT |
| **Visualization (notebook)** | matplotlib + seaborn | Latest | BSD |
| **API Client** | requests | Latest | Apache 2.0 |
| **Groq SDK (Chatbot)** | groq | Latest | Apache 2.0 |
| **Google GenAI** | google-generativeai | Latest | Apache 2.0 |

### 7.4 Database & Caching

| Component | Technology | Free Tier |
|---|---|---|
| **Primary Database** | PostgreSQL 15 | ✅ Supabase Free (500MB) |
| **Caching** | Redis 7 | ✅ Upstash Free (10K cmd/day) |
| **Session Store** | Redis | ✅ Same instance |
| **File Storage** | Cloudinary | ✅ Free (25 credits/month) |
| **Search (Final)** | PostgreSQL Full-Text Search → Elasticsearch | PostgreSQL = free |

### 7.5 Infrastructure & DevOps

| Component | Technology | Free Tier |
|---|---|---|
| **Frontend Hosting** | Vercel | ✅ Free |
| **Backend Hosting (Prototype)** | Render.com | ✅ Free (750 hrs/month) |
| **AI Service Hosting (Prototype)** | Render.com / Railway.app | ✅ Free |
| **Database Hosting** | Supabase | ✅ Free |
| **Redis Hosting** | Upstash | ✅ Free |
| **Container** | Docker | ✅ Free |
| **CI/CD** | GitHub Actions | ✅ Free |
| **Domain (Final)** | Freenom / India Gov Domain | ✅ Free |
| **SSL** | Let's Encrypt | ✅ Free |
| **Monitoring (Prototype)** | UptimeRobot | ✅ Free |
| **Error Tracking** | Sentry (Free tier) | ✅ |
| **Analytics** | Plausible / Google Analytics | ✅ |

---

## 8. AI & AUTOMATION PLATFORMS

### 8.1 Antigravity (Primary AI Builder Platform)

Antigravity is used as the no-code/low-code AI workflow automation layer for rapid prototyping of AI pipelines.

**How We Use Antigravity:**

| Use Case | Antigravity Workflow |
|---|---|
| Demand Forecast Pipeline | Trigger: Daily cron → Pull Agmarknet data → Run Prophet model → Push to Dashboard |
| Price Alert Notifications | Trigger: Price drop/spike detected → Generate personalized SMS alert → Send via MSG91 |
| Bulk Buyer Matching | Trigger: Bulk request posted → AI matches with suitable FPOs → Sends notifications |
| Grievance Auto-triage | Trigger: New grievance → Classify severity via LLM → Assign to appropriate admin |
| Order Confirmation Flow | Trigger: Payment success → Generate invoice PDF → Send Email + SMS to all parties |

**Antigravity Nodes Used:**
- HTTP Request Node (Agmarknet data pull)
- Python Script Node (Data preprocessing)
- AI/LLM Node (Groq API — free tier)
- Database Write Node (PostgreSQL)
- Email/SMS Node (MSG91 integration)
- Cron Scheduler Node
- Conditional Branch Node
- JSON Transform Node

### 8.2 OpenCode (AI-Assisted Development)

OpenCode is used as the AI-powered coding assistant for accelerated development.

**How We Use OpenCode:**

| Development Task | OpenCode Usage |
|---|---|
| Backend API Generation | Prompt: "Generate a RESTful Express.js CRUD API for Listing model with these fields..." |
| Database Schema Generation | Prompt: "Generate Sequelize migration for the following schema..." |
| React Component Scaffolding | Prompt: "Generate a React functional component for ProductCard with props..." |
| Unit Test Generation | Prompt: "Generate Jest unit tests for the auth.controller.js file..." |
| SQL Query Optimization | Prompt: "Optimize this Sequelize query for fetching paginated listings..." |
| AI Model Code | Prompt: "Write a Flask route that runs Prophet demand forecast for given crop + region..." |
| Documentation | Prompt: "Generate JSDoc comments for all functions in logistics.service.js..." |

**OpenCode Workflow Integration:**
1. Developer writes feature specification in natural language.
2. OpenCode generates boilerplate code.
3. Developer reviews, adapts, and commits.
4. GitHub Actions runs automated tests.
5. Auto-deploy to Render/Vercel on passing tests.

---

## 9. APIs, KEYS & THIRD-PARTY INTEGRATIONS

### 9.1 APIs Used — All Free Tiers Marked

| API | Purpose | Free Tier | Registration URL | Key Name in .env |
|---|---|---|---|---|
| **Groq API** | AI Chatbot (LLaMA 3.1 8B model) | ✅ Free (14,400 req/day) | console.groq.com | `GROQ_API_KEY` |
| **Google Gemini API** | Chatbot (Final) + Crop Health Vision | ✅ Free (1M tokens/month Gemini Flash) | aistudio.google.com | `GEMINI_API_KEY` |
| **Agmarknet API** | Live Mandi crop price data | ✅ Free (Government) | agmarknet.gov.in | `AGMARKNET_API_KEY` |
| **eNAM API** | National Agriculture Market prices | ✅ Free (Government) | enam.gov.in | `ENAM_API_KEY` |
| **Google Maps JavaScript API** | Maps, Geocoding, Directions (Prototype) | ✅ $200 free credit/month | console.cloud.google.com | `GOOGLE_MAPS_API_KEY` |
| **OpenRouteService API** | Route Optimization (Free alternative to Google) | ✅ Free (2000 req/day) | openrouteservice.org | `ORS_API_KEY` |
| **Leaflet.js** | Map Display (No API key needed) | ✅ Fully Free | leafletjs.com | N/A |
| **Bhashini API** | Indian Language Translation + TTS/STT | ✅ Free (Government) | bhashini.gov.in | `BHASHINI_API_KEY` `BHASHINI_USER_ID` |
| **Razorpay** | Payment Gateway | ✅ Free Test Mode | razorpay.com | `RAZORPAY_KEY_ID` `RAZORPAY_KEY_SECRET` |
| **MSG91 OTP API** | OTP SMS delivery | ✅ 10 SMS free/day | msg91.com | `MSG91_AUTH_KEY` `MSG91_TEMPLATE_ID` |
| **Firebase Cloud Messaging** | Push Notifications | ✅ Free | console.firebase.google.com | `FIREBASE_SERVER_KEY` `FIREBASE_PROJECT_ID` |
| **Cloudinary** | Image Upload + CDN | ✅ 25 credits/month free | cloudinary.com | `CLOUDINARY_CLOUD_NAME` `CLOUDINARY_API_KEY` `CLOUDINARY_API_SECRET` |
| **Supabase** | PostgreSQL hosting | ✅ 500MB free | supabase.com | `SUPABASE_URL` `SUPABASE_ANON_KEY` `DATABASE_URL` |
| **Upstash Redis** | Redis caching | ✅ 10K cmd/day free | upstash.com | `UPSTASH_REDIS_REST_URL` `UPSTASH_REDIS_REST_TOKEN` |
| **Open-Meteo API** | Weather data (crop advisory) | ✅ Fully Free | open-meteo.com | N/A (no key needed) |
| **Nominatim (OpenStreetMap)** | Geocoding / Reverse Geocoding | ✅ Fully Free | nominatim.openstreetmap.org | N/A (no key needed) |
| **OSRM (Open Source Routing Machine)** | Route Engine (self-hosted or demo) | ✅ Demo server free | project-osrm.org | N/A |
| **Google OAuth2** | Social Login | ✅ Free | console.cloud.google.com | `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET` |
| **mKisan Portal API** | Farmer advisory SMS (Final) | ✅ Government | mkisan.gov.in | `MKISAN_API_KEY` |
| **GSTN Sandbox API** | GST verification (Final) | ✅ Sandbox free | sandbox.gstn.org.in | `GSTN_API_KEY` |
| **Nodemailer (Gmail SMTP)** | Transactional Email | ✅ Free | Gmail App Password | `GMAIL_USER` `GMAIL_APP_PASSWORD` |
| **QRCode.js** | QR Code Generation | ✅ npm package, free | npm | N/A |
| **PDFKit** | Invoice PDF Generation | ✅ npm package, free | npm | N/A |

### 9.2 Environment Variables Template (.env)

```env
# ===== SERVER CONFIG =====
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# ===== JWT =====
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# ===== DATABASE (Supabase PostgreSQL) =====
DATABASE_URL=postgresql://user:password@db.xxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# ===== REDIS (Upstash) =====
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
REDIS_URL=rediss://default:password@xxxxx.upstash.io:6379

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ===== PAYMENT (Razorpay) =====
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ===== SMS (MSG91) =====
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_otp_template_id
MSG91_SENDER_ID=KISNCT

# ===== EMAIL (Gmail SMTP) =====
GMAIL_USER=kisanconnect.noreply@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# ===== FIREBASE (Push Notifications) =====
FIREBASE_PROJECT_ID=kisan-connect-xxxx
FIREBASE_SERVER_KEY=your_fcm_server_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ===== GOOGLE APIS =====
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_MAPS_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXX

# ===== AI SERVICES =====
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXX

# ===== BHASHINI =====
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
BHASHINI_PIPELINE_ID=your_pipeline_id

# ===== GOVERNMENT APIS =====
AGMARKNET_API_KEY=your_agmarknet_key
ENAM_API_KEY=your_enam_key
MKISAN_API_KEY=your_mkisan_key
GSTN_API_KEY=your_gstn_sandbox_key

# ===== OPEN ROUTING =====
ORS_API_KEY=your_openrouteservice_key

# ===== ANTIGRAVITY =====
ANTIGRAVITY_WEBHOOK_SECRET=your_antigravity_secret

# ===== APP SECRETS =====
OTP_EXPIRY_MINUTES=10
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
```

### 9.3 API Key Registration Steps

#### Groq API (Free — Most Important for Chatbot)
1. Go to: https://console.groq.com
2. Sign up with GitHub/Google.
3. Click "Create API Key".
4. Set as `GROQ_API_KEY` in .env.
5. Models to use: `llama-3.1-8b-instant` (fastest, free), `mixtral-8x7b-32768` (better reasoning).

#### Google Gemini API (Free)
1. Go to: https://aistudio.google.com
2. Sign in with Google account.
3. Click "Get API Key" → "Create API Key in new project".
4. Set as `GEMINI_API_KEY` in .env.
5. Model to use: `gemini-1.5-flash` (1M tokens/month free).

#### Bhashini API (Government — Free)
1. Go to: https://bhashini.gov.in/ulca/user/register
2. Register with email (government portal).
3. Request API access.
4. Receive `userId` and `ulcaApiKey` via email.
5. Set as `BHASHINI_USER_ID` and `BHASHINI_API_KEY`.

#### Agmarknet API (Government — Free)
1. Go to: https://agmarknet.gov.in
2. Navigate to "Data API" section.
3. Register as a data consumer.
4. API is free for non-commercial/hackathon use.
5. Base URL: `https://agmarknet.gov.in/SearchCmmMkt.aspx`

#### OpenRouteService API (Free)
1. Go to: https://openrouteservice.org/sign-up/
2. Register with email.
3. Free tier: 2000 requests/day, 500/min for directions.
4. Copy API Key to `ORS_API_KEY`.

#### Razorpay Test Mode (Free)
1. Go to: https://dashboard.razorpay.com/signup
2. Complete business registration (use individual/student).
3. Go to Settings → API Keys → Generate Test Keys.
4. Test mode is unlimited and free.
5. Copy to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

---

## 10. DATABASE DESIGN

### 10.1 Entity Relationship Overview

```
users ──< farmers
users ──< bulk_buyers
users ──< logistics_partners
farmers ──< listings
FPOs ──< fpo_farmer_memberships >── farmers
listings ──< order_items >── orders
orders ──< payments
orders ──< logistics_assignments >── logistics_partners
users ──< reviews
users ──< grievances
```

### 10.2 Key Tables Schema

#### Table: users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    mobile          VARCHAR(15) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    role            ENUM('farmer','fpo_admin','consumer','bulk_buyer','logistics','admin') NOT NULL,
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    profile_image   VARCHAR(500),
    preferred_lang  VARCHAR(10) DEFAULT 'hi',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: farmers
```sql
CREATE TABLE farmers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    aadhaar_number  VARCHAR(12) UNIQUE,
    bank_account    VARCHAR(20),
    bank_ifsc       VARCHAR(11),
    bank_name       VARCHAR(100),
    village         VARCHAR(100),
    taluka          VARCHAR(100),
    district        VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pin_code        VARCHAR(6),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    land_area_acres DECIMAL(8,2),
    is_kyc_done     BOOLEAN DEFAULT FALSE,
    total_earnings  DECIMAL(12,2) DEFAULT 0,
    rating          DECIMAL(3,2) DEFAULT 0,
    fpo_id          UUID REFERENCES fpos(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: listings
```sql
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id       UUID REFERENCES farmers(id),
    crop_name       VARCHAR(100) NOT NULL,
    crop_category   VARCHAR(50),  -- Vegetable, Fruit, Grain, Spice, etc.
    variety         VARCHAR(100),
    quantity_kg     DECIMAL(10,2) NOT NULL,
    available_kg    DECIMAL(10,2) NOT NULL,
    price_per_kg    DECIMAL(8,2) NOT NULL,
    ai_suggested_price DECIMAL(8,2),
    min_order_kg    DECIMAL(8,2) DEFAULT 1,
    quality_grade   VARCHAR(10),  -- A, B, C
    harvest_date    DATE NOT NULL,
    expiry_date     DATE,
    description     TEXT,
    images          TEXT[],       -- Array of Cloudinary URLs
    is_organic      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    location        POINT,        -- PostGIS point
    district        VARCHAR(100),
    state           VARCHAR(100),
    qr_code_url     VARCHAR(500),
    lot_number      VARCHAR(50) UNIQUE,
    views_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: orders
```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id        UUID REFERENCES users(id),
    status          ENUM('pending','confirmed','packed','in_transit','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
    order_type      ENUM('retail','bulk') NOT NULL DEFAULT 'retail',
    subtotal        DECIMAL(12,2) NOT NULL,
    delivery_charge DECIMAL(8,2) DEFAULT 0,
    discount        DECIMAL(8,2) DEFAULT 0,
    gst_amount      DECIMAL(8,2) DEFAULT 0,
    total_amount    DECIMAL(12,2) NOT NULL,
    delivery_address JSONB NOT NULL,
    delivery_slot   TIMESTAMPTZ,
    payment_status  ENUM('pending','paid','refunded','failed') DEFAULT 'pending',
    notes           TEXT,
    invoice_url     VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: demand_forecasts (AI Cache)
```sql
CREATE TABLE demand_forecasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name       VARCHAR(100) NOT NULL,
    district        VARCHAR(100),
    state           VARCHAR(100),
    forecast_date   DATE NOT NULL,
    predicted_demand_kg DECIMAL(12,2),
    predicted_price DECIMAL(8,2),
    confidence_score DECIMAL(5,4),
    model_version   VARCHAR(20),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_name, district, forecast_date)
);
```

#### Table: logistics_assignments
```sql
CREATE TABLE logistics_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(id),
    driver_id       UUID REFERENCES logistics_partners(id),
    pickup_location JSONB,
    delivery_location JSONB,
    optimized_route JSONB,        -- OR-Tools route output
    estimated_km    DECIMAL(8,2),
    estimated_minutes INTEGER,
    actual_delivery_at TIMESTAMPTZ,
    status          ENUM('assigned','picked_up','in_transit','delivered','failed') DEFAULT 'assigned',
    proof_image     VARCHAR(500),
    driver_earnings DECIMAL(8,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 11. MODULE-WISE DEVELOPMENT PLAN

### Module 1 — Authentication & User Management

**Estimated Time:** 3 days (Prototype)

**Components to Build:**
- Registration page (Farmer / Consumer / Bulk Buyer)
- Login page (Email + Mobile OTP)
- JWT token generation + refresh token mechanism
- Password reset via OTP
- Role-based route guard on frontend
- Profile completion page (with KYC doc upload)
- Google OAuth integration

**API Endpoints:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/refresh-token
POST /api/auth/logout
GET  /api/auth/google
GET  /api/auth/google/callback
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/users/profile
PUT  /api/users/profile
POST /api/users/upload-kyc
```

---

### Module 2 — Marketplace — Listings

**Estimated Time:** 4 days (Prototype)

**Components to Build:**
- Create Listing Form (Farmer)
- Photo Upload (Cloudinary)
- AI Price Recommendation call (during listing creation)
- Listing Management (Edit / Delete / Toggle Active)
- Browse Marketplace (Consumer)
- Product Detail Page
- Search + Filter functionality
- QR Code generation per listing

**API Endpoints:**
```
POST   /api/listings              - Create listing
GET    /api/listings              - Browse listings (paginated, filtered)
GET    /api/listings/:id          - Get single listing
PUT    /api/listings/:id          - Update listing
DELETE /api/listings/:id          - Delete listing
GET    /api/listings/farmer/:farmerId - Farmer's own listings
GET    /api/listings/search       - Full text search
POST   /api/listings/upload-image - Upload image to Cloudinary
GET    /api/listings/:id/qr       - Get QR code for listing lot
GET    /api/listings/categories   - Get all crop categories
```

---

### Module 3 — Orders & Cart

**Estimated Time:** 3 days (Prototype)

**Components to Build:**
- Cart (session + DB stored)
- Checkout flow
- Order confirmation page
- Order history (buyer + farmer view)
- Order status tracking page
- Order cancellation

**API Endpoints:**
```
POST   /api/cart/add
GET    /api/cart
PUT    /api/cart/update/:itemId
DELETE /api/cart/remove/:itemId
DELETE /api/cart/clear
POST   /api/orders              - Place order
GET    /api/orders              - List orders (filtered by role)
GET    /api/orders/:id          - Order detail
PUT    /api/orders/:id/cancel   - Cancel order
GET    /api/orders/:id/invoice  - Download invoice PDF
```

---

### Module 4 — Payment

**Estimated Time:** 2 days (Prototype)

**Components to Build:**
- Razorpay order creation (backend)
- Razorpay Checkout.js integration (frontend)
- Payment webhook handler
- Payment status update
- Invoice PDF generation
- Farmer payout simulation (prototype: immediate; final: T+1 via Razorpay Route)

**API Endpoints:**
```
POST /api/payments/create-order        - Create Razorpay order
POST /api/payments/verify              - Verify payment signature
POST /api/payments/webhook             - Razorpay webhook
GET  /api/payments/history             - Payment history
POST /api/payments/refund/:orderId     - Initiate refund
```

---

### Module 5 — AI Demand Forecasting

**Estimated Time:** 3 days (Prototype)

**Components to Build (Python Flask):**
- `/forecast/demand` endpoint: Accept crop_name + district + days_ahead → Return forecast array
- Prophet model integration with Agmarknet sample data
- Daily cron job (via Antigravity) to refresh forecasts
- Dashboard chart displaying 7-day demand forecast
- Price recommendation endpoint

**API Endpoints (AI Service — Port 8000):**
```
POST /ai/forecast/demand
     Body: { crop_name, district, state, forecast_days }
     Returns: [ { date, predicted_demand_kg, predicted_price, confidence } ]

POST /ai/price/recommend
     Body: { crop_name, quantity_kg, quality_grade, district, harvest_date }
     Returns: { min_price, max_price, recommended_price, rationale }

GET  /ai/demand/heatmap
     Returns: GeoJSON of demand intensity by district

POST /ai/chatbot/query
     Body: { message, language, user_role, conversation_history }
     Returns: { response, suggested_actions }
```

**Prototype AI Model Approach:**
- Use Prophet library with 2-year historical Agmarknet data (downloaded once as CSV, included in repo).
- Fallback: if Prophet gives error, return moving average price.
- The model runs on startup; no GPU needed.

**Final AI Model Approach:**
- LSTM-based forecasting with 5 years of Agmarknet data.
- Model trained and saved as `.h5` file.
- Automated weekly retraining via GitHub Actions + Antigravity.
- Real-time Agmarknet API calls.

---

### Module 6 — Route Optimization & Logistics

**Estimated Time:** 3 days (Prototype)

**Components to Build:**
- Logistics assignment algorithm (nearest available driver)
- Order clustering by geographic proximity (K-Means, scikit-learn)
- Route visualization on Leaflet map
- Driver mobile PWA (simple: shows assigned orders + route)
- Delivery confirmation (photo upload)
- Driver earnings tracker

**API Endpoints (Backend):**
```
POST /api/logistics/cluster-orders       - Cluster orders by region
POST /api/logistics/assign-driver        - Assign driver to cluster
GET  /api/logistics/driver/assignments   - Driver's assignments
PUT  /api/logistics/delivery/:id/confirm - Confirm delivery + upload proof
GET  /api/logistics/track/:orderId       - Buyer tracks their order
GET  /api/logistics/route/:assignmentId  - Get optimized route JSON
```

**API Endpoints (AI Service — Port 8000):**
```
POST /ai/logistics/optimize-route
     Body: { pickup_points: [], delivery_points: [], driver_location: {} }
     Returns: { optimized_route: [], total_distance_km, estimated_minutes }

POST /ai/logistics/cluster-orders
     Body: { orders: [ { id, lat, lng } ] }
     Returns: { clusters: [ { cluster_id, orders: [], centroid } ] }
```

**Prototype Route Optimization Method:**
- K-Means clustering on order coordinates (scikit-learn).
- Nearest-neighbor greedy TSP for route within each cluster.
- Route displayed as polyline on Leaflet map.
- Distance calculated using OpenRouteService API.

**Final Route Optimization Method:**
- Google OR-Tools Vehicle Routing Problem (VRP) solver.
- Time-window constraints for delivery slots.
- Real-time traffic via OpenRouteService Matrix API.
- Auto-reassignment if driver is delayed.

---

### Module 7 — Multilingual Chatbot & Support

**Estimated Time:** 2 days (Prototype)

**Components to Build:**
- Chat widget (floating button on all pages)
- Groq API integration (backend proxy to avoid exposing key)
- Context-aware system prompt (role-based)
- Hindi/English language toggle
- FAQ quick-reply buttons
- Complaint filing via chat
- Conversation history (session-stored)

**System Prompt Template (Prototype — Groq/LLaMA):**
```
You are Kisan Mitra, a helpful AI assistant for Kisan Connect, 
a digital marketplace connecting farmers directly with consumers in India.

User Role: {user_role}
User Language Preference: {language}

You help with:
- Explaining how to list produce (for farmers)
- Helping find products and place orders (for consumers)
- Logistics and delivery questions
- Resolving complaints and grievances
- Providing crop price information

Always respond in {language}. Be simple, empathetic, and helpful.
If the user wants to file a complaint, collect: order_id, issue_description, 
and say you will escalate it.

Do NOT discuss competitor platforms or politics.
```

---

### Module 8 — Admin Dashboard & Analytics

**Estimated Time:** 2 days (Prototype)

**Components to Build:**
- Admin login with 2FA (TOTP, final; OTP, prototype)
- Dashboard with KPI cards (total orders, GMV, active farmers, active listings)
- Order management table (filter, search, status update)
- User management (activate/deactivate)
- Grievance management panel
- Reports export (CSV/PDF)
- Real-time order count (Socket.io polling, prototype)

---

## 12. UI/UX DESIGN PLAN

### 12.1 Design Principles

1. **Mobile-First**: 70%+ of target users are on mobile.
2. **Low-Literacy Friendly**: Icons + Voice assistance for farmers.
3. **High Contrast**: Works in bright sunlight (outdoor use by farmers).
4. **Fast Loading**: Optimized for 2G/3G connections (< 2MB initial bundle).
5. **Regional Fonts**: Noto Sans family for Hindi/Devanagari support.

### 12.2 Color Palette

| Color | Hex | Usage |
|---|---|---|
| Primary Green | `#2D7A2D` | CTAs, Farmer UI |
| Light Green | `#E8F5E9` | Backgrounds |
| Warm Amber | `#F57C00` | Highlights, Price tags |
| Dark Brown | `#3E2723` | Text headings |
| Pure White | `#FFFFFF` | Cards, Backgrounds |
| Light Gray | `#F5F5F5` | Subtle backgrounds |
| Error Red | `#D32F2F` | Error states |
| Success Green | `#388E3C` | Success states |

### 12.3 Typography

| Type | Font | Size | Weight |
|---|---|---|---|
| Headings (English) | Inter | 24–36px | 700 |
| Body (English) | Inter | 14–16px | 400 |
| Headings (Hindi) | Noto Sans Devanagari | 22–32px | 700 |
| Body (Hindi) | Noto Sans Devanagari | 14–16px | 400 |
| Monospace (Codes, IDs) | Roboto Mono | 12–14px | 400 |

### 12.4 Key Screens (Prototype)

1. **Home / Landing Page**: Hero banner, crop category icons, search bar, featured listings.
2. **Marketplace Browse**: Grid of ProductCards, filter sidebar, search.
3. **Product Detail**: Images, price, farmer info, origin map, traceability, "Add to Cart" CTA.
4. **Farmer Dashboard**: Stats (earnings, active listings, orders), Quick Actions.
5. **Create Listing**: Multi-step form (Crop Info → Photos → Price → Confirm).
6. **Demand Forecast Dashboard**: 7-day chart, regional heatmap, crop advisory.
7. **Cart & Checkout**: Order summary, address form, payment selection, Razorpay modal.
8. **Order Tracking**: Status timeline, driver location map, ETA.
9. **Admin Dashboard**: KPI cards, order table, user management.
10. **Chatbot Widget**: Sliding drawer from bottom, language toggle, message bubbles.

### 12.5 Tools for Design

| Tool | Purpose | Free |
|---|---|---|
| **Figma** | UI Design & Prototyping | ✅ Free (up to 3 projects) |
| **shadcn/ui** | Pre-built accessible React components | ✅ Free |
| **Tailwind CSS** | Utility-first CSS | ✅ Free |
| **Lucide Icons** | Icon set | ✅ Free |
| **unDraw.co** | Free SVG illustrations | ✅ Free |
| **Google Fonts** | Noto Sans Devanagari, Inter | ✅ Free |
| **Canva** | Presentation / Pitch Deck | ✅ Free tier |

---

## 13. AI FEATURES — DETAILED DESIGN

### 13.1 Demand Forecasting Module

**Technology:** Meta Prophet + Historical Agmarknet data

**Data Source for Prototype:**
- Download 2-year CSV from Agmarknet for top 20 crops in top 10 districts.
- URL: https://agmarknet.gov.in (Data export feature)
- File: `ai-service/data/agmarknet_sample.csv`

**Forecasting Logic:**
```python
# Simplified Prophet flow
from prophet import Prophet
import pandas as pd

def forecast_crop_demand(crop_name: str, district: str, days_ahead: int = 7):
    # Load historical data
    df = pd.read_csv('data/agmarknet_sample.csv')
    crop_df = df[(df['commodity'] == crop_name) & (df['district'] == district)]
    
    # Prepare for Prophet (requires 'ds' and 'y' columns)
    prophet_df = crop_df[['date', 'modal_price']].rename(
        columns={'date': 'ds', 'modal_price': 'y'}
    )
    prophet_df['ds'] = pd.to_datetime(prophet_df['ds'])
    
    # Fit model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.1
    )
    model.fit(prophet_df)
    
    # Make forecast
    future = model.make_future_dataframe(periods=days_ahead)
    forecast = model.predict(future)
    
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(days_ahead).to_dict('records')
```

**API Response Format:**
```json
{
  "crop_name": "Tomato",
  "district": "Nashik",
  "forecast": [
    {
      "date": "2026-08-28",
      "predicted_price_per_kg": 18.5,
      "lower_bound": 15.2,
      "upper_bound": 22.1,
      "confidence": 0.85,
      "demand_index": 72
    }
  ],
  "advisory": "Tomato prices expected to rise 12% this week due to reduced supply from Nashik. Good time to sell.",
  "model_version": "prophet-v1.1"
}
```

### 13.2 AI Price Recommendation

**Logic for Prototype:**
1. Fetch last 30 days of prices for this crop + district from Agmarknet data.
2. Calculate: mean, standard deviation, current market price.
3. Apply quality grade adjustment: A = +15%, B = +0%, C = -10%.
4. Apply organic adjustment: +20% if organic.
5. Apply seasonal adjustment: based on crop calendar JSON.
6. Return: `{ min_price, recommended_price, max_price, rationale }`.

**Logic for Final:**
- Gradient Boosting Regressor trained on 5 years of Agmarknet + weather + fuel price data.
- Features: crop, district, date, quality, organic, weather anomaly, MSP, festival proximity.

### 13.3 Route Optimization

**Prototype — K-Means + Greedy TSP:**
```python
from sklearn.cluster import KMeans
import numpy as np

def cluster_orders(orders: list, n_vehicles: int = 3):
    coords = np.array([[o['lat'], o['lng']] for o in orders])
    
    kmeans = KMeans(n_clusters=min(n_vehicles, len(orders)), random_state=42)
    labels = kmeans.fit_predict(coords)
    
    clusters = {}
    for i, order in enumerate(orders):
        cluster_id = int(labels[i])
        if cluster_id not in clusters:
            clusters[cluster_id] = []
        clusters[cluster_id].append(order)
    
    return clusters

def greedy_tsp(depot: dict, stops: list) -> list:
    """Nearest-neighbor greedy TSP"""
    unvisited = stops.copy()
    route = [depot]
    current = depot
    
    while unvisited:
        nearest = min(unvisited, key=lambda s: haversine(current, s))
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest
    
    return route
```

**Final — Google OR-Tools VRP:**
```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def solve_vrp(distance_matrix, num_vehicles, depot):
    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix), num_vehicles, depot
    )
    routing = pywrapcp.RoutingModel(manager)
    
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    
    solution = routing.SolveWithParameters(search_parameters)
    return extract_routes(manager, routing, solution)
```

### 13.4 Chatbot (Kisan Mitra)

**Prototype — Groq API (LLaMA 3.1 8B — Free):**
```python
from groq import Groq

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def chat_with_kisan_mitra(message: str, user_role: str, language: str, history: list):
    system_prompt = f"""
    You are Kisan Mitra, a helpful AI assistant for Kisan Connect.
    User Role: {user_role}
    Respond in: {language}
    Be concise, helpful, and empathetic.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": message})
    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=500,
        temperature=0.7
    )
    
    return response.choices[0].message.content
```

**Final — Gemini 1.5 Flash + Bhashini for non-English input:**
- User speaks in Marathi → Bhashini STT → Translated to English → Gemini → Response in English → Bhashini TTS → Audio in Marathi.
- Multilingual end-to-end pipeline.
- RAG (Retrieval-Augmented Generation) with Kisan Connect FAQs + policy docs.

---

## 14. LOGISTICS MODULE — DETAILED DESIGN

### 14.1 Logistics Flow

```
Step 1: Orders Received (status: 'confirmed')
           ↓
Step 2: Cluster orders by geo-proximity (K-Means)
  - Orders within 5km radius grouped together
  - Max 10 orders per cluster
           ↓
Step 3: Find available drivers in region
  - Query drivers with status = 'available'
  - Filter by distance to pickup cluster centroid
           ↓
Step 4: Calculate optimized route for each cluster
  - Input: driver start location + all pickup + delivery points
  - Output: ordered list of stops + total km + ETA
           ↓
Step 5: Assign driver → Send notification (FCM + SMS)
           ↓
Step 6: Driver picks up from farmer
  - App shows pickup address + produce details
  - Driver taps "Picked Up" → status updates to 'in_transit'
           ↓
Step 7: Delivery
  - App shows route turn-by-turn (Leaflet + ORS)
  - Driver taps "Delivered" → uploads proof photo
  - Consumer gets SMS notification
           ↓
Step 8: Payment release to farmer and driver
  - Farmer: gets (order_amount - platform_commission - logistics_charge)
  - Driver: gets logistics_charge
```

### 14.2 Commission Structure (Prototype Default)

| Item | Value |
|---|---|
| Platform Commission | 5% of order value |
| Logistics Charge (consumer) | ₹30 flat (< 10km) / ₹50 (10–30km) |
| Driver Commission | 80% of logistics charge |
| Farmer Net | Order Value − Platform 5% |

### 14.3 Logistics Partner Onboarding

Required documents (uploaded, not verified in prototype):
- Aadhar Card
- Driving License
- Vehicle Registration Certificate
- Vehicle photo

---

## 15. SECURITY & COMPLIANCE

### 15.1 Security Measures

| Layer | Measure |
|---|---|
| **Transport** | HTTPS everywhere (Let's Encrypt) |
| **Authentication** | JWT (RS256 signed) + Refresh token rotation |
| **Authorization** | Role-based + Resource ownership check |
| **Passwords** | bcryptjs with salt rounds = 12 |
| **API Rate Limiting** | 100 req/15min per IP (express-rate-limit) |
| **OTP** | 6-digit, 10-minute expiry, max 3 attempts |
| **SQL Injection** | Sequelize parameterized queries (never raw interpolation) |
| **XSS** | xss-clean middleware + React escaping |
| **CORS** | Whitelist: frontend URL only |
| **Helmet.js** | Secure HTTP headers |
| **Input Validation** | Joi schemas for all request bodies |
| **File Upload** | Type check (images only), size limit 5MB, virus scan (final: ClamAV) |
| **API Keys** | Never in client-side code; always in .env; proxied via backend |
| **Logs** | No PII in logs; Aadhaar/mobile masked |
| **Payments** | Razorpay signature verification on every webhook |

### 15.2 Data Privacy

- All PII encrypted at rest in PostgreSQL (pgcrypto extension for Aadhaar).
- Aadhaar number stored as SHA-256 hash after verification.
- User can request account deletion (GDPR-style, even for India).
- Data retention: Order data 7 years (GST compliance), other data 3 years.

### 15.3 Compliance

| Regulation | How We Comply |
|---|---|
| **IT Act 2000** | Terms of Service, Privacy Policy, Grievance Officer named |
| **GST** | HSN codes for agricultural produce; GST invoice generation |
| **FSSAI** | Bulk buyer registration asks for FSSAI license |
| **Consumer Protection Act 2019** | Grievance mechanism within 48hr resolution SLA |
| **Aadhaar Act** | Using only OTP-based verification, not storing biometrics |

---

## 16. TESTING STRATEGY

### 16.1 Unit Testing

**Backend (Jest):**
```bash
npm run test -- --coverage
# Target: 70% coverage for prototype, 85% for final
```

Test files location: `backend/tests/unit/`

Key test suites:
- `auth.test.js` — Login, OTP, JWT
- `listing.test.js` — CRUD operations
- `order.test.js` — Order flow
- `payment.test.js` — Razorpay signature verification

**AI Service (pytest):**
```bash
pytest ai-service/tests/ -v --cov=app
```

Test files:
- `test_forecasting.py`
- `test_route_optimizer.py`
- `test_price_recommender.py`

### 16.2 Integration Testing

- API endpoint testing using Postman Collection (exported as JSON in `docs/postman_collection.json`).
- Automated via Newman CLI in GitHub Actions.
- Tests cover: Happy path, validation errors, auth failures, edge cases.

### 16.3 End-to-End Testing

**Tool:** Cypress

Key E2E flows:
1. Farmer Registration → KYC → Create Listing → View Listing.
2. Consumer → Browse → Add to Cart → Checkout → Payment (Test) → Order Confirmation.
3. Driver → Login → View Assigned Order → Mark Delivered.
4. Admin → View Dashboard → Resolve Grievance.

### 16.4 Performance Testing

**Tool:** k6 (free)

Target benchmarks (prototype):
- 100 concurrent users
- Average response time < 500ms
- 95th percentile < 1000ms

### 16.5 Testing Checklist Before Submission

- [ ] All API endpoints return correct status codes
- [ ] Authentication works for all roles
- [ ] Payment flow (test mode) completes successfully
- [ ] AI forecast endpoint responds in < 3 seconds
- [ ] Route optimization returns valid route for 5 test orders
- [ ] Chatbot responds in English and Hindi
- [ ] All forms validate inputs correctly
- [ ] Mobile layout works on 375px viewport
- [ ] PWA installs correctly on Android Chrome
- [ ] All images load from Cloudinary
- [ ] OTP flow works (SMS received)
- [ ] Invoice PDF generates correctly
- [ ] Admin can manage users and orders

---

## 17. DEPLOYMENT PLAN

### 17.1 Prototype Deployment (Free Tier)

```
Frontend (React + Vite)
    → Build: npm run build
    → Deploy: Vercel (free)
    → URL: kisan-connect.vercel.app

Backend (Node.js + Express)
    → Dockerized
    → Deploy: Render.com (free web service)
    → URL: api.kisan-connect.onrender.com

AI Service (Python Flask)
    → Dockerized
    → Deploy: Railway.app (free $5/month credit)
    → URL: ai.kisan-connect.railway.app

Database: Supabase (free PostgreSQL)
Cache: Upstash Redis (free)
Images: Cloudinary (free)
```

### 17.2 GitHub Actions CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Kisan Connect

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run backend tests
        run: |
          cd backend
          npm install
          npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: curl ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### 17.3 Production Deployment (Final App)

```
Frontend → Vercel (or AWS S3 + CloudFront)
Backend  → AWS EC2 t3.small (or DigitalOcean $12/mo)
          + Nginx reverse proxy
          + PM2 process manager
AI Service → AWS EC2 (same or separate instance)
Database → AWS RDS PostgreSQL (or Supabase Pro)
Cache → Redis Cloud / Upstash Pro
CDN → Cloudflare (free tier for DDoS protection)
Monitoring → Grafana + Prometheus
Logging → ELK Stack
```

---

## 18. TIMELINE & MILESTONES

### 18.1 Prototype Development Timeline (for SIH Submission)

> Total Available Time: ~3 weeks (assuming team starts immediately)

| Week | Days | Tasks |
|---|---|---|
| **Week 1** | Day 1–2 | Project setup, repo init, environment config, database schema, Figma design |
| **Week 1** | Day 3–4 | Authentication module (backend + frontend) |
| **Week 1** | Day 5–6 | Marketplace listings (backend CRUD + frontend browse page) |
| **Week 1** | Day 7 | Farmer listing creation form + Cloudinary upload |
| **Week 2** | Day 8–9 | Cart + Orders module |
| **Week 2** | Day 10** | Payment integration (Razorpay test mode) |
| **Week 2** | Day 11–12 | AI Service setup + Demand Forecasting endpoint |
| **Week 2** | Day 13 | Price Recommendation + Chatbot (Groq API) |
| **Week 2** | Day 14 | Route Optimization + Logistics module basics |
| **Week 3** | Day 15–16 | Driver PWA + Order tracking page |
| **Week 3** | Day 17 | Admin dashboard |
| **Week 3** | Day 18 | Multilingual support (Hindi i18n) |
| **Week 3** | Day 19 | Testing, bug fixes, performance optimization |
| **Week 3** | Day 20 | Deployment to Vercel + Render + Railway |
| **Week 3** | Day 21 | Final testing on deployed URLs, Demo video, Presentation |

### 18.2 Key Milestone Dates

| Milestone | Target Date | Deliverable |
|---|---|---|
| M1: Project Setup Complete | Day 2 | GitHub repo, DB schema, .env configured |
| M2: Auth + Listings Working | Day 7 | Farmer can register, login, create listing |
| M3: Order + Payment Working | Day 10 | Consumer can order and pay (test mode) |
| M4: AI Features Working | Day 13 | Forecast, price rec, chatbot responding |
| M5: Logistics Working | Day 15 | Driver can see and complete deliveries |
| M6: Full Prototype Deployed | Day 20 | Live URLs for all services |
| **SIH Submission** | **20 Sep 2026** | Idea + PPT + Demo Video submitted |

---

## 19. TEAM ROLES & RESPONSIBILITIES

### 19.1 Recommended Team Structure (6 Members)

| Role | Member | Primary Responsibilities |
|---|---|---|
| **Project Lead / PM** | Member 1 | Architecture decisions, timeline tracking, documentation (this DPR), presentation, Antigravity workflows |
| **Frontend Developer 1** | Member 2 | React.js — Marketplace, Farmer dashboard, Cart/Checkout, Routing |
| **Frontend Developer 2** | Member 3 | React.js — Admin dashboard, Driver PWA, Charts, i18n, Chatbot widget |
| **Backend Developer** | Member 4 | Node.js — All API endpoints, auth, orders, payments, webhooks, database |
| **AI/ML Engineer** | Member 5 | Python Flask — Demand forecasting, route optimization, price recommendation, chatbot backend |
| **DevOps / Full-Stack Support** | Member 6 | Docker, CI/CD, deployment, DB management, testing, OpenCode-assisted code review |

### 19.2 Daily Standup Agenda

Every day at 9:00 AM (15 min):
1. What did you complete yesterday?
2. What will you complete today?
3. Any blockers?

**Communication Tools:**
- WhatsApp group for daily comms
- GitHub Issues for task tracking
- GitHub Projects board (Kanban)
- Google Meet for daily standup
- Figma for design collaboration
- Shared Google Drive for docs

---

## 20. RISK ASSESSMENT & MITIGATION

| Risk | Probability | Impact | Mitigation Strategy |
|---|---|---|---|
| Government API (Agmarknet/eNAM) not responding | High | Medium | Use cached CSV data as fallback; mock data for prototype |
| Aadhaar API access not available for hackathon | High | Low | Use mobile OTP as primary KYC for prototype |
| Groq API rate limit hit during demo | Medium | High | Cache chatbot responses; use Gemini Flash as fallback |
| Render.com free tier cold start (30s delay) | High | Medium | Keep alive ping every 14 min (UptimeRobot); add loading screen |
| Database connection pool exhaustion | Low | High | Set pool max = 5 for free Supabase; use Redis caching heavily |
| Payment failure during demo | Medium | High | Use Razorpay test mode; have test card numbers ready |
| Route optimization takes > 5s | Medium | Medium | Precompute clusters; set 30-order cap with greedy fallback |
| Team member unavailable during critical phase | Low | High | Pair programming for all critical modules; OpenCode for quick catch-up |
| Bhashini API registration delayed | Medium | Low | Use static i18n (pre-translated strings) for prototype |
| MSG91 OTP delivery failure | Low | Medium | Email OTP as fallback; WhatsApp OTP as second fallback |

---

## 21. COST ESTIMATION

### 21.1 Prototype Phase (SIH Demo) — Target: ₹0

| Resource | Service | Cost |
|---|---|---|
| Frontend Hosting | Vercel Free | ₹0 |
| Backend Hosting | Render.com Free | ₹0 |
| AI Service Hosting | Railway.app Free ($5 credit) | ₹0 |
| Database | Supabase Free (500MB) | ₹0 |
| Cache | Upstash Free | ₹0 |
| Image Storage | Cloudinary Free (25 credits) | ₹0 |
| AI Chatbot | Groq Free Tier | ₹0 |
| Maps | Leaflet + OpenStreetMap | ₹0 |
| Route Engine | ORS Free Tier | ₹0 |
| SMS OTP | MSG91 (10 free/day) | ₹0 |
| Push Notifications | Firebase Free | ₹0 |
| Email | Gmail SMTP Free | ₹0 |
| Domain | .vercel.app subdomain | ₹0 |
| SSL | Let's Encrypt (automatic) | ₹0 |
| CI/CD | GitHub Actions Free | ₹0 |
| **TOTAL PROTOTYPE** | | **₹0** |

### 21.2 Final Production Phase — Estimated Monthly Cost

| Resource | Service | Monthly Cost |
|---|---|---|
| Backend Server | AWS EC2 t3.small | ~₹1,400 |
| Database | Supabase Pro | ~₹2,100 |
| Redis | Upstash Pay-as-you-go | ~₹400 |
| Domain | .in domain | ~₹100 (annual) |
| SMS OTP (1000/mo) | MSG91 | ~₹200 |
| Maps (> 28K calls/mo) | Google Maps | ~₹700 |
| Gemini API | Google AI | ~₹500 |
| Cloudinary Pro | — | ~₹1,500 |
| Monitoring | Grafana Cloud | ~₹0 (free) |
| **TOTAL PRODUCTION (MVP)** | | **~₹6,900/month** |

---

## 22. FUTURE ROADMAP

### Phase 1 — Prototype (SIH 2026)
All features marked 🔵 in Section 5.

### Phase 2 — Beta Launch (3 months post-SIH)
- Aadhaar-based KYC live.
- eNAM and ONDC integration.
- 3 languages: Hindi, Marathi, Telugu.
- Android native app (React Native).
- Cold storage booking module.
- Farmer credit score based on transaction history.
- Government scheme advisory (PM Kisan, Fasal Bima).

### Phase 3 — Scale (6–12 months)
- All 22 Indian languages (Bhashini).
- IoT cold-chain temperature monitoring.
- Blockchain-based produce traceability (Hyperledger Fabric).
- Farmer credit + BNPL (Buy Now Pay Later) via NBFC partnership.
- Export market integration (APEDA, FIEO).
- Integration with India Post logistics.
- AI-powered crop insurance advisory.
- Satellite imagery for crop health assessment (NASA FIRMS / ISRO NRSC).

### Phase 4 — National Scale
- Integration with National Cooperative Database (NCDC).
- White-label solution for state governments (KisanConnect for Maharashtra, etc.).
- API marketplace for Agri-Fintech companies.
- Carbon credit tracking for organic farmers.

---

## 23. APPENDICES

### Appendix A — Sample Agmarknet Data Structure

```csv
date,state,district,market,commodity,variety,min_price,max_price,modal_price,unit
2026-01-15,Maharashtra,Nashik,Lasalgaon,Tomato,Local,800,1200,1000,Quintal
2026-01-15,Maharashtra,Pune,Pune,Onion,Red,600,900,750,Quintal
2026-01-15,Punjab,Amritsar,Amritsar,Wheat,Sharbati,2100,2300,2200,Quintal
```

### Appendix B — Crop Categories & HSN Codes

| Category | Examples | GST Rate | HSN Code |
|---|---|---|---|
| Fresh Vegetables | Tomato, Onion, Potato | 0% | 0702-0714 |
| Fresh Fruits | Mango, Banana, Apple | 0% | 0801-0810 |
| Grains & Cereals | Wheat, Rice, Maize | 0% | 1001-1008 |
| Spices | Turmeric, Chili, Coriander | 5% | 0901-0910 |
| Dairy (Future) | Milk, Curd | 5% | 0401-0406 |
| Processed Foods | Flour, Oil | 5-18% | 1101-1515 |

### Appendix C — Supported Districts for Phase 1 (Prototype)

The following 10 districts will have pre-loaded historical data for AI forecasting:

1. Nashik, Maharashtra (Onion, Tomato, Grapes)
2. Pune, Maharashtra (Vegetables)
3. Amritsar, Punjab (Wheat, Rice)
4. Ludhiana, Punjab (Potato, Vegetables)
5. Coimbatore, Tamil Nadu (Vegetables, Coconut)
6. Mysuru, Karnataka (Vegetables, Turmeric)
7. Guntur, Andhra Pradesh (Chili, Cotton)
8. Jaipur, Rajasthan (Vegetables, Spices)
9. Indore, Madhya Pradesh (Soybean, Garlic)
10. Varanasi, Uttar Pradesh (Vegetables, Rice)

### Appendix D — API Response Standard Format

All API endpoints follow this standard response envelope:

```json
// Success
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
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
  "errors": [
    { "field": "mobile", "message": "Mobile number must be 10 digits" }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Appendix E — QR Code Data Structure

Each produce lot gets a QR code encoding the following JSON:

```json
{
  "version": "1.0",
  "platform": "KisanConnect",
  "lot_number": "KC-2026-MH-NAS-00012",
  "crop": "Tomato",
  "variety": "Local",
  "farmer_name": "Ramesh Patil",
  "farmer_id": "f-uuid-xxxx",
  "village": "Pimpalgaon Baswant",
  "district": "Nashik",
  "state": "Maharashtra",
  "harvest_date": "2026-08-25",
  "listed_date": "2026-08-26",
  "quantity_kg": 500,
  "quality_grade": "A",
  "is_organic": false,
  "verify_url": "https://kisanconnect.in/trace/KC-2026-MH-NAS-00012"
}
```

### Appendix F — OpenCode Prompts Used (Example)

The following prompts were used with OpenCode to scaffold code:

```
PROMPT 1 (Backend Auth):
"Generate a complete Node.js Express auth controller with the following:
- register(req, res): accepts { full_name, mobile, email, password, role }
- Validates with Joi
- Hashes password with bcryptjs (12 rounds)
- Creates user in PostgreSQL via Sequelize
- Returns JWT access token (expires 7d) and refresh token (expires 30d)
- Use async/await and proper error handling"

PROMPT 2 (AI Forecasting Route):
"Generate a Flask route /ai/forecast/demand that:
- Accepts POST with { crop_name, district, state, forecast_days }
- Loads CSV from data/agmarknet_sample.csv
- Filters for crop and district
- Runs Meta Prophet model
- Returns JSON with [ { date, predicted_price, lower_bound, upper_bound } ]
- Handles case where data is insufficient (< 30 records)"

PROMPT 3 (React Listing Card):
"Generate a React functional component ListingCard that:
- Props: { id, crop_name, images, price_per_kg, quantity_kg, farmer_name, district, is_organic, quality_grade }
- Shows: image (Cloudinary URL), crop name, price, available quantity, origin
- Has: Organic badge, quality grade badge, 'View Details' button
- Uses Tailwind CSS
- Is responsive (mobile-first)
- On 'View Details' click: navigate to /marketplace/:id using React Router"
```

### Appendix G — Antigravity Workflow Specification

**Workflow 1: Daily Demand Forecast Refresh**
```
Trigger: Cron — Every day at 5:00 AM IST
Steps:
  1. HTTP GET → https://api.agmarknet.gov.in/prices?date=today
  2. Transform → Clean and format price data
  3. HTTP POST → http://ai-service/ai/forecast/batch (all 10 districts × 20 crops)
  4. Database Write → Insert/update demand_forecasts table
  5. Notification → Send crop advisory SMS to farmers in affected districts
  6. Log → Write execution summary to admin notification
```

**Workflow 2: Bulk Buyer — Farmer Matching**
```
Trigger: Webhook — When a new bulk_request is created
Steps:
  1. HTTP GET → /api/listings?crop=<requested_crop>&district=<nearby_districts>&quantity_gte=<quantity>
  2. AI Match → Groq API: "Given this bulk request and these listings, rank the top 5 matches by price, quality, and proximity"
  3. Notification → Send FCM notification to top 5 matched farmers
  4. Email → Send detailed match report to bulk buyer
  5. Update → Set bulk_request.status = 'matched' with matched_listing_ids
```

**Workflow 3: Grievance Auto-Triage**
```
Trigger: Webhook — New grievance created
Steps:
  1. AI Classify → Groq API: "Classify this grievance: {complaint_text}. Categories: payment, logistics, quality, fraud, other. Severity: low, medium, high, critical"
  2. Route → If severity = 'critical' → Assign to Senior Admin; else → Assign to Support Agent
  3. Notification → Email + FCM to assigned admin
  4. Auto-reply → Send acknowledgement SMS to user with ticket number and expected resolution time
  5. SLA Set → Calculate resolution deadline based on severity (critical: 4hr, high: 24hr, medium: 48hr, low: 72hr)
```

---

### Appendix H — Presentation Structure (PPT for SIH)

**Slide 1:** Cover — Kisan Connect | SIH26033 | Team Name + College  
**Slide 2:** Problem — Infographic of 10+ intermediaries and price markup  
**Slide 3:** Solution Overview — One-line pitch + key features  
**Slide 4:** How It Works — 3-step flow (Farmer Lists → Buyer Orders → AI Optimizes)  
**Slide 5:** Tech Architecture — Simplified diagram  
**Slide 6:** AI Features — Demand Forecasting (chart) + Route Optimization (map)  
**Slide 7:** Prototype Demo Screenshots — 6 key screens  
**Slide 8:** Impact Metrics — Potential earnings increase for farmers (data-backed)  
**Slide 9:** Roadmap — 4 phases  
**Slide 10:** Team + Thank You  

**Demo Video Script (5 minutes):**
1. (0:00–0:30) Problem narration with infographic
2. (0:30–1:30) Farmer onboards → Creates listing → Sees AI price recommendation
3. (1:30–2:30) Consumer browses → Adds to cart → Pays via Razorpay test → Gets confirmation
4. (2:30–3:30) AI Demand Forecast dashboard → Route optimization map
5. (3:30–4:00) Chatbot demo (Hindi)
6. (4:00–4:30) Admin dashboard overview
7. (4:30–5:00) Closing — impact statement + team

---

**Document Version:** 1.0  
**Prepared By:** Project Manager, Team Kisan Connect  
**Date:** August 27, 2026  
**SIH Problem Statement:** 26033 — Ministry of Consumer Affairs, Food & Public Distribution  
**Submission Deadline:** 20 September 2026  

---

*This document is the single source of truth for the Kisan Connect project for Smart India Hackathon 2026. All team members must refer to this DPR before making architectural or feature decisions.*
