# AGENT.md — Sunidhi
## Role: Frontend Developer — Farmer Dashboard + Marketplace UI

---

## WHO YOU ARE WORKING WITH

You are the coding agent for **Sunidhi**, a **Frontend Developer** on Team Kisan Connect, SIH 2026.

Sunidhi has **built small projects in Google AI Studio** and has some familiarity with web development, but has not built a large team-based project before. She will be using **OpenCode** as her primary tool to write React components, and she should rely on it heavily to generate code she may not be fully comfortable writing from scratch.

**This document, and all other documents in your folder, are written specifically for you. Read them fully before writing any code.**

---

## WHAT SUNIDHI IS BUILDING

Sunidhi owns the **Farmer-facing frontend** of Kisan Connect, and the **Marketplace browse UI** that all users see. Her work is the most visually prominent part of the application for the SIH demo.

Specifically:

1. **Marketplace Page** (`/marketplace`) — The main product grid where all listings are shown. Has filter sidebar, search bar, and product cards. This page is what consumers and bulk buyers first land on.
2. **Product Detail Page** (`/marketplace/:id`) — Full details of a single listing. Shows image gallery, price, farmer info, origin map, and "Add to Cart" button.
3. **Farmer Dashboard** (`/farmer/dashboard`) — Farmer's home screen. Shows: total earnings, active listings count, pending orders count, and a 7-day demand forecast chart.
4. **My Listings Page** (`/farmer/listings`) — Table of all the farmer's listings with status, available kg, and actions.
5. **Create Listing Form** (`/farmer/listings/new`) — Multi-step form where farmer enters crop details, uploads photos, sets price, and sees AI price recommendation.
6. **Demand Advisory Page** (`/farmer/advisory`) — Shows crop demand forecast charts pulled from the AI service.

---

## THE BIGGER PICTURE

**Kisan Connect** is a marketplace for India where farmers sell directly to consumers (SIH26033). There are 6 team members:
- Manthan — Backend Auth + Database (you call his login/register/profile APIs)
- Siddhesh — AI Service (you call his forecast API for the demand chart)
- Tukesh — Marketplace Backend (you call his listing APIs heavily; he also gives you the Omniroute URL for `VITE_API_URL`)
- **Sunidhi (you)** — Frontend: Farmer side + Marketplace browse (this document)
- Payal — Frontend: Consumer Cart + Checkout + Order tracking
- Pratham — Frontend: Admin panel + Chatbot widget

**You are building the most visible part of the app.** The marketplace browse page is the first thing judges see when they open the app.

---

## YOUR RELATIONSHIP WITH OPENCODE

Since this is a large project, OpenCode is your co-developer. Here is exactly how to use it for React work:

**For generating components, always include in your prompt:**
1. The component name and file path.
2. Exactly what props it receives.
3. What it should display/do.
4. Any API calls it makes.
5. Tailwind CSS classes for styling.
6. That it uses shadcn/ui for UI elements.

**Example Prompt:**
```
"Generate a React functional component FarmerDashboard in 
/frontend/src/pages/farmer/FarmerDashboard.jsx.
It should:
- Show a welcome message: 'नमस्ते, {farmer.full_name}'
- Show 3 stat cards: Total Earnings (₹), Active Listings (count), Pending Orders (count)
- Show a recharts LineChart of 7-day demand forecast for farmer's primary crop
  (fetch from GET /ai/forecast/demand with body {crop_name: farmer.primaryCrop, district: farmer.district})
- Use Tailwind CSS with green color theme (text-green-700, bg-green-50)
- Use shadcn/ui Card component for stat cards
- Has a Quick Actions section with 2 buttons: 'Add New Listing' and 'View My Orders'
Use Zustand auth store to get farmer info. Use axios for API calls."
```

---

## KEY RULES FOR YOUR CODE

1. **Never hardcode API URLs.** Always use `import.meta.env.VITE_API_URL` from the `.env` file. The value comes from Tukesh's Omniroute setup.
2. **Always show loading states.** When fetching data, show a spinner (`<Loader2 className="animate-spin" />` from lucide-react) while the data loads.
3. **Always handle errors.** If an API call fails, show a toast error message using `sonner` toast library.
4. **Mobile first.** Build for 375px screen width first. Use Tailwind responsive prefixes (`sm:`, `md:`) to adapt for desktop.
5. **Hindi text.** Use `Noto Sans Devanagari` font for all Hindi text. English text uses `Inter` font.

---

*Agent context last updated: August 2026 | SIH26033 | Kisan Connect*
