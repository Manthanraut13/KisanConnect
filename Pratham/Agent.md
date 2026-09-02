# AGENT.md — Pratham
## Role: Frontend Developer — Admin Dashboard + Chatbot Widget + Driver PWA

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Pratham**, a **Frontend Developer** on Team Kisan Connect, SIH 2026.

Pratham does not have much prior experience building projects. Like Payal, he will rely on **OpenCode** heavily to generate all his components. Every component in his Task.md has a ready-made OpenCode prompt he can use directly.

**Pratham's approach to building:**
1. Read the task description carefully.
2. Copy the OpenCode prompt for that component.
3. Run it in OpenCode.
4. Read the generated code to understand what it does.
5. Paste it in the right file.
6. Test it in the browser.
7. Fix small issues using follow-up OpenCode prompts.

---

## WHAT PRATHAM IS BUILDING

Pratham owns three distinct frontend sections:

### Section 1: Admin Dashboard (`/admin/*`)
A separate panel only accessible to users with `role = 'admin'`. Shows platform metrics and lets the admin manage users, orders, and grievances.

| Page | Route |
|---|---|
| Admin Dashboard | `/admin` |
| User Management | `/admin/users` |
| Orders Management | `/admin/orders` |
| Grievances Panel | `/admin/grievances` |
| Analytics | `/admin/analytics` |

### Section 2: Chatbot Widget (Kisan Mitra)
A floating chat button visible on every page (for all users). When clicked, opens a chat drawer where users can talk to the AI chatbot in English or Hindi.

This widget is added to the main `App.jsx` so it shows on all pages.

### Section 3: Driver PWA (`/driver/*`)
A simple mobile-first interface for delivery drivers. Shows their assigned deliveries and allows them to confirm deliveries.

| Page | Route |
|---|---|
| Driver Dashboard | `/driver` |
| Active Delivery View | `/driver/delivery/:id` |

---

## THE BIGGER PICTURE

**Kisan Connect** (SIH26033) — farmers sell directly to consumers. Six members build the prototype:

- Manthan — Backend Auth + DB + Admin APIs + Antigravity (he provides admin endpoints you call)
- Siddhesh — AI Service (you call his `/ai/chatbot/query` for the chatbot widget)
- Tukesh — Marketplace Backend (you call his `/api/logistics/driver/*` endpoints for driver pages)
- Sunidhi — Frontend: Marketplace + Farmer Dashboard
- Payal — Frontend: Consumer Cart + Checkout
- **Pratham (you)** — Frontend: Admin + Chatbot + Driver (this document)

**Your most impactful piece for the SIH demo:** The Chatbot Widget. Judges love interactive AI features. It must work well in both English and Hindi.

---

## HOW TO USE OPENCODE

For every component, Task.md has a prompt. Use it. Pratham does NOT need to write React code from scratch — OpenCode does the writing.

**One important habit:** After OpenCode generates code, always search for `VITE_API_URL` or hardcoded URLs. If you see `http://localhost:5000` or `http://localhost:8000` anywhere in the generated code, replace it with `import.meta.env.VITE_API_URL`.

---

## WHO TO ASK FOR HELP

| Problem | Ask |
|---|---|
| Admin API errors | Manthan |
| Chatbot API errors | Siddhesh |
| Driver logistics API errors | Tukesh |
| React/Tailwind UI issues | Sunidhi or Payal |
| General code issues | OpenCode first, then Manthan |

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
