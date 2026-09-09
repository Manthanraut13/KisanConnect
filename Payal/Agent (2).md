# AGENT.md — Payal
## Role: Frontend Developer — Consumer Browse + Cart + Checkout + Order Tracking

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Payal**, a **Frontend Developer** on Team Kisan Connect, SIH 2026.

Payal does not have much prior experience building projects — especially not with AI tools or large team codebases. That is completely fine. This document and the rest of her folder contain everything she needs, written step by step.

**Payal will use OpenCode as her primary coding tool.** Every component she needs to build has a ready-made OpenCode prompt in her Task.md file. She just needs to copy the prompt, review the output, and integrate it correctly.

**Important:** Payal does NOT need to understand every line of code that OpenCode generates. She needs to understand what each component does, what API it calls, and how it connects to the rest of the app. The prompts do the heavy lifting.

---

## WHAT PAYAL IS BUILDING

Payal owns the **Consumer-facing journey** — the part of the app that a regular buyer uses when they come to Kisan Connect to shop for fresh produce.

Her 6 pages / components:

| # | What | Route |
|---|---|---|
| 1 | **Home / Landing Page** | `/` |
| 2 | **Login + Register Pages** | `/login`, `/register` |
| 3 | **Cart Page** | `/cart` |
| 4 | **Checkout Page** | `/checkout` |
| 5 | **Order Confirmation Page** | `/order-success/:id` |
| 6 | **Order History + Tracking Page** | `/orders`, `/orders/:id` |

She also builds:
- The **Navbar** component (shared across the whole app — all team members use it).
- The **Protected Route** wrapper (used to block pages from unauthenticated users).

---

## THE BIGGER PICTURE

**Kisan Connect** (SIH26033) is a marketplace where farmers sell directly to consumers. There are 6 team members:

- Manthan — Backend: Auth, Database, Admin APIs
- Siddhesh — AI Service: Forecasting, Route Optimization, Chatbot
- Tukesh — Backend: Listings, Orders, Payments, Omniroute
- Sunidhi — Frontend: Marketplace browse, Farmer Dashboard
- **Payal (you)** — Frontend: Consumer Cart, Checkout, Orders (this document)
- Pratham — Frontend: Admin Panel, Chatbot Widget, Driver PWA

**Your work connects to:**
- Sunidhi's Marketplace page — she builds the "Add to Cart" button that puts items in the cart you display.
- Tukesh's backend — you call his cart, order, and payment APIs.
- Manthan's auth backend — your Login/Register pages call his auth APIs.

---

## HOW TO USE OPENCODE

Since Payal is newer to building, here is how to use OpenCode effectively:

1. Open your Task.md file.
2. Find the OpenCode prompt for the component you are building.
3. Copy the prompt exactly into OpenCode.
4. Read the generated code — make sure it makes sense.
5. If something is wrong or missing, add more detail to the prompt and run it again.
6. Paste the code into the correct file.
7. Run the app and test the component.

**You do not need to write code from scratch.** OpenCode writes it. Your job is to:
- Provide clear prompts.
- Review what is generated.
- Test that it works in the browser.
- Fix small issues by asking OpenCode follow-up questions.

---

## YOUR MOST IMPORTANT RULE

**Never hardcode the API URL.** Always use `import.meta.env.VITE_API_URL` in your service files. Tukesh gives you the actual URL value to put in your `.env` file.

---

## WHO TO ASK FOR HELP

| Problem | Ask |
|---|---|
| API not working / wrong response | Tukesh |
| Login/auth not working | Manthan |
| Payment Razorpay issues | Tukesh |
| React/UI issues | Sunidhi (she has more frontend experience) |
| General code help | Use OpenCode first, then ask Manthan |

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
