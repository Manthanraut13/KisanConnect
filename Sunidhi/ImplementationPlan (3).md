# IMPLEMENTATION PLAN — Sunidhi
## Day-by-Day Build Guide: Farmer Frontend + Marketplace UI

---

## PRE-START CHECKLIST

- [ ] Clone GitHub repo Manthan creates: `git clone https://github.com/<org>/kisan-connect.git`
- [ ] Install Node.js 20 LTS: https://nodejs.org
- [ ] Install VS Code: https://code.visualstudio.com
- [ ] Install VS Code extensions: ES7 React Snippets, Tailwind CSS IntelliSense, Prettier
- [ ] Get Omniroute URL from Tukesh (for `VITE_API_URL`)
- [ ] Sign up for Vercel: https://vercel.com (for frontend deployment)
- [ ] Sign up for Figma (free): https://figma.com — for quick design reference

---

## DAY 1 — FRONTEND SETUP + PRODUCT CARD

### Step 1: Initialize Project

```bash
cd kisan-connect
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

Install all dependencies (copy from Task.md Module 1.1):
```bash
npm install react-router-dom zustand axios react-hook-form zod @hookform/resolvers recharts react-leaflet leaflet react-i18next i18next react-dropzone qrcode.react sonner day.js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Install shadcn/ui:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge input select table dialog
```

### Step 2: Configure Tailwind

Replace content of `tailwind.config.js` with content from Task.md Module 1.1.

Replace content of `src/index.css` with the @import and @tailwind lines from Task.md Module 1.1.

### Step 3: Create Environment File

```bash
# In frontend/ folder
touch .env
```

Add this content to `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Kisan Connect
```

Note: Replace `http://localhost:5000` with Omniroute URL when Tukesh sends it.

### Step 4: Create API Service

Copy the `src/services/api.js` file from Task.md Module 1.5 exactly.

### Step 5: Create Listing and AI Services

Copy `src/services/listing.service.js` and `src/services/ai.service.js` from Task.md Module 1.6.

### Step 6: Test API Service

```bash
# Start dev server
npm run dev
# Open http://localhost:3000 in browser
# Open browser DevTools (F12) → Console
# Type:
import('./src/services/listing.service.js').then(m => m.listingService.getAll({}).then(console.log).catch(console.error))
# If backend is not ready: it will fail — that is OK. You'll see a network error, meaning the service is set up correctly.
```

### Step 7: Build ProductCard Component

Use OpenCode with the prompt from Task.md Module 2. After generating:
- Review the generated code carefully.
- Test it with mock data by creating a simple test file.

**Mock data to test with (paste in component while testing):**
```javascript
const mockListing = {
  id: "test-1",
  crop_name: "Tomato",
  images: [],
  price_per_kg: 22,
  available_kg: 350,
  farmer_name: "Ramesh Patil",
  district: "Nashik",
  is_organic: true,
  quality_grade: "A"
};
```

### Step 8: Set Up Basic Router

Create `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Marketplace from './pages/Marketplace';
// Import other pages as you build them

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar will go here */}
        <Routes>
          <Route path="/" element={<div className="p-8 text-center text-2xl text-green-700">🌾 Kisan Connect — Coming Soon</div>} />
          <Route path="/marketplace" element={<Marketplace />} />
          {/* Add more routes as you build pages */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

**Commit: `feature/sunidhi/setup-and-productcard`**

---

## DAY 2 — MARKETPLACE PAGE + FILTER SIDEBAR

### Step 1: Build FilterSidebar

Use OpenCode prompt from Task.md Module 3. After generating:
- Test with hardcoded `filters` object: `{ crop_category: '', is_organic: false, min_price: '', max_price: '' }`.
- Verify checkbox selections change the filters object.

### Step 2: Build ProductGrid

Use OpenCode prompt from Task.md Module 2 (ProductGrid). After generating:
- Test loading state: pass `loading={true}` → should show skeleton cards.
- Test empty state: pass `listings={[]}` → should show "No listings found".
- Test with data: pass array of `mockListing` objects → should show ProductCards.

### Step 3: Build Marketplace Page

Use OpenCode prompt from Task.md Module 4.

**Testing with mock data (while API not ready):**

Temporarily hardcode listings in the Marketplace page:
```javascript
const [listings, setListings] = useState([
  { id: "1", crop_name: "Tomato", images: [], price_per_kg: 22, available_kg: 350, farmer_name: "Ramesh Patil", district: "Nashik", is_organic: true, quality_grade: "A" },
  { id: "2", crop_name: "Onion", images: [], price_per_kg: 18, available_kg: 200, farmer_name: "Suresh Sharma", district: "Pune", is_organic: false, quality_grade: "B" },
  // Add 4-6 more items
]);
const [loading, setLoading] = useState(false);
// Comment out the API call temporarily
```

Open `http://localhost:3000/marketplace` — you should see a grid of cards.

### Step 4: Switch to Real API When Tukesh's Backend Is Ready

Replace mock data with real API call:
```javascript
useEffect(() => {
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await listingService.getAll({ ...filters, page, limit: 12 });
      setListings(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };
  fetchListings();
}, [filters, page]);
```

**Commit: `feature/sunidhi/marketplace-page`**

---

## DAY 3 — PRODUCT DETAIL PAGE

### Step 1: Install Leaflet CSS

In `src/main.jsx`, add:
```javascript
import 'leaflet/dist/leaflet.css';
```

Fix Leaflet default marker icon issue (common React issue):
```javascript
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
});
```

### Step 2: Build Product Detail Page

Use OpenCode prompt from Task.md Module 5.

**Test with mock data first:**
```javascript
const mockProduct = {
  id: "test-1",
  crop_name: "Tomato",
  crop_category: "Vegetable",
  images: ["/placeholder-crop.jpg"],
  price_per_kg: 22,
  ai_suggested_price: 20.5,
  available_kg: 350,
  quantity_kg: 500,
  min_order_kg: 5,
  quality_grade: "A",
  is_organic: true,
  harvest_date: "2026-08-20",
  lot_number: "KC-2026-MH-NAS-00012",
  qr_code_url: "",
  district: "Nashik",
  latitude: 20.0059,
  longitude: 73.7797,
  farmerProfile: { village: "Pimpalgaon", rating: 4.5, user: { full_name: "Ramesh Patil" } }
};
```

Verify the map shows at the correct location.

### Step 3: Add Route to App.jsx

```jsx
import ProductDetail from './pages/ProductDetail';
// Add in Routes:
<Route path="/marketplace/:id" element={<ProductDetail />} />
```

Click "View Details" on a ProductCard → should navigate to detail page.

**Commit: `feature/sunidhi/product-detail`**

---

## DAY 4 — FARMER DASHBOARD

### Step 1: Create Zustand Auth Store

Create `src/stores/authStore.js`:
```javascript
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('kc_access_token') || null,
  isAuthenticated: !!localStorage.getItem('kc_access_token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('kc_access_token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('kc_access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
```

### Step 2: Build Farmer Dashboard

Use OpenCode prompt from Task.md Module 6.

**Mock data for forecast while Siddhesh's AI is not ready:**
```javascript
const mockForecast = {
  forecast: [
    { date: "2026-09-01", predicted_price: 22.5, lower_bound: 18.0, upper_bound: 27.0 },
    { date: "2026-09-02", predicted_price: 23.1, lower_bound: 18.5, upper_bound: 27.8 },
    { date: "2026-09-03", predicted_price: 21.8, lower_bound: 17.2, upper_bound: 26.4 },
    { date: "2026-09-04", predicted_price: 24.0, lower_bound: 19.1, upper_bound: 28.9 },
    { date: "2026-09-05", predicted_price: 25.2, lower_bound: 20.0, upper_bound: 30.4 },
    { date: "2026-09-06", predicted_price: 23.8, lower_bound: 18.9, upper_bound: 28.7 },
    { date: "2026-09-07", predicted_price: 22.1, lower_bound: 17.6, upper_bound: 26.6 },
  ],
  advisory: "Tomato prices expected to rise 12% this week in Nashik. Good time to sell.",
};
```

### Step 3: Add Route

```jsx
import FarmerDashboard from './pages/farmer/FarmerDashboard';
// Add with route guard:
<Route path="/farmer/dashboard" element={<FarmerDashboard />} />
```

**Commit: `feature/sunidhi/farmer-dashboard`**

---

## DAY 5 — MY LISTINGS + CREATE LISTING FORM (PART 1)

### Step 1: My Listings Page

Use OpenCode prompt from Task.md Module 7.

Key things to verify:
- Table renders listings from API.
- Delete confirmation dialog appears before deleting.
- After delete: listing disappears from table without page reload.
- "Add New Listing" button navigates correctly.

### Step 2: Create Listing Form — Step 1 and 2

Use OpenCode prompt from Task.md Module 8. This is a big component — generate it in two parts:

**Part 1 prompt (Step 1 of form):**
```
"Generate the Step 1 section of CreateListing form:
Fields with react-hook-form: crop_name (text with datalist autocomplete for 20 common crops),
crop_category (select), variety (optional text), quality_grade (radio A/B/C),
is_organic (checkbox toggle), quantity_kg (number), min_order_kg (number default 1),
price_per_kg (number), harvest_date (date input), description (textarea optional).
Zod validation: crop_name required min 2 chars, quantity_kg positive number, price_per_kg positive,
harvest_date required.
'Next Step' button: calls form.trigger() to validate Step 1 fields before proceeding.
Tailwind styling with green accents."
```

**Part 2 prompt (Step 2 — Image upload):**
```
"Generate Step 2 section of CreateListing form with react-dropzone.
Accept: image/jpeg, image/png, image/webp. Max 5 files, 5MB each.
On drop: add files to local state fileList (max 5).
Show image previews in a flex row of thumbnail-sized squares.
Each preview has X button to remove that image.
Show error if more than 5 files selected.
'Back' button and 'Next Step' button."
```

**Commit: `feature/sunidhi/listing-form-steps-1-2`**

---

## DAY 6 — CREATE LISTING FORM (PART 2) + DEMAND ADVISORY

### Step 1: Create Listing Form — Step 3 (Review + AI Price + Submit)

```
"Generate Step 3 of CreateListing form:
On mount of Step 3: call POST /ai/price/recommend with form data.
Show:
- Summary table of Step 1 inputs.
- AI Price box (green border, bg-green-50):
  While loading: spinner with 'Getting AI price suggestion...'
  After: '💡 AI Suggests: ₹{min}–₹{max}/kg | Best price: ₹{recommended}/kg'
  Sub-text: 'Based on current Nashik mandi prices for Grade A Tomato'
- Submit button.
On Submit:
  Create new FormData().
  Append each form field: formData.append('crop_name', data.crop_name) etc.
  Append each image file: files.forEach(f => formData.append('images', f))
  Call listingService.create(formData).
  Show success toast. Navigate to /farmer/listings."
```

### Step 2: Demand Advisory Page

Use OpenCode prompt from Task.md Module 9. 

Key: Open-Meteo API is called directly (no backend proxy):
```javascript
const getWeather = async (lat, lng) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum&forecast_days=1&timezone=Asia/Kolkata`
  );
  const data = await res.json();
  return {
    temp: data.daily.temperature_2m_max[0],
    rain: data.daily.precipitation_sum[0]
  };
};
```

### Step 3: Connect All Routes

Update `src/App.jsx` with all 6 routes.

### Step 4: Add Hindi Toggle to Navbar

Simple language switch button that calls `i18n.changeLanguage('hi')` or `i18n.changeLanguage('en')`.

**Commit: `feature/sunidhi/complete-farmer-frontend`**

---

## DAY 7 — DEPLOYMENT + MOBILE TEST + POLISH

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# From frontend/ folder
vercel

# Follow prompts:
# - Project name: kisan-connect-frontend
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

Set environment variable in Vercel dashboard:
- `VITE_API_URL` = Omniroute URL from Tukesh

### Step 2: Mobile Layout Testing

Open Chrome DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M) → Set to iPhone SE (375×667).

Check every page:
- [ ] Marketplace: Cards stacked to 1 column on mobile
- [ ] Filter sidebar: Hidden on mobile with toggle button
- [ ] Product Detail: Image full width, info below
- [ ] Farmer Dashboard: Stat cards stacked vertically
- [ ] My Listings: Table scrollable horizontally
- [ ] Create Listing: Form full-width on mobile

### Step 3: Swap All Mock Data for Real API

Go through every `useState` that has hardcoded mock data. Remove the mock data. Ensure the real API call is active. Test each page.

### Step 4: Final Checks

- [ ] No TypeErrors in browser console
- [ ] All images load (or placeholder shows gracefully)
- [ ] Loading spinners appear on all pages during data fetch
- [ ] Error toasts appear when API fails
- [ ] Add to Cart button works (consumer role required — login as consumer to test)
- [ ] Create Listing form submits successfully and new listing appears in My Listings

---

## COMMIT SCHEDULE

| Day | Branch | Commit |
|---|---|---|
| Day 1 | `feature/sunidhi/setup-and-productcard` | Vite setup + ProductCard + API service |
| Day 2 | `feature/sunidhi/marketplace-page` | FilterSidebar + ProductGrid + Marketplace |
| Day 3 | `feature/sunidhi/product-detail` | Product Detail page with map + QR |
| Day 4 | `feature/sunidhi/farmer-dashboard` | Farmer Dashboard with forecast chart |
| Day 5 | `feature/sunidhi/listing-form-steps-1-2` | My Listings + Create Listing Steps 1–2 |
| Day 6 | `feature/sunidhi/complete-farmer-frontend` | Create Listing Step 3 + Demand Advisory |
| Day 7 | `dev` | Deployed to Vercel + mobile tested + PR merged |

---

*Implementation Plan v1.0 | Sunidhi | Kisan Connect SIH 2026*
