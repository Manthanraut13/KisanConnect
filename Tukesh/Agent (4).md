# AGENT.md — Tukesh
## Role: Marketplace Backend Engineer — Listings + Orders + Payments + Omniroute Config

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Tukesh**, the **Marketplace Backend Engineer** of Team Kisan Connect, SIH 2026.

Tukesh is an **experienced AI builder** proficient with:
- **OpenCode** — primary tool for generating Node.js/Express backend code
- **Omniroute** — he configures and owns the API routing gateway for the entire project
- **Antigravity** — he calls Manthan's Antigravity webhook endpoints after key events (order placed, etc.)

Tukesh owns the **commercial heart** of Kisan Connect — the marketplace module. Without listings, orders, and payments, the platform has nothing to sell. His work is what generates the actual transactions that SIH judges will demo.

---

## WHAT TUKESH IS BUILDING

1. **Listing Module** — Full CRUD API for produce listings. Calls Siddhesh's AI price recommendation when a listing is created. Generates QR codes per lot.
2. **Order Module** — Cart management, order creation, order status management, invoice generation.
3. **Payment Module** — Razorpay integration (test mode): create Razorpay order, verify payment signature, handle webhooks, trigger farmer payouts.
4. **Logistics Backend** — Driver assignment API, order clustering call to Siddhesh's AI service, delivery confirmation.
5. **Omniroute Configuration** — Setting up Omniroute so all API traffic routes correctly between frontend, backend, and AI service.
6. **Internal Forecast Save Endpoint** — `/api/internal/forecasts/upsert` that Siddhesh's batch endpoint calls to save forecast data to DB.

---

## THE BIGGER PICTURE

**Kisan Connect** is a direct farm-to-consumer marketplace (SIH26033). Six team members build the prototype:
- Manthan — Auth + DB + Admin + Antigravity (dependency: your work depends on his DB models and auth middleware)
- Siddhesh — AI Service (dependency: you call his price recommendation API)
- **Tukesh (you)** — Marketplace backend (this document)
- Sunidhi — Frontend Farmer UI (she calls your listing endpoints)
- Payal — Frontend Consumer UI (she calls your order/cart endpoints)
- Pratham — Frontend Admin + Driver UI (he calls your logistics endpoints)

**Critical dependency:** Manthan must give you the DB models, JWT auth middleware, and notification service before you can fully build. Coordinate with him on Day 2 to get these.

**Critical output:** You must have the `/api/listings` and `/api/orders` endpoints working by Day 5 so Sunidhi and Payal can connect their frontends.

---

## OMNIROUTE — YOUR OWNERSHIP

You configure Omniroute so every request from every frontend component reaches the right backend service. Think of it as the "smart switchboard" of the system. Every URL the frontend calls goes through Omniroute first.

Routing rules you will configure:
- `/api/auth/*` → Backend, no JWT check
- `/api/*` → Backend, JWT required
- `/ai/*` → AI Service, JWT required
- `/api/payments/webhook` → Backend, NO JWT (uses Razorpay signature instead)
- `/health` → Both services, no auth

---

## HOW TO USE OPENCODE

Use OpenCode for generating:
- Express.js CRUD controllers and services
- Sequelize queries with complex joins and filters
- Razorpay integration code
- Logistics assignment algorithm
- Omniroute configuration files

Always specify exact file paths, exact function signatures, input/output types, and error handling requirements in your prompts.

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
