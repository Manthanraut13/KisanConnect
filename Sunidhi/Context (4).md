# CONTEXT.md — Sunidhi
## Full Project Context + Farmer Frontend Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect is a platform that lets Indian farmers sell their produce DIRECTLY to consumers and bulk buyers — no middlemen. Farmers currently earn only 15–30% of consumer prices because of 10+ middlemen. This platform removes those middlemen.

### What the Prototype Must Show
1. A farmer can log in, create a listing (with AI-suggested price), and see their earnings.
2. A consumer can browse, add to cart, and pay.
3. A demand forecast dashboard shows 7-day crop price predictions (you build this chart).
4. Route optimization, admin panel, chatbot.

### Tech Stack (What You Use)
- **React.js + Vite** — The framework for building UI
- **Tailwind CSS** — CSS classes for styling (no separate CSS files needed)
- **shadcn/ui** — Pre-built UI components (Button, Card, Input, Badge, Table, etc.)
- **Recharts** — For drawing the demand forecast line charts
- **React Leaflet** — For showing farm location on a map
- **Axios** — For calling APIs
- **Zustand** — For storing global state (who is logged in)
- **React Router v6** — For page navigation
- **react-i18next** — For Hindi/English language switching
- **Lucide React** — For icons

### How the Frontend Connects to the Backend

Every API call goes through **Omniroute** (configured by Tukesh). The URL is stored in your `.env` as `VITE_API_URL`. This single URL routes to the right backend service:

```
Your React app → VITE_API_URL/api/listings → Tukesh's backend
Your React app → VITE_API_URL/ai/forecast/demand → Siddhesh's AI service
```

**Never hardcode:** `http://localhost:5000` or any service URL directly in component code.

### Team and What You Depend On
| Member | What you need from them |
|---|---|
| Manthan | Auth APIs: `/api/auth/login`, `/api/users/me`. Share `VITE_API_URL` domain. |
| Siddhesh | AI forecast API: `POST /ai/forecast/demand`. Share AI service URL (via Omniroute). |
| Tukesh | Listing APIs: `GET /api/listings`, `POST /api/listings`, etc. Also gives you the Omniroute URL for `VITE_API_URL`. |
| Payal | She builds Cart and Checkout. You build Marketplace browse. You share the Product card component she may reuse. |
| Pratham | He builds Admin panel and Chatbot widget. You don't directly depend on each other, but share the common Navbar component. |

---

## PART B — SUNIDHI'S SPECIFIC CONTEXT

### B.1 Frontend Project Setup

The frontend lives in `kisan-connect/frontend/`. It's a Vite + React project.

**Key files you'll work in:**
```
frontend/src/
├── pages/
│   ├── Marketplace.jsx         ← YOU BUILD
│   ├── ProductDetail.jsx        ← YOU BUILD
│   └── farmer/
│       ├── FarmerDashboard.jsx  ← YOU BUILD
│       ├── MyListings.jsx       ← YOU BUILD
│       ├── CreateListing.jsx    ← YOU BUILD
│       └── DemandAdvisory.jsx   ← YOU BUILD
├── components/
│   ├── marketplace/
│   │   ├── ProductCard.jsx      ← YOU BUILD (shared with Payal)
│   │   ├── ProductGrid.jsx      ← YOU BUILD
│   │   └── FilterSidebar.jsx    ← YOU BUILD
│   └── farmer/
│       ├── ListingForm.jsx      ← YOU BUILD
│       ├── PriceAdvisor.jsx     ← YOU BUILD
│       └── EarningChart.jsx     ← YOU BUILD
├── services/
│   ├── listing.service.js       ← YOU BUILD (Axios calls for listings)
│   └── ai.service.js            ← YOU BUILD (Axios calls for AI APIs)
```

**Files you DON'T build (Manthan/team sets these up):**
- `src/App.jsx` — Main app + router (you add your routes here)
- `src/services/api.js` — Axios instance (pre-configured)
- `src/stores/authStore.js` — Zustand auth store
- `src/components/common/Navbar.jsx` — Top navigation
- `src/components/common/ProtectedRoute.jsx` — Route guard

### B.2 Pages You Build — Detailed Descriptions

#### Page 1: Marketplace (`/marketplace`)

This is the main browsing page. It has:
- **Left sidebar** (`FilterSidebar.jsx`): Crop category filter (checkboxes), Price range slider (₹0–₹500/kg), State/District dropdown filter, Organic toggle, Quality grade filter.
- **Main area**: Search bar at the top. Product grid (`ProductGrid.jsx`) showing cards (`ProductCard.jsx`). Pagination at the bottom (12 items per page).

**API call:** `GET /api/listings?page=1&limit=12&crop_category=Vegetable&min_price=5&max_price=100&is_organic=true`

**State to manage locally (useState):**
- `filters` — Object of active filter values
- `listings` — Array of listing objects from API
- `loading` — Boolean: true while fetching
- `totalPages` — For pagination
- `searchQuery` — Text in search bar

#### Page 2: Product Detail (`/marketplace/:id`)

When user clicks "View Details" on a ProductCard, they land here. Shows:
- **Image gallery**: Main image + thumbnails of all listing images (from Cloudinary URLs).
- **Crop name + quality badge + organic badge**.
- **Price: ₹{price_per_kg}/kg** (big, bold, green).
- **Available quantity**: `{available_kg} kg available`.
- **Farmer card**: Farmer name, village, district, star rating.
- **Origin map**: Small Leaflet map with marker at farmer's location (lat/lng from listing).
- **Traceability**: Lot number displayed. QR code image (from `qr_code_url`).
- **Add to Cart** button (only for consumer/bulk_buyer roles. Farmers see "This is your listing").
- **Harvest date** and **Expiry date**.
- **AI Suggested Price** (if available): "AI recommends: ₹{ai_suggested_price}/kg" in a subtle info box.

**API call:** `GET /api/listings/:id`

#### Page 3: Farmer Dashboard (`/farmer/dashboard`)

The farmer's home page after login. Shows:
- **Welcome header**: "नमस्ते, {farmer_name}! 🌾" (in Hindi).
- **3 stat cards** (horizontal row on desktop, stacked on mobile):
  - Total Earnings: ₹{total_earnings}
  - Active Listings: {count}
  - Pending Orders: {count}
- **7-day Demand Forecast Chart** for the farmer's district and their most-listed crop:
  - Line chart (Recharts) with dates on X-axis, price on Y-axis.
  - Single line: "Predicted Price".
  - Tooltip shows predicted price + confidence.
- **Quick actions**: "➕ Add New Listing" button (→ /farmer/listings/new), "📦 View Orders" button (→ /farmer/orders).
- **Latest Orders** (small table): Last 3 orders related to this farmer's listings.

**API calls:**
- `GET /api/users/me` → get farmer profile
- `GET /api/listings/farmer/mine?limit=1` → get primary crop for forecast
- `POST /ai/forecast/demand` → `{ crop_name: primaryCrop, district: farmer.district, forecast_days: 7 }`
- `GET /api/orders?role=farmer&limit=3` → latest orders

#### Page 4: My Listings (`/farmer/listings`)

Table showing all the farmer's listings:
- Columns: Image (thumbnail), Crop Name, Variety, Available Kg / Total Kg, Price/kg, Grade, Harvest Date, Status (Active/Inactive badge), Actions.
- Actions per row: Edit button, Delete button (with confirmation modal).
- "Add New Listing" button at the top.

**API call:** `GET /api/listings/farmer/mine`

#### Page 5: Create Listing Form (`/farmer/listings/new`)

Multi-step form (3 steps with a progress indicator at top):

**Step 1 — Crop Details:**
- Crop Name (text input with autocomplete: Tomato, Onion, Potato, Rice, Wheat, etc.)
- Crop Category (dropdown: Vegetable, Fruit, Grain, Spice, Other)
- Variety (optional text)
- Quality Grade (radio: A, B, C)
- Is Organic (toggle switch)
- Quantity (kg)
- Minimum Order (kg)
- Harvest Date (date picker)
- Expiry Date (optional date picker)
- Description (textarea, optional)

**Step 2 — Photos:**
- Drag-and-drop image upload zone (up to 5 images)
- Preview thumbnails of uploaded images
- Remove individual image option

**Step 3 — Pricing:**
- Your Price (₹/kg) — number input
- **AI Price Recommendation Card**: After entering crop name + district (from farmer profile), automatically call `/ai/price/recommend` and show: "AI Suggests: ₹{min}–₹{max}/kg. Recommended: ₹{recommended}/kg". Show a small info icon explaining what this means.
- Confirm & Submit button.

After submit: show success toast, redirect to `/farmer/listings`.

**API calls:**
- `POST /api/listings` with multipart form data (images + JSON data)
- `POST /ai/price/recommend` (called when crop name changes, with 500ms debounce)

#### Page 6: Demand Advisory (`/farmer/advisory`)

A dedicated page for AI demand insights:
- Crop selector dropdown (20 crops)
- District shows farmer's district (auto-filled, not changeable)
- Chart type toggle: 7-day vs 30-day forecast
- Large Recharts line chart with predicted price + confidence band (upper/lower bounds)
- Below chart: Advisory text box (from `forecast.advisory` field)
- Weather note: "Current weather in {district}: {temp}°C, {precipitation}mm rain" (from Open-Meteo API)

**API calls:**
- `POST /ai/forecast/demand` → `{ crop_name, district, forecast_days: 7 or 30 }`
- `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=temperature_2m_max,precipitation_sum&forecast_days=1`

### B.3 API Response Shapes You Will Receive

**Listing (from GET /api/listings/:id):**
```javascript
{
  id: "uuid",
  crop_name: "Tomato",
  crop_category: "Vegetable",
  variety: "Local",
  quantity_kg: 500,
  available_kg: 350,
  price_per_kg: 22,
  ai_suggested_price: 20.5,
  min_order_kg: 5,
  quality_grade: "A",
  harvest_date: "2026-08-20",
  expiry_date: "2026-09-05",
  description: "Fresh tomatoes from our farm",
  images: ["https://res.cloudinary.com/.../tomato1.jpg"],
  is_organic: false,
  lot_number: "KC-2026-MH-NAS-00012",
  qr_code_url: "https://res.cloudinary.com/.../qr.png",
  district: "Nashik",
  state: "Maharashtra",
  latitude: 20.0059,
  longitude: 73.7797,
  farmerProfile: {
    id: "farmer-uuid",
    village: "Pimpalgaon",
    district: "Nashik",
    rating: 4.5,
    user: { full_name: "Ramesh Patil" }
  },
  createdAt: "2026-08-26T10:00:00Z"
}
```

**Demand Forecast (from POST /ai/forecast/demand):**
```javascript
{
  success: true,
  data: {
    forecast: [
      { date: "2026-09-01", predicted_price: 22.5, lower_bound: 18.0, upper_bound: 27.0, demand_index: 75, confidence: 0.85 },
      // ... 6 more days
    ],
    advisory: "Tomato prices expected to rise 12% this week. Good time to sell.",
    model_version: "prophet-v1.1"
  }
}
```

### B.4 Color Palette and Design Tokens

```javascript
// Use these exact Tailwind classes throughout your components:
Primary Green:  "text-green-700" / "bg-green-700" / "border-green-700"
Light Green BG: "bg-green-50"
Card BG:        "bg-white"
Border:         "border border-gray-100"
Text Primary:   "text-gray-900"
Text Secondary: "text-gray-500"
Text Muted:     "text-gray-400"
Price Color:    "text-green-700 font-bold"
Badge Organic:  "text-green-600 border-green-600" (outline variant)
Badge Grade:    "bg-gray-100 text-gray-700" (secondary variant)
Error:          "text-red-600"
```

### B.5 Hindi Translations (i18n Keys You Need)

```json
// frontend/src/locales/hi.json (add these)
{
  "marketplace": {
    "title": "बाज़ार",
    "search_placeholder": "फसल खोजें...",
    "filter": "फ़िल्टर",
    "no_results": "कोई परिणाम नहीं मिला"
  },
  "farmer": {
    "dashboard_welcome": "नमस्ते, {{name}}!",
    "total_earnings": "कुल कमाई",
    "active_listings": "सक्रिय सूचियाँ",
    "pending_orders": "लंबित ऑर्डर",
    "add_listing": "नई सूची जोड़ें",
    "demand_advisory": "माँग सलाह",
    "ai_suggests": "AI सुझाव"
  },
  "listing": {
    "price_per_kg": "₹/किलो",
    "available": "उपलब्ध",
    "grade": "ग्रेड",
    "organic": "जैविक",
    "add_to_cart": "कार्ट में जोड़ें",
    "view_details": "विवरण देखें"
  }
}
```

---

*Context version: 1.0 | Sunidhi | Kisan Connect SIH 2026*
