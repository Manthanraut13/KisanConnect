# AGENT.md — Manthan
## Role: Project Lead + Backend Architect + Antigravity Orchestration

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Manthan**, the **Project Lead and Backend Architect** of Team Kisan Connect, competing in **Smart India Hackathon 2026** (Problem Statement SIH26033).

Manthan is an **experienced AI builder** who is proficient with:
- **OpenCode** — for AI-assisted code generation and review
- **Antigravity** — for workflow automation and event orchestration
- **Omniroute** — for API routing and traffic management (he configures the gateway)

He is the **integration point for the whole team**. Every other member's code must ultimately connect correctly with what Manthan builds. He owns the backbone of the system.

---

## WHAT MANTHAN IS BUILDING

Manthan is responsible for:

1. **Project Setup & Repository Architecture** — The complete folder structure, Docker setup, CI/CD, shared configs, environment variable templates.
2. **Database Architecture** — The complete PostgreSQL schema using Sequelize ORM (all models + all migrations + seed data for testing).
3. **Authentication & User Management Module** — Full auth system: Register, Login (OTP + Password), JWT, Refresh Tokens, Google OAuth, Role-based access control.
4. **API Gateway & Omniroute Configuration** — Setting up Omniroute to route requests between frontend, backend, and AI service correctly.
5. **Antigravity Workflow Orchestration** — Building all 3 automation workflows: Daily Forecast Refresh, Order Notification Flow, Grievance Auto-Triage.
6. **Notification Service** — SMS (MSG91), Push (FCM), and Email (Gmail SMTP) notification wrappers used by all other modules.
7. **Admin Module** — Admin dashboard API endpoints (user management, platform stats, grievance management).
8. **Integration Layer** — Making sure all six members' work connects through a shared API contract and shared error handling conventions.

---

## THE BIGGER PICTURE (What the Full Project Does)

**Kisan Connect** is an AI-powered digital marketplace for India that directly connects farmers and FPOs (Farmer Producer Organizations) with consumers and bulk buyers, eliminating 10+ layers of intermediaries that currently eat into farmers' earnings.

The prototype must demonstrate:
- Farmers listing produce with AI-recommended prices
- Consumers browsing and ordering directly
- AI demand forecasting showing which crops will be in demand
- AI-optimized delivery route for logistics partners
- A multilingual chatbot for farmer support

There are **6 team members** building this prototype together:
- **Manthan (you)** — Backend foundation, Auth, DB, Antigravity
- **Siddhesh** — Python AI/ML service (forecasting, routing, chatbot)
- **Tukesh** — Marketplace backend (listings, orders, payments, Omniroute)
- **Sunidhi** — Frontend: Farmer dashboard + Marketplace listing views
- **Payal** — Frontend: Consumer browse + Cart + Checkout + Order tracking
- **Pratham** — Frontend: Admin dashboard + Chatbot widget + Driver PWA

**Your work is the foundation everything else depends on.** If auth breaks, no one can work. If DB models are wrong, every other module breaks. You must finish your work first (or at least the core auth + DB models within the first 2 days).

---

## HOW TO USE OPENCODE FOR YOUR TASKS

When generating code with OpenCode, always provide:
1. The exact file path where the code goes.
2. The technology (Node.js/Express/Sequelize).
3. All imports/dependencies explicitly.
4. The exact function signature with input/output types.
5. Any error handling requirements.

**Example OpenCode Prompt for Manthan:**
```
"Generate a Node.js Express auth controller in /backend/src/controllers/auth.controller.js.
It should have a register function that:
- Accepts { full_name, mobile, email, password, role } in req.body
- Validates using a Joi schema (import from ../middleware/validate.middleware)
- Hashes password with bcryptjs (12 rounds)
- Creates a User record in PostgreSQL using Sequelize User model
- Generates a JWT access token (7d expiry) and refresh token (30d expiry)
- Sends a welcome SMS via otp.service.js
- Returns { success: true, message: 'Registration successful', data: { user, access_token, refresh_token } }
- Passes any error to next(error) for global error handler
Use async/await. Import pattern: const { User } = require('../models');"
```

---

## ANTIGRAVITY RESPONSIBILITY

You own all Antigravity workflows. Build them AFTER the backend API endpoints exist, since workflows call those endpoints via webhooks.

Workflow 1: **Daily Forecast Refresh**
Workflow 2: **Order Notification Flow**
Workflow 3: **Grievance Auto-Triage**

Detailed specs are in your Implementation Plan.

---

## TEAM COORDINATION ROLE

- Share the `.env.example` with all team members within Day 1.
- Set up the GitHub repository with branch protection and folder structure by Day 1.
- Share database connection string with Tukesh and Siddhesh (they need it for their services).
- Do a 20-minute sync with Siddhesh on Day 3 to align AI service API contract (URL paths, request/response formats).
- Do a 20-minute sync with Tukesh on Day 4 to align backend API contract for marketplace.
- Review every team member's PR before merging to `dev` branch.
- You are the only person who pushes to `main`.

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
