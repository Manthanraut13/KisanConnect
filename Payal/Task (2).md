# TASK.md — Payal
## Frontend: Home + Auth + Cart + Checkout + Payments + Orders + Navbar

---

## ASSIGNED PAGES & COMPONENTS

| # | Page / Component | Route | Priority | Est. Days |
|---|---|---|---|---|
| 1 | Navbar + ProtectedRoute (shared) | — | CRITICAL | 0.5 |
| 2 | Home / Landing Page | `/` | CRITICAL | 1 |
| 3 | Login Page | `/login` | CRITICAL | 0.5 |
| 4 | Register Page | `/register` | CRITICAL | 0.5 |
| 5 | Cart Page | `/cart` | CRITICAL | 1.5 |
| 6 | Checkout Page | `/checkout` | CRITICAL | 1.5 |
| 7 | Order Confirmation Page | `/order-success/:id` | HIGH | 0.5 |
| 8 | Order History Page | `/orders` | HIGH | 1 |
| 9 | Order Detail + Tracking | `/orders/:id` | HIGH | 1 |
| **Total** | | | | **~8 days** |

---

## DEPENDENCIES — WHAT YOU NEED BEFORE STARTING

| What You Need | From Whom | When Available |
|---|---|---|
| `VITE_API_URL` — Omniroute URL | Tukesh | Day 1–2 |
| Auth APIs working (`/api/auth/login`, `/api/auth/register`) | Manthan | Day 2 |
| Cart APIs working (`/api/cart/*`) | Tukesh | Day 4 |
| Order APIs working (`/api/orders/*`) | Tukesh | Day 5 |
| Payment APIs working (`/api/payments/*`) | Tukesh | Day 5–6 |
| Sunidhi's `api.js` and `authStore.js` files | Sunidhi | Day 1 (she creates these) |

**Important:** While APIs are not ready, use mock data in your components. Never stop working just because an API is not ready yet. Keep building the UI.

---

## IMPORTANT: SHARED SETUP

The frontend project is already initialized by Sunidhi on Day 1. You do NOT create a new project. You work in the SAME `kisan-connect/frontend/` folder.

**Your files go here:**
```
frontend/src/
├── pages/
│   ├── Home.jsx                    ← YOU BUILD
│   ├── Login.jsx                   ← YOU BUILD
│   ├── Register.jsx                ← YOU BUILD
│   ├── Cart.jsx                    ← YOU BUILD
│   ├── Checkout.jsx                ← YOU BUILD
│   ├── OrderSuccess.jsx            ← YOU BUILD
│   └── consumer/
│       ├── OrderHistory.jsx        ← YOU BUILD
│       └── OrderDetail.jsx         ← YOU BUILD
├── components/
│   └── common/
│       ├── Navbar.jsx              ← YOU BUILD (shared with whole team)
│       └── ProtectedRoute.jsx      ← YOU BUILD (shared)
├── stores/
│   ├── authStore.js                (Sunidhi builds this — you USE it)
│   └── cartStore.js                ← YOU BUILD
└── services/
    ├── api.js                      (Sunidhi builds this — you USE it)
    ├── auth.service.js             ← YOU BUILD
    ├── cart.service.js             ← YOU BUILD
    ├── order.service.js            ← YOU BUILD
    └── payment.service.js          ← YOU BUILD
```

---

## MODULE 1 — NAVBAR + PROTECTEDROUTE + CART STORE

### 1.1 Cart Store

```
OpenCode Prompt:
"Generate Zustand store /frontend/src/stores/cartStore.js.
State: items (array, default []), itemCount (number, default 0), subtotal (number, default 0).
Actions:
- setCart(items: array): set items, compute itemCount = items.length,
  compute subtotal = items.reduce((sum,i) => sum + (i.quantity_kg * i.price_per_kg), 0).
- clearCart(): reset all to empty/0.
Import create from 'zustand'. Export default."
```

### 1.2 Auth Service

```
OpenCode Prompt:
"Generate /frontend/src/services/auth.service.js.
Import api from './api'.
Export authService object with:
- login: (mobile, password) => api.post('/api/auth/login', { mobile, password })
- register: (data) => api.post('/api/auth/register', data)
- getProfile: () => api.get('/api/users/me')
- logout: () => api.post('/api/auth/logout')"
```

### 1.3 Cart Service

```
OpenCode Prompt:
"Generate /frontend/src/services/cart.service.js.
Import api from './api'.
Export cartService object with:
- getCart: () => api.get('/api/cart')
- addItem: (listingId, quantityKg) => api.post('/api/cart/add', { listingId, quantityKg })
- updateItem: (itemId, quantityKg) => api.put('/api/cart/items/' + itemId, { quantity_kg: quantityKg })
- removeItem: (itemId) => api.delete('/api/cart/items/' + itemId)
- clearCart: () => api.delete('/api/cart/clear')
- getSummary: () => api.get('/api/cart/summary')"
```

### 1.4 Order + Payment Services

```
OpenCode Prompt:
"Generate /frontend/src/services/order.service.js.
Import api from './api'.
Export orderService with:
- placeOrder: (deliveryAddress, deliverySlot) => api.post('/api/orders', { delivery_address: deliveryAddress, delivery_slot: deliverySlot })
- getOrders: () => api.get('/api/orders')
- getOrderById: (id) => api.get('/api/orders/' + id)"

"Generate /frontend/src/services/payment.service.js.
Import api from './api'.
Export paymentService with:
- createRazorpayOrder: (orderId) => api.post('/api/payments/create-order', { order_id: orderId })
- verifyPayment: (data) => api.post('/api/payments/verify', data)"
```

### 1.5 Navbar Component

```
OpenCode Prompt:
"Generate React component /frontend/src/components/common/Navbar.jsx.
Import: useNavigate and Link from react-router-dom, useAuthStore from stores/authStore,
useCartStore from stores/cartStore, lucide-react icons (ShoppingCart, User, LogOut, Menu).

Display:
- Left: Logo text 'Kisan Connect' in green-700 font-bold, clicking navigates to '/'.
- Center (desktop only): Nav links — 'Home' (→/), 'Marketplace' (→/marketplace).
- Right:
  - Language toggle button: text 'EN/HI' — clicking toggles i18n language between 'en' and 'hi'.
  - Cart icon with red badge showing cartStore.itemCount (only if itemCount > 0). Clicking → /cart.
  - If NOT authenticated: 'Login' button → /login.
  - If authenticated: User avatar circle (first letter of user.full_name, green background).
    On click: dropdown showing 'My Orders' (→/orders), 'Logout' (calls authStore.logout then navigate to /).
- Mobile: Hamburger icon that toggles a mobile menu showing the nav links and login/cart.
Use: Tailwind CSS. bg-white border-b border-gray-200. sticky top-0 z-50.
Export default."
```

### 1.6 ProtectedRoute Component

```jsx
// /frontend/src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

/**
 * ProtectedRoute — Blocks pages from unauthenticated users.
 * roles: optional array of allowed roles. If empty, any authenticated user can access.
 */
const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
```

---

## MODULE 2 — HOME / LANDING PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/Home.jsx — a beautiful landing page for Kisan Connect.

SECTION 1 — Hero:
- Full-width banner with a dark green gradient background (from-green-900 to-green-700).
- Centered text: 'खेत से घर तक' in white, font-bold, text-4xl, font class 'font-hindi'.
  Below: 'Kisan Connect' in white text-2xl.
  Below: 'Buy fresh produce directly from farmers. No middlemen. Better prices.' in green-200 text-lg.
- Two buttons: 'Shop Now' (bg-white text-green-800, → /marketplace) and 'For Farmers' (border border-white text-white, → /register).
- Section min-height: 60vh.

SECTION 2 — How It Works (3 steps):
- Title: 'How It Works' centered.
- 3 cards in a row (flex on desktop, stacked on mobile), each with:
  Card 1: Sprout icon — 'Farmer Lists Produce' — 'Farmers list fresh produce with AI-recommended pricing.'
  Card 2: ShoppingBag icon — 'You Order Directly' — 'Browse and order from verified farmers near you.'
  Card 3: Truck icon — 'Fresh Delivery' — 'Optimized delivery straight from the farm to your door.'
- Cards: white bg, rounded-xl, shadow-sm, p-6.

SECTION 3 — Benefits (4 cards):
Title: 'Why Kisan Connect?'
4 cards: 
  1. TrendingDown icon — 'Better Prices' — 'Up to 30% cheaper than supermarkets.'
  2. Leaf icon — 'Fresher Produce' — 'Harvested and delivered within 24-48 hours.'
  3. Heart icon — 'Support Farmers' — 'Farmers earn 2-3x more than through middlemen.'
  4. QrCode icon — 'Full Traceability' — 'Know exactly which farm your food comes from.'

SECTION 4 — Featured Categories:
Title: 'Shop by Category'
6 category cards in a responsive grid (2 cols mobile, 3 cols desktop):
  Each card: emoji + category name + 'Browse →'
  Categories: 🍅 Vegetables (→/marketplace?crop_category=Vegetable),
  🍎 Fruits (→/marketplace?crop_category=Fruit),
  🌾 Grains (→/marketplace?crop_category=Grain),
  🌶 Spices (→/marketplace?crop_category=Spice),
  🥬 Organic (→/marketplace?is_organic=true),
  🧅 Fresh Arrivals (→/marketplace?sort=newest).

SECTION 5 — Footer:
Dark green (bg-green-900) footer.
Left: 'Kisan Connect' logo + 'Direct from Farm to Your Table'.
Center: Links — Home, Marketplace, For Farmers.
Right: '© 2026 Kisan Connect | SIH2026 Project'.
Use lucide-react icons. Tailwind CSS throughout. Export default."
```

---

## MODULE 3 — LOGIN PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/Login.jsx.
State: loading (bool), error (string).
Use react-hook-form + zod:
  Schema: { mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
            password: z.string().min(8, 'Password must be at least 8 characters') }

Layout: centered card (max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-lg).
- Logo: '🌾 Kisan Connect' text centered at top.
- 'Welcome Back' heading.
- Mobile Number input (type=tel, placeholder='10-digit mobile number').
- Password input (type=password) with show/hide toggle eye icon.
- Error message box (red bg, red text) shown if error state is set.
- 'Login' button (full width, bg-green-700, loading spinner when loading=true).
- 'Don't have an account? Register' link → /register.

On submit:
1. Set loading=true.
2. Call authService.login(mobile, password).
3. On success: response.data contains { user, access_token }.
   Call useAuthStore.getState().setAuth(user, access_token).
   navigate to '/marketplace'.
4. On error: set error to response.message or 'Login failed. Please try again.'
5. Set loading=false.
Import authService from services/auth.service. Import useAuthStore from stores/authStore.
Use sonner toast for success. Export default."
```

---

## MODULE 4 — REGISTER PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/Register.jsx.
Use react-hook-form + zod:
  Schema: {
    full_name: z.string().min(2),
    mobile: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().min(8),
    confirm_password: z.string(),
    role: z.enum(['consumer', 'farmer', 'bulk_buyer'])
  }.refine(d => d.password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })

Layout: centered card (max-w-md mx-auto mt-8 p-8 bg-white rounded-2xl shadow-lg).
- '🌾 Kisan Connect' logo.
- 'Create Account' heading.
- Role selection: 3 styled radio cards (not plain radio buttons):
  Consumer card: ShoppingBag icon + 'I want to buy' — selected state: border-green-600 bg-green-50.
  Farmer card: Sprout icon + 'I want to sell' — same selected style.
  Bulk Buyer card: Package icon + 'I buy in bulk'.
- Full Name input.
- Mobile Number input.
- Email input (optional).
- Password input (with strength indicator: weak/medium/strong bar).
- Confirm Password input.
- Terms checkbox: 'I agree to the Terms of Service'.
- Register button (full width, green).
- 'Already have an account? Login' link.

On submit: call authService.register({ full_name, mobile, email, password, role }).
On success: auto-login (call authStore.setAuth), navigate to /marketplace.
On error: show error toast.
Export default."
```

---

## MODULE 5 — CART PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/Cart.jsx.
On mount: call cartService.getCart(). Store in cartStore via cartStore.setCart(items).
Also call cartService.getSummary() and store summary state locally.

Layout: Two-column on desktop (lg:grid lg:grid-cols-3), stacked on mobile.
Left column (lg:col-span-2): Cart Items List.
Right column (lg:col-span-1): Order Summary sticky card.

EMPTY STATE: If items is empty array: centered illustration (ShoppingCart icon, large, gray),
  text 'Your cart is empty', 'Browse Marketplace' button → /marketplace.

CART ITEMS LIST:
Each item row (white card, rounded-xl, shadow-sm, mb-3, p-4, flex):
- Left: crop image (60px square, rounded-lg, object-cover). If no image: green placeholder.
- Middle: crop_name bold, farmer_name text-sm text-gray-500, ₹{price_per_kg}/kg text-sm.
- Right: Quantity controls (− button, quantity number input, + button) + item total (₹{qty * price}).
  Below: Trash2 icon button (text-red-400, onClick: removeItem then refresh cart).
Quantity −/+ buttons: call cartService.updateItem(item.id, newQty). Update cartStore after.
Remove button: call cartService.removeItem(item.id). Update cartStore after.
Show error toast if any API call fails.

ORDER SUMMARY CARD (shadcn Card, sticky top-24):
Title: 'Order Summary'.
Row: 'Subtotal' — '₹{subtotal}'.
Row: 'Delivery' — '₹30'.
Divider line.
Row: 'Total' font-bold — '₹{subtotal + 30}'.
Note: text-xs text-gray-400 '0% GST on fresh produce'.
'Proceed to Checkout' button (full width, bg-green-700) → navigate to /checkout.
Export default."
```

---

## MODULE 6 — CHECKOUT PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/Checkout.jsx.
On mount: load cart summary from cartService.getSummary(). Load user profile from authService.getProfile().
State: loading (bool), paymentLoading (bool), orderId (null).

Layout: Two-column on desktop, stacked on mobile.
Left: Delivery Details Form (react-hook-form + zod).
Right: Order Summary + Pay button.

DELIVERY FORM:
Fields:
- full_name: pre-filled from user.full_name. String required.
- mobile: pre-filled from user.mobile. String required.
- full_address: textarea, required, min 10 chars.
- district: select dropdown with these options: Nashik, Pune, Amritsar, Ludhiana, Coimbatore, Mysuru, Guntur, Jaipur, Indore, Varanasi.
- state: text input, auto-filled when district changes (Nashik→Maharashtra, Pune→Maharashtra, Amritsar→Punjab, Ludhiana→Punjab, Coimbatore→Tamil Nadu, Mysuru→Karnataka, Guntur→Andhra Pradesh, Jaipur→Rajasthan, Indore→Madhya Pradesh, Varanasi→Uttar Pradesh). Readonly.
- pin_code: 6-digit number input, required.
- delivery_slot: date input, min = tomorrow's date. Required.
- notes: textarea optional.

ORDER SUMMARY (right column, shadcn Card, sticky):
Show items list compactly (name + qty + price per line).
Subtotal, Delivery ₹30, Total.
'Pay ₹{total}' button (full width, bg-green-700, disabled while paymentLoading).

PAYMENT FLOW on Pay button click:
Step 1: Validate form (form.trigger()). If invalid: show errors, stop.
Step 2: Set paymentLoading = true.
Step 3: Call orderService.placeOrder(deliveryAddress, deliverySlot) → get { data: { id: orderId } }.
Step 4: Call paymentService.createRazorpayOrder(orderId) → get { razorpay_order_id, amount, key_id }.
Step 5: Load Razorpay script (use loadRazorpay helper below). Open Razorpay checkout modal:
  new window.Razorpay({
    key: key_id,
    amount: amount,
    currency: 'INR',
    name: 'Kisan Connect',
    description: 'Fresh Produce Order',
    order_id: razorpay_order_id,
    handler: async (response) => {
      await paymentService.verifyPayment({ ...response, order_id: orderId });
      navigate('/order-success/' + orderId);
    },
    prefill: { name: user.full_name, contact: user.mobile },
    theme: { color: '#2D7A2D' }
  }).open();
Step 6: In case of error at any step: toast.error(error.message). Set paymentLoading=false.

loadRazorpay helper function:
const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});
Export default."
```

---

## MODULE 7 — ORDER CONFIRMATION PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/OrderSuccess.jsx.
Use useParams to get orderId. On mount: call orderService.getOrderById(orderId). Store as order.
Show loading spinner while loading.

Display:
- Centered layout (max-w-lg mx-auto py-16 text-center).
- Large animated green checkmark: CheckCircle2 icon from lucide-react, size 80, text-green-500,
  with CSS animation: scale from 0 to 1 using Tailwind animate-bounce once (use useEffect to remove after 1s).
- Heading: 'Order Placed Successfully!' text-3xl font-bold text-gray-900.
- Sub: 'Your order #{orderId.slice(0,8).toUpperCase()} has been confirmed.' text-gray-500.
- White card (shadow-lg rounded-xl p-6 mt-8 text-left):
  - 'Items Ordered' section: map over order.items: each shows crop_name + quantity_kg + ₹total_price.
  - Divider.
  - Row: 'Total Paid' + '₹{order.total_amount}' font-bold.
  - Row: 'Estimated Delivery' + date formatted as day + 2 days from today.
  - Row: 'Delivery to' + order.delivery_address.district + ', ' + order.delivery_address.state.
- Two buttons:
  'Track Order' (bg-green-700 text-white, → /orders/{orderId}).
  'Continue Shopping' (border border-green-700 text-green-700, → /marketplace).
Clear cartStore on mount (cartStore.getState().clearCart()).
Export default."
```

---

## MODULE 8 — ORDER HISTORY PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/consumer/OrderHistory.jsx.
On mount: call orderService.getOrders(). Store as orders array.
Show loading spinner while fetching.

Display:
- Heading: 'My Orders' text-2xl font-bold.
- If orders empty: ShoppingBag icon + 'No orders yet' + 'Start Shopping' button → /marketplace.
- If orders exist: list of order cards (not a table — cards work better on mobile).
  Each card (white, rounded-xl, shadow-sm, p-4, mb-4):
  - Top row: 'Order #{id.slice(0,8).toUpperCase()}' font-semibold + status badge (right-aligned).
  - Status badge colors: pending=yellow, confirmed=blue, packed=purple, in_transit=orange, delivered=green, cancelled=red.
    (Use className: 'px-2 py-1 rounded-full text-xs font-medium ' + statusColor)
  - Middle: items summary (e.g., 'Tomato, Onion, Potato').
  - Bottom row: date (formatted as '26 Aug 2026') text-sm text-gray-500 + '₹{total_amount}' font-bold + 'View Details' button → /orders/{id}.
Export default."
```

---

## MODULE 9 — ORDER DETAIL + TRACKING PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/consumer/OrderDetail.jsx.
Use useParams for id. On mount: call orderService.getOrderById(id). Store as order.
Show loading spinner while fetching.

Layout: max-w-2xl mx-auto py-8.

SECTION 1 — Status Timeline:
Steps: ['Order Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered']
Statuses that map to steps: pending→1, confirmed→2, packed→3, in_transit→4, delivered→5, cancelled→0.
Show a horizontal step bar: each step is a circle with a number.
Completed steps: filled green circle, green connector line.
Current step: pulsing green circle (animate-pulse).
Future steps: gray circle, gray connector.
Below steps: current status label in green font.

SECTION 2 — Order Info Card (white, rounded-xl, shadow, p-6, mt-6):
- 'Order ID: #{id.slice(0,8).toUpperCase()}'
- 'Placed on: {formatted date}'
- 'Payment: Paid via Razorpay'
- 'Total: ₹{total_amount} font-bold'

SECTION 3 — Items (white card, p-6, mt-4):
Title: 'Items Ordered'.
Each item: thumbnail image (if available) + crop_name + '{quantity_kg}kg @ ₹{price_per_kg}/kg = ₹{total_price}'.
Divider then 'Subtotal: ₹{subtotal}', 'Delivery: ₹{delivery_charge}', 'Total: ₹{total_amount} font-bold'.

SECTION 4 — Delivery Address (white card, p-6, mt-4):
Title: 'Delivery Address'.
Show: order.delivery_address.full_address, district, state, pin_code.
Show: estimated delivery date (order.createdAt + 2 days).

SECTION 5 — Invoice (if order.invoice_url):
'Download Invoice' button → opens invoice_url in new tab.

Back button: '← Back to Orders' → /orders.
Export default."
```

---

## ROUTES TO ADD IN App.jsx

After building each page, add these routes to `src/App.jsx`. Ask Sunidhi to add them since she owns App.jsx, or add them yourself:

```jsx
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/consumer/OrderHistory';
import OrderDetail from './pages/consumer/OrderDetail';
import ProtectedRoute from './components/common/ProtectedRoute';

// In Routes:
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />

<Route element={<ProtectedRoute />}>
  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />
  <Route path="/order-success/:id" element={<OrderSuccess />} />
  <Route path="/orders" element={<OrderHistory />} />
  <Route path="/orders/:id" element={<OrderDetail />} />
</Route>
```

---

## DELIVERABLES CHECKLIST

By Day 2 (Sunidhi needs Navbar to integrate into App.jsx):
- [ ] Navbar component complete and tested
- [ ] ProtectedRoute component complete
- [ ] Auth service + cart service files created

By Day 5 (Tukesh needs to verify payment flow):
- [ ] Login/Register pages working with real API
- [ ] Cart page loads and updates correctly
- [ ] Checkout page submits order and opens Razorpay modal

By Day 7:
- [ ] Full order flow working end-to-end (browse → cart → checkout → pay → confirmation → tracking)
- [ ] All pages mobile-responsive
- [ ] All pages connected to real APIs

---

*Task version: 1.0 | Payal | Kisan Connect SIH 2026*
