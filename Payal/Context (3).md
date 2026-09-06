# CONTEXT.md — Payal
## Full Project Context + Consumer Frontend Context

---

## PART A — FULL PROJECT CONTEXT

### What We Are Building
Kisan Connect is a digital marketplace where Indian farmers sell produce directly to consumers — no middlemen. Indian farmers currently earn only 15–30% of consumer prices because of 10+ layers of middlemen. This platform removes them.

### The Prototype Must Show (for SIH Demo)
1. Farmer creates produce listing with AI-suggested price.
2. **Consumer browses, adds to cart, pays via Razorpay (test), gets order confirmation.** ← YOUR WORK
3. AI demand forecast chart for farmers.
4. Route optimization map for delivery drivers.
5. Chatbot that responds in Hindi and English.
6. Admin dashboard.

### Your Part in the Demo
When SIH judges see the consumer journey, they will:
1. Open the Home page you build.
2. Click "Shop Now" → go to Marketplace (Sunidhi's page).
3. Click "Add to Cart" on a product → go to your Cart page.
4. Click "Checkout" → fill address → pay via Razorpay test → see your Order Confirmation page.
5. Navigate to Order History → see the order with a tracking status.

This flow must work end-to-end without errors.

### Tech Stack (What You Use)
- **React.js + Vite** — Framework for building UI
- **Tailwind CSS** — Styling with utility classes
- **shadcn/ui** — Ready-made components (Button, Card, Input, Badge, etc.)
- **Axios** — For calling APIs
- **Zustand** — Global state management (cart state, auth state)
- **React Router v6** — For navigating between pages
- **react-hook-form + Zod** — For form validation (address form, login form)
- **Lucide React** — Icons
- **sonner** — Toast notifications (success/error messages)

### Full Team
| Member | Module | How they relate to you |
|---|---|---|
| Manthan | Backend Auth | Your Login/Register pages call his APIs |
| Siddhesh | AI Service | You don't call AI service directly |
| Tukesh | Marketplace Backend | Your Cart/Order/Payment pages call his APIs. He gives you `VITE_API_URL` |
| Sunidhi | Farmer Dashboard + Marketplace | Her "Add to Cart" button writes to cart — your Cart page reads it |
| **Payal (you)** | Consumer Cart + Checkout + Orders | — |
| Pratham | Admin + Chatbot + Driver | He builds the chatbot widget — you don't overlap |

---

## PART B — PAYAL'S SPECIFIC CONTEXT

### B.1 Pages You Build — What Each Page Does

#### Page 1: Home / Landing Page (`/`)
This is the very first page a visitor sees. It must look professional and exciting.

Sections:
- **Hero Section**: Big image/banner background (use a free image from Unsplash of a farmer or market). Text: "Khet Se Ghar Tak" (खेत से घर तक). Subtitle: "Buy fresh produce directly from farmers. No middlemen. Better prices." Two CTA buttons: "Shop Now" (→ /marketplace) and "For Farmers" (→ /register?role=farmer).
- **How It Works Section**: 3 steps with icons: 1. Farmer lists produce → 2. You order directly → 3. Fresh delivery at your door.
- **Why Kisan Connect Section**: 4 benefit cards: Better prices, Fresher produce, Supporting farmers, Traceability.
- **Featured Crops Section**: Row of 6 crop category cards (Vegetables, Fruits, Grains, Spices, etc.) — each is a clickable card that goes to `/marketplace?crop_category=Vegetable` etc.
- **Footer**: App name, "About", "Contact", "For Farmers" links.

No API calls on this page — it is fully static.

#### Page 2: Login Page (`/login`)
A centered form with:
- Kisan Connect logo at top.
- "Mobile Number" input + "Password" input.
- "Login" button.
- "Don't have an account? Register" link.
- "Continue with Google" button (optional — only if Google OAuth is set up by Manthan).
- Error message shown if credentials are wrong (e.g., "Invalid mobile or password").

**API call:** `POST /api/auth/login` with `{ mobile, password }`. On success: save token to localStorage and Zustand store, redirect to `/marketplace`.

#### Page 3: Register Page (`/register`)
A centered form with:
- Full Name, Mobile Number, Email (optional), Password, Confirm Password inputs.
- Role selection: "I am a Consumer" / "I am a Farmer" / "I am a Bulk Buyer" (radio buttons or tabs).
- Register button.
- Terms of service checkbox.
- "Already have an account? Login" link.

**API call:** `POST /api/auth/register`. On success: auto-login (save token), redirect to `/marketplace`.

#### Page 4: Cart Page (`/cart`)
Shows everything the consumer has added to their cart.

Sections:
- **Cart Items List**: Each item shows crop image, name, farmer name, price/kg, quantity (editable), item total.
  - "+" and "−" buttons to change quantity.
  - Trash icon to remove item.
- **Order Summary Card** (right side on desktop, below on mobile):
  - Subtotal: ₹{subtotal}
  - Delivery: ₹30
  - Total: ₹{total}
  - "Proceed to Checkout" button → `/checkout`
- **Empty Cart State**: If cart is empty, show a friendly message with a "Browse Marketplace" button.

**API calls:**
- `GET /api/cart` — Load cart items on page mount.
- `PUT /api/cart/items/:itemId` — When quantity changes.
- `DELETE /api/cart/items/:itemId` — When item is removed.

#### Page 5: Checkout Page (`/checkout`)
Where the consumer enters delivery address and pays.

Two sections side by side (desktop) / stacked (mobile):

**Left: Delivery Details Form**
- Full Name (pre-filled from auth user)
- Mobile Number (pre-filled)
- Full Address (textarea)
- District (dropdown — 10 supported districts)
- State (auto-filled based on district)
- PIN Code (6-digit number)
- Delivery Slot (date picker — tomorrow or later)
- Order Notes (optional textarea)

**Right: Order Summary**
- List of cart items (compact view)
- Subtotal, Delivery, Total
- "Pay ₹{total}" button — this triggers the Razorpay payment modal

**Razorpay Payment Flow:**
1. User clicks "Pay ₹{total}".
2. Frontend calls `POST /api/payments/create-order` → receives `{ razorpay_order_id, amount, key_id }`.
3. Frontend opens Razorpay checkout modal using the Razorpay JS SDK.
4. User pays using test card: `4111 1111 1111 1111` CVV `123`.
5. Razorpay calls `onSuccess` with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`.
6. Frontend calls `POST /api/payments/verify` with those details + `order_id`.
7. On success: navigate to `/order-success/:orderId`.

**How to load Razorpay script in React:**
```javascript
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

**API calls:**
- `POST /api/orders` — Place order first, get `order_id`.
- `POST /api/payments/create-order` with `{ order_id }` — Get Razorpay order ID.
- `POST /api/payments/verify` — After payment.

#### Page 6: Order Confirmation (`/order-success/:id`)
A success screen shown after payment.

Shows:
- Big green checkmark icon.
- "Order Placed Successfully!" heading.
- Order ID (short version, e.g., first 8 chars).
- List of ordered items.
- Total amount paid.
- "Delivery by: {estimated date}" (today + 2 days).
- Two buttons: "Track Order" (→ `/orders/:id`) and "Continue Shopping" (→ `/marketplace`).

**API call:** `GET /api/orders/:id` — to display order details.

#### Page 7: Order History (`/orders`)
List of all past orders for this consumer.

Table/list showing:
- Order ID (short), Date, Items (crop names), Total Amount, Status badge (Pending / Confirmed / In Transit / Delivered), "View Details" button.

**API call:** `GET /api/orders` — returns buyer's own orders.

#### Page 8: Order Detail + Tracking (`/orders/:id`)
Shows full details of one order.

Sections:
- Order info: ID, date, payment method, total.
- Items list with images.
- Status timeline: Pending → Confirmed → Packed → In Transit → Delivered (step indicator, current step highlighted green).
- Delivery address.
- Invoice download link (if `invoice_url` present).
- Farmer info for each item.

**API call:** `GET /api/orders/:id`

### B.2 API Calls Reference

All API base URL comes from `import.meta.env.VITE_API_URL`.

```
POST /api/auth/login                { mobile, password }
POST /api/auth/register             { full_name, mobile, email, password, role }
GET  /api/users/me                  (requires JWT token)
GET  /api/cart                      (requires JWT)
PUT  /api/cart/items/:itemId        { quantity_kg } (requires JWT)
DELETE /api/cart/items/:itemId      (requires JWT)
DELETE /api/cart/clear              (requires JWT)
POST /api/orders                    { delivery_address, delivery_slot } (requires JWT)
GET  /api/orders                    (requires JWT — returns own orders)
GET  /api/orders/:id                (requires JWT)
POST /api/payments/create-order     { order_id } (requires JWT)
POST /api/payments/verify           { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
```

### B.3 Shared Files You Build (Used by Entire Frontend)

#### Navbar (`src/components/common/Navbar.jsx`)
Used on every page. Shows:
- Kisan Connect logo (left).
- Navigation links: Home, Marketplace (center).
- Right side: Language toggle (EN/HI), Cart icon with item count badge, Login button OR user avatar dropdown (Profile, My Orders, Logout).

Navbar reads from Zustand: auth state (is logged in), cart item count.

#### ProtectedRoute (`src/components/common/ProtectedRoute.jsx`)
```jsx
const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};
```

### B.4 Cart State in Zustand

```javascript
// src/stores/cartStore.js
const useCartStore = create((set) => ({
  items: [],         // Array of cart items from API
  itemCount: 0,      // Total number of items in cart (shown in Navbar badge)
  subtotal: 0,       // Calculated subtotal
  
  setCart: (items) => set({
    items,
    itemCount: items.length,
    subtotal: items.reduce((sum, item) => sum + (item.quantity_kg * item.price_per_kg), 0)
  }),
  
  clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
}));
```

### B.5 Test Credentials for Demo

These are created by Manthan in seed data:
- Consumer login: `mobile: 9000000001`, `password: Consumer@123`
- Test Razorpay card: `4111 1111 1111 1111`, Expiry: any future date, CVV: `123`
- Test UPI: `success@razorpay`

### B.6 Status Colors for Order Status Badge

```javascript
const statusColors = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  packed:     'bg-purple-100 text-purple-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};
```

---

*Context version: 1.0 | Payal | Kisan Connect SIH 2026*
