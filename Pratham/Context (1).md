# CONTEXT.md — Pratham
## Full Project Context + Admin + Chatbot + Driver Frontend Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect is a digital marketplace where Indian farmers sell produce directly to consumers — no middlemen. Farmers currently earn only 15–30% of final consumer prices because of 10+ layers of intermediaries. This platform removes those.

### Prototype Must Show (SIH Demo)
1. Farmer creates listing with AI-suggested price.
2. Consumer browses, adds to cart, pays via Razorpay test mode.
3. AI demand forecast chart for farmers.
4. Route optimization map for delivery drivers.
5. **Chatbot (Kisan Mitra) that responds in Hindi and English.** ← YOUR MOST VISIBLE WORK
6. **Admin dashboard with platform metrics.** ← YOUR WORK

### Your Role in the Demo
SIH judges will:
1. Click the floating chat button → open Kisan Mitra chatbot → type a question in Hindi → see AI response. ← Pratham's chatbot
2. Go to `/admin` → see total orders, GMV, active listings, users ← Pratham's admin dashboard
3. See a driver's delivery view showing assigned orders ← Pratham's driver page

### Tech Stack You Use
- **React.js + Vite** — Framework
- **Tailwind CSS** — Styling
- **shadcn/ui** — Pre-built components (Card, Table, Badge, Dialog, Button)
- **Recharts** — For analytics charts in admin
- **Axios (via `api.js`)** — For API calls
- **Zustand (`authStore`)** — To get current user info
- **React Router v6** — Navigation
- **Lucide React** — Icons
- **sonner** — Toast notifications

### Full Team
| Member | Module | How they relate to you |
|---|---|---|
| Manthan | Backend Auth + Admin APIs | Your Admin pages call his `/api/admin/*` endpoints |
| Siddhesh | AI Service + Chatbot API | Your Chatbot widget calls his `/ai/chatbot/query` |
| Tukesh | Marketplace Backend + Logistics | Your Driver pages call his `/api/logistics/driver/*` |
| Sunidhi | Farmer Dashboard + Marketplace | Shared: App.jsx (she owns it — ask her to add your routes) |
| Payal | Consumer Frontend | Shared: Navbar (she owns it — your chatbot widget sits alongside it) |
| **Pratham (you)** | Admin + Chatbot + Driver | — |

---

## PART B — PRATHAM'S SPECIFIC CONTEXT

### B.1 Admin Dashboard — Pages and Data

#### Admin Dashboard (`/admin`)
The main admin home page. Shows 4 KPI stat cards at the top:
- Total Users: number
- Total Farmers: number  
- Total Orders: number
- Gross Merchandise Value (GMV): ₹ amount

Then two charts side by side:
- Left: Bar chart — "Orders This Week" (7 days, orders per day)
- Right: Line chart — "GMV This Week" (₹ per day)

Then: Recent Grievances (last 5) with status and action button.

**API:** `GET /api/admin/stats` → `{ totalUsers, totalFarmers, totalOrders, totalListings, gmv }`
**API:** `GET /api/admin/grievances?limit=5` → latest grievances

#### User Management (`/admin/users`)
A searchable, filterable table of all users.

Columns: Full Name, Mobile, Role (badge), District, Status (Active/Inactive toggle), Actions.
Filters: Search by name/mobile, Filter by role dropdown.
Actions: Activate/Deactivate user (toggle). View Profile button (opens a dialog with full user info).

**API:** `GET /api/admin/users?page=1&limit=20&role=farmer&search=ramesh`
**API:** `PUT /api/admin/users/:id/status` → toggle is_active

#### Orders Management (`/admin/orders`)
Table of all orders across all users.

Columns: Order ID (short), Buyer Name, Items, Total Amount, Status badge, Payment Status, Date, Actions.
Status badge colors: same as consumer side (see Payal's Context.md B.6).
Filters: Filter by status dropdown, date range.
Actions: View order details (opens dialog), Update status dropdown.

**API:** `GET /api/admin/orders` — Manthan provides this route (ask him if endpoint name differs)

#### Grievances Panel (`/admin/grievances`)
Table of all user complaints.

Columns: Ticket #, User Name, Category badge, Severity badge, Description (truncated), Status, SLA Deadline (red if past due), Assigned To, Actions.
Severity badge colors: critical=red, high=orange, medium=yellow, low=gray.
Actions: "Resolve" button (opens dialog to type resolution note + change status to resolved).

**API:** `GET /api/admin/grievances`
**API:** `PUT /api/admin/grievances/:id` → `{ status: 'resolved', resolution_note: '...' }`

#### Analytics (`/admin/analytics`)
Simple charts page with:
- Bar chart: Top 10 crops by order volume.
- Line chart: Daily orders trend (last 30 days).
- Pie-like stat: Top 5 districts by farmer count.

**API:** `GET /api/admin/reports/orders` → Manthan provides this (ask him for exact format)

---

### B.2 Chatbot Widget — Kisan Mitra

This is the floating chat button visible on ALL pages (not just admin).

**How it looks:**
- A floating circular button (fixed position, bottom-right corner) with a chat bubble icon and "Kisan Mitra" tooltip on hover.
- When clicked: a chat drawer slides up from the bottom (on mobile) or appears as a floating window (on desktop).
- Chat window has: header with bot name + language toggle, messages area, input box.

**How it works:**
- User types a message and hits Enter or clicks Send.
- Frontend calls `POST /ai/chatbot/query` with: `{ message, language, user_role, conversation_history }`.
- Response appears as a bot message bubble.
- Conversation history is maintained in component state (last 6 messages sent each time).
- Language toggle: EN/HI button switches the UI language and the `language` field in API calls.

**API call:**
```javascript
POST /ai/chatbot/query
Body: {
  message: "How do I track my order?",
  language: "en",              // "en" or "hi"
  user_role: "consumer",       // from authStore: farmer/consumer/bulk_buyer/logistics
  conversation_history: [       // last 6 messages
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi! How can I help you?" }
  ]
}
Response: { success: true, data: { response: "You can track your order at...", is_fallback: false } }
```

**Message bubbles:**
- User messages: right-aligned, green background.
- Bot messages: left-aligned, white background with green left border.
- Bot avatar: small green circle with "KM" initials.

**Quick Reply Buttons (below bot messages, prototype):**
After each bot message, show 3 quick reply buttons:
- "Track my order"
- "List a crop" (for farmers) OR "Find fresh tomatoes" (for consumers)
- "Talk to support"

Clicking a quick reply: fills the input and submits automatically.

**Greeting Message:**
When chat opens for the first time, show:
- Bot: "नमस्ते! 👋 I'm Kisan Mitra, your farming assistant. How can I help you today? / मैं आपकी कैसे मदद कर सकता हूँ?"

---

### B.3 Driver PWA — Pages

#### Driver Dashboard (`/driver`)
Shows the driver's assigned deliveries for today.

Header: "My Deliveries" + driver's name.
If no assignments: "No deliveries assigned today. Check back later."
If assignments: list of delivery cards, each showing:
- Order ID (short).
- Customer name + mobile.
- Delivery address (district + full address).
- Items: "Tomato 5kg, Onion 3kg".
- Status: Assigned / Picked Up / In Transit.
- "Start Delivery" button (if status = Assigned).
- "View Route" button (→ /driver/delivery/:id).

**API:** `GET /api/logistics/driver/assignments` (requires logistics role JWT)

#### Active Delivery View (`/driver/delivery/:id`)
A focused view for one active delivery.

Shows:
- Customer name, address, mobile (tap to call).
- Items list.
- A Leaflet map showing: starting point (current location) and delivery destination marker.
- Status update buttons: "Mark as Picked Up" → "Mark as In Transit" → "Mark as Delivered".
- "Mark as Delivered": opens a dialog to upload a photo (proof of delivery). After upload: PATCH the assignment status.

**API:** `GET /api/logistics/driver/assignments` (filter by id)
**API:** `PUT /api/logistics/delivery/:id/confirm` with proof image

**Note:** Driver pages must work on mobile — drivers use phones. Make all buttons large (min height 48px), text large (text-lg), easy to tap.

---

### B.4 Admin Route Guard

Admin pages must be protected with ProtectedRoute requiring role = 'admin':
```jsx
<Route element={<ProtectedRoute roles={['admin']} />}>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/users" element={<UserManagement />} />
  <Route path="/admin/orders" element={<AdminOrders />} />
  <Route path="/admin/grievances" element={<Grievances />} />
  <Route path="/admin/analytics" element={<Analytics />} />
</Route>
```

### B.5 Admin Sidebar Navigation

The admin section has its own left sidebar navigation (not the main Navbar):
- Dashboard
- Users
- Orders
- Grievances
- Analytics

The sidebar is shown inside an AdminLayout wrapper component that wraps all admin pages.

### B.6 API Services You Build

```
src/services/admin.service.js       — all /api/admin/* calls
src/services/driver.service.js      — all /api/logistics/driver/* calls
(chatbot calls go through existing ai.service.js from Sunidhi)
```

---

*Context version: 1.0 | Pratham | Kisan Connect SIH 2026*
