# TASK.md — Sunidhi
## Frontend: Marketplace Browse UI + Farmer Dashboard + Create Listing

---

## ASSIGNED PAGES & COMPONENTS

| # | Page / Component | Route | Priority | Est. Days |
|---|---|---|---|---|
| 1 | Frontend Project Setup | — | CRITICAL | 0.5 |
| 2 | ProductCard + ProductGrid | — | CRITICAL | 1 |
| 3 | FilterSidebar | — | HIGH | 0.5 |
| 4 | Marketplace Page | `/marketplace` | CRITICAL | 1 |
| 5 | Product Detail Page | `/marketplace/:id` | HIGH | 1 |
| 6 | Farmer Dashboard | `/farmer/dashboard` | CRITICAL | 1.5 |
| 7 | My Listings Page | `/farmer/listings` | HIGH | 1 |
| 8 | Create Listing Form | `/farmer/listings/new` | CRITICAL | 1.5 |
| 9 | Demand Advisory Page | `/farmer/advisory` | MEDIUM | 1 |
| **Total** | | | | **~9 days** |

---

## DEPENDENCIES — GET BEFORE YOU START

You need these from the team before your frontend can fully function:

| What | From Whom | When |
|---|---|---|
| `VITE_API_URL` (Omniroute URL) | Tukesh | Day 1–2 |
| Auth APIs working (`/api/auth/login`, `/api/users/me`) | Manthan | Day 2 |
| Listing APIs working (`GET /api/listings`, `POST /api/listings`) | Tukesh | Day 3–4 |
| AI price endpoint (`POST /ai/price/recommend`) | Siddhesh | Day 3–4 |
| AI forecast endpoint (`POST /ai/forecast/demand`) | Siddhesh | Day 4–5 |

**While waiting:** You can still build components with mock data (hardcoded sample listing objects). Then swap for real API calls once APIs are ready.

---

## MODULE 1 — FRONTEND PROJECT SETUP

### 1.1 Initialize Vite + React Project

```bash
cd kisan-connect
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom zustand axios react-hook-form zod @hookform/resolvers
npm install recharts react-leaflet leaflet
npm install react-i18next i18next
npm install react-dropzone qrcode.react sonner day.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Install shadcn/ui:
```bash
npx shadcn-ui@latest init
# Choose: TypeScript: No, Style: default, Base color: Slate, CSS variables: Yes
# Add components as needed:
npx shadcn-ui@latest add button card badge input select table dialog toast
```

### 1.2 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### 1.3 `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4 Create `.env` File

```
VITE_API_URL=http://localhost:5000      # Replace with Omniroute URL from Tukesh
VITE_APP_NAME=Kisan Connect
```

### 1.5 Create API Service Base

```javascript
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response.data,  // Unwrap: { success, data } → return the full object
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kc_access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### 1.6 Create Listing + AI Services

```javascript
// src/services/listing.service.js
import api from './api';

export const listingService = {
  getAll: (params) => api.get('/api/listings', { params }),
  getById: (id) => api.get(`/api/listings/${id}`),
  create: (formData) => api.post('/api/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/listings/${id}`, data),
  delete: (id) => api.delete(`/api/listings/${id}`),
  getMyListings: (params) => api.get('/api/listings/farmer/mine', { params }),
  search: (query) => api.get('/api/listings/search', { params: { q: query } }),
};

// src/services/ai.service.js
import api from './api';

export const aiService = {
  getDemandForecast: (cropName, district, days = 7) =>
    api.post('/ai/forecast/demand', { crop_name: cropName, district, forecast_days: days }),
  
  getPriceRecommendation: (data) =>
    api.post('/ai/price/recommend', data),
  
  chatWithBot: (message, language, userRole, history) =>
    api.post('/ai/chatbot/query', {
      message, language, user_role: userRole, conversation_history: history
    }),
};
```

---

## MODULE 2 — PRODUCT CARD + GRID

### ProductCard Component

Use this OpenCode prompt:
```
"Generate React component /frontend/src/components/marketplace/ProductCard.jsx.
Props: { id, crop_name, images, price_per_kg, available_kg, farmer_name, district, is_organic, quality_grade }
Display:
- Image: first item of images array or '/placeholder-crop.jpg'. Aspect square, object-cover.
- Top badges: if is_organic show green 'Organic' badge. Quality grade badge.
- Crop name: font-semibold text-lg.
- Price: ₹{price_per_kg}/kg — text-2xl font-bold text-green-700.
- Available: {available_kg}kg available • {district} — text-sm text-gray-500.
- Farmer name: by {farmer_name} — text-xs text-gray-400.
- 'View Details' button: full width, bg-green-700, on click navigate to /marketplace/{id}.
Use: react-router-dom useNavigate, shadcn/ui Badge and Button, Tailwind CSS.
Wrap in: bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow.
Export default."
```

### ProductGrid Component

```
"Generate React component /frontend/src/components/marketplace/ProductGrid.jsx.
Props: { listings: Array, loading: boolean }
If loading: show a 3x4 grid of skeleton placeholder cards (animate-pulse gray rectangles).
If listings is empty: show centered message with a leaf emoji and 'No listings found'.
Else: show responsive grid (grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4)
of ProductCard components. Import ProductCard from './ProductCard'.
Export default."
```

---

## MODULE 3 — FILTER SIDEBAR

```
"Generate React component /frontend/src/components/marketplace/FilterSidebar.jsx.
Props: { filters: Object, onFilterChange: Function }
Sections:
1. Category checkboxes: Vegetable, Fruit, Grain, Spice, Other. When checked: call onFilterChange({...filters, crop_category: selectedCategories.join(',')}).
2. Quality Grade checkboxes: A, B, C.
3. Organic toggle: switch input. onFilterChange({...filters, is_organic: true/false}).
4. Price range: two number inputs for min_price and max_price in ₹/kg.
5. 'Clear Filters' button: resets all to default.
Use Tailwind CSS. On mobile: the sidebar should be collapsible (show/hide button).
Export default."
```

---

## MODULE 4 — MARKETPLACE PAGE

```
"Generate React page /frontend/src/pages/Marketplace.jsx.
State: filters(object), listings(array), loading(bool), page(number 1), totalPages(number), searchQuery(string).
On mount and when filters/page change: call listingService.getAll({ ...filters, page, limit: 12, search: searchQuery }).
On search input change (with 500ms debounce): update searchQuery and reset page to 1.
Layout: 
- Full-width top bar with search input and result count text.
- Below: two-column layout on desktop (1/4 sidebar, 3/4 main). On mobile: sidebar hidden by default with 'Filter' button to show.
- Left: FilterSidebar with filters state and onFilterChange handler.
- Right: ProductGrid with listings and loading. Below ProductGrid: simple pagination buttons (Previous / Page X of Y / Next).
Import: listingService from services/listing.service, FilterSidebar, ProductGrid.
Use Tailwind CSS. Export default."
```

---

## MODULE 5 — PRODUCT DETAIL PAGE

Use OpenCode:
```
"Generate React page /frontend/src/pages/ProductDetail.jsx.
Use: useParams to get id. On mount: call listingService.getById(id).
Show loading spinner while fetching.
Layout:
- Left column (60%): Image gallery. Main image big. Below: row of thumbnail images. Click thumbnail to change main image.
- Right column (40%):
  - Crop name (text-3xl font-bold) + Quality badge + Organic badge.
  - Price: ₹{price_per_kg}/kg (text-4xl font-bold text-green-700).
  - Available: {available_kg}kg available.
  - If ai_suggested_price: show info box 'AI Suggests: ₹{ai_suggested_price}/kg' with info icon.
  - Harvest date. Expiry date.
  - 'Add to Cart' button (big, green) — calls POST /api/cart/add with { listingId: id, quantityKg: selectedQty }.
  - Quantity selector (number input, min=listing.min_order_kg, max=listing.available_kg).
  
Below the two columns:
- Farmer card: name, village, district, rating stars.
- Origin map: react-leaflet MapContainer at farmer's lat/lng with a marker.
- Traceability: lot_number text. QR code image from qr_code_url.
Export default."
```

---

## MODULE 6 — FARMER DASHBOARD

```
"Generate React page /frontend/src/pages/farmer/FarmerDashboard.jsx.
On mount:
1. GET /api/users/me → set farmerData.
2. GET /api/listings/farmer/mine?limit=1 → get primaryCrop = listings[0].crop_name.
3. POST /ai/forecast/demand { crop_name: primaryCrop, district: farmerData.farmerProfile.district, forecast_days: 7 } → set forecastData.
4. GET /api/orders?limit=3 → set recentOrders.

Display:
- Header: 'नमस्ते, {full_name}! 🌾' — font-hindi text-2xl text-green-800.
- Three stat cards (shadcn Card): 
  Card 1: 'कुल कमाई' / Total Earnings → ₹{farmerProfile.total_earnings}
  Card 2: 'सक्रिय सूचियाँ' / Active Listings → count from listings API
  Card 3: 'लंबित ऑर्डर' / Pending Orders → count from orders API
- Recharts section titled '7-Day Demand Forecast':
  LineChart with forecastData.forecast array.
  X-axis: date (formatted as 'Sep 1').
  Y-axis: predicted_price (₹/kg).
  Line: predicted_price. Color: #2D7A2D.
  Tooltip shows: Date, Predicted Price, Range.
  Below chart: advisory text box with forecastData.advisory string.
- Quick Actions: two buttons: 'Add New Listing' (→ /farmer/listings/new), 'View All Orders' (→ /farmer/orders).
- Recent Orders: small table with columns: Order ID (short), Crop, Buyer, Amount, Status badge.
Export default."
```

---

## MODULE 7 — MY LISTINGS PAGE

```
"Generate React page /frontend/src/pages/farmer/MyListings.jsx.
On mount: GET /api/listings/farmer/mine.
Display:
- 'My Listings' heading + 'Add New Listing' button (→ /farmer/listings/new).
- shadcn Table with columns:
  Image (40px thumbnail), Crop Name, Available Kg / Total Kg (e.g., '350 / 500 kg'), 
  Price/kg, Grade badge, Status (Active=green badge / Inactive=gray badge), Actions.
- Actions column: Edit button (→ /farmer/listings/{id}/edit) and Delete button.
- Delete: on click show shadcn Dialog confirmation. On confirm: call DELETE /api/listings/:id. On success: remove from list + show success toast.
- If no listings: show empty state with 'You have no listings yet' + Add button.
Export default."
```

---

## MODULE 8 — CREATE LISTING FORM

```
"Generate React page /frontend/src/pages/farmer/CreateListing.jsx.
Use react-hook-form + zod for validation.
Multi-step form with 3 steps. Show step indicator at top (Step 1/2/3 with circles).

STEP 1 — Crop Details:
Fields: crop_name (text with autocomplete list), crop_category (select), variety (text, optional),
quality_grade (radio: A/B/C), is_organic (toggle), quantity_kg (number), min_order_kg (number, default 1),
price_per_kg (number), harvest_date (date), description (textarea optional).
'Next' button → go to Step 2.

STEP 2 — Photos:
Use react-dropzone for drag-and-drop image upload.
Accept: image/jpeg, image/png, image/webp. Max 5 files, 5MB each.
Show previews of selected images with X button to remove.
'Back' and 'Next' buttons.

STEP 3 — Review + AI Price:
Show summary of Step 1 data.
AI Price Recommendation section:
- On mount of Step 3: call POST /ai/price/recommend with { crop_name, district: farmerProfile.district, quantity_kg, quality_grade, is_organic, harvest_date }.
- Show loading spinner then: info card 'AI Recommends: ₹{min}–₹{max}/kg. Best price: ₹{recommended}/kg'.
- Show small text: 'Based on current {district} mandi prices'.
'Submit Listing' button:
- Create FormData, append all fields and image files.
- POST /api/listings with FormData.
- On success: toast 'Listing created successfully!' + navigate to /farmer/listings.
Export default."
```

---

## MODULE 9 — DEMAND ADVISORY PAGE

```
"Generate React page /frontend/src/pages/farmer/DemandAdvisory.jsx.
State: selectedCrop (default: farmer's primary crop), forecastDays (7 or 30), forecastData.
On selectedCrop or forecastDays change: POST /ai/forecast/demand { crop_name: selectedCrop, district: farmerProfile.district, forecast_days: forecastDays }.
Display:
- Heading: 'Demand & Price Advisory'.
- Controls row: Crop dropdown (20 crop options), Days toggle (7 Day / 30 Day button group).
- Large Recharts AreaChart: 
  X-axis: date. Y-axis: price (₹/kg).
  Area fill for upper_bound to lower_bound (light green, semi-transparent) = confidence band.
  Line: predicted_price. Color: #2D7A2D.
  ResponsiveContainer width='100%' height=350.
- Advisory text box (green border, green background): {forecastData.advisory}.
- Weather card: fetch from Open-Meteo API directly (no backend proxy needed):
  URL: https://api.open-meteo.com/v1/forecast?latitude={district_lat}&longitude={district_lng}&daily=temperature_2m_max,precipitation_sum&forecast_days=1
  Show: 'Today in {district}: {temp}°C, {rain}mm rain expected'.
Export default."
```

---

## DELIVERABLES CHECKLIST

By Day 3 (Tukesh needs to verify his listing API works with your UI):
- [ ] ProductCard renders correctly with mock data
- [ ] Marketplace page shows listings from API (or mock)
- [ ] Frontend project deployed on Vercel (dev URL)

By Day 6:
- [ ] All 6 pages complete and connected to real APIs
- [ ] Create Listing form submits successfully
- [ ] Demand forecast chart shows real data from Siddhesh's AI service
- [ ] Hindi language toggle works on at least 3 pages

By Day 7:
- [ ] Mobile layout verified on 375px viewport
- [ ] All pages tested with real API data

---

*Task version: 1.0 | Sunidhi | Kisan Connect SIH 2026*
