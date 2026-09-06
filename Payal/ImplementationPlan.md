# IMPLEMENTATION PLAN — Payal
## Day-by-Day Build Guide: Consumer Frontend (Home + Auth + Cart + Checkout + Orders)

---

## PRE-START CHECKLIST (Do These Before Day 1)

- [ ] Clone the GitHub repo Manthan creates: `git clone https://github.com/<org>/kisan-connect.git`
- [ ] Install Node.js 20 LTS from https://nodejs.org/en/download
- [ ] Install VS Code from https://code.visualstudio.com
- [ ] Install VS Code extensions: "ES7+ React/Redux Snippets", "Tailwind CSS IntelliSense", "Prettier - Code formatter"
- [ ] Message Tukesh and ask for the Omniroute `VITE_API_URL` value
- [ ] Message Sunidhi and ask when her `api.js` and `authStore.js` files will be ready (you need them Day 2)
- [ ] Keep demo Razorpay test card ready: `4111 1111 1111 1111`, CVV: `123`, Any future expiry

---

## DAY 1 — SETUP + NAVBAR + SHARED COMPONENTS

### Step 1: Pull Latest Code from GitHub

```bash
cd kisan-connect
git pull origin dev
git checkout -b feature/payal/consumer-frontend
```

### Step 2: Go to Frontend Folder

```bash
cd frontend
# Sunidhi already ran npm install on Day 1
# Just verify it works:
npm run dev
# Open http://localhost:3000 in browser — you should see Sunidhi's initial page
```

### Step 3: Create Your `.env` Additions

Open `frontend/.env` and confirm `VITE_API_URL` is set (Sunidhi or Tukesh provides the value).

### Step 4: Create Your Service Files

Create these 4 empty files first, then fill them using OpenCode prompts from Task.md:
```bash
touch src/services/auth.service.js
touch src/services/cart.service.js
touch src/services/order.service.js
touch src/services/payment.service.js
```

For each file, use the OpenCode prompt from Task.md Module 1 to generate the code.

### Step 5: Create Cart Store

Create `src/stores/cartStore.js` — use OpenCode prompt from Task.md Module 1.1.

### Step 6: Build Navbar

Use OpenCode prompt from Task.md Module 1.5.

After generating:
- Open `http://localhost:3000`
- If Sunidhi has not yet added Navbar to App.jsx, add it temporarily yourself in App.jsx:
```jsx
import Navbar from './components/common/Navbar';
// Inside the return, add <Navbar /> at the very top before Routes
```
- Verify Navbar shows the logo, links, and a cart icon.
- Test: cart icon should show badge count (for now: 0).

### Step 7: Create ProtectedRoute

Create `src/components/common/ProtectedRoute.jsx` — copy the code directly from Task.md Module 1.6 (this is short enough to write manually without OpenCode).

**Commit at end of Day 1:**
```bash
git add .
git commit -m "feat: navbar, protectedroute, service files, cart store"
git push origin feature/payal/consumer-frontend
```

---

## DAY 2 — HOME PAGE + LOGIN PAGE

### Step 1: Build Home Page

Use OpenCode prompt from Task.md Module 2.

This page has 5 sections. If the generated code is too long or OpenCode splits it, generate section by section.

**Section-by-section prompts if needed:**

Hero section:
```
"Generate just the Hero section JSX for a React landing page for Kisan Connect.
Dark green gradient background (bg-gradient-to-br from-green-900 to-green-700).
Centered content: Hindi text 'खेत से घर तक' in white Noto Sans Devanagari font,
'Kisan Connect' subtitle white, description text in green-200.
Two buttons: 'Shop Now' bg-white text-green-800 rounded-full px-8 py-3, 
and 'For Farmers' border-2 border-white text-white rounded-full px-8 py-3.
Min height 60vh. Use Link from react-router-dom for navigation."
```

Test after each section by adding the page to App.jsx temporarily.

### Step 2: Add Home Route to App.jsx

Ask Sunidhi to add `<Route path="/" element={<Home />} />` to App.jsx, or do it yourself.

Open `http://localhost:3000` — Home page should appear.

Verify:
- "Shop Now" button leads somewhere (even if /marketplace shows a 404 for now, that is fine).
- The page looks good on both desktop and mobile (check mobile using DevTools, F12 → phone icon).

### Step 3: Build Login Page

Use OpenCode prompt from Task.md Module 3.

**Test with mock (while Manthan's auth API is not ready):**

Comment out the API call temporarily and hardcode success:
```javascript
// TEMPORARY MOCK — remove when API is ready
const handleSubmit = async () => {
  // Simulate login success
  useAuthStore.getState().setAuth(
    { full_name: 'Test Consumer', role: 'consumer', mobile: '9000000001' },
    'mock-token-123'
  );
  navigate('/marketplace');
};
```

Once Manthan confirms auth API is live (Day 2-3), replace with real call:
```javascript
const response = await authService.login(data.mobile, data.password);
useAuthStore.getState().setAuth(response.data.user, response.data.access_token);
navigate('/marketplace');
```

Add login route to App.jsx: `<Route path="/login" element={<Login />} />`

**Commit at end of Day 2:**
```bash
git add .
git commit -m "feat: home page and login page"
git push origin feature/payal/consumer-frontend
```

---

## DAY 3 — REGISTER PAGE + CART PAGE (PART 1)

### Step 1: Build Register Page

Use OpenCode prompt from Task.md Module 4.

The role selection cards are the most complex part. If OpenCode doesn't generate them cleanly, simplify to a regular `<select>` dropdown for role instead.

Add register route: `<Route path="/register" element={<Register />} />`

Test registration flow with Manthan's API when ready.

### Step 2: Build Cart Page — UI Only (With Mock Data)

While Tukesh's cart API is not ready, build the Cart page with mock cart items:

```javascript
// TEMPORARY mock data at top of Cart.jsx — remove when API ready
const mockItems = [
  { id: '1', crop_name: 'Tomato', quantity_kg: 5, price_per_kg: 22, farmer_name: 'Ramesh Patil', images: [] },
  { id: '2', crop_name: 'Onion', quantity_kg: 3, price_per_kg: 18, farmer_name: 'Suresh Sharma', images: [] },
];
```

Use OpenCode prompt from Task.md Module 5.

Key things to get right even with mock data:
- The item rows look clean and readable.
- The +/- buttons work (even if they just update local state for now).
- The trash button removes an item from the local list.
- The Order Summary card shows correct totals.
- "Proceed to Checkout" button navigates to /checkout.

Add cart route inside ProtectedRoute in App.jsx:
```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/cart" element={<Cart />} />
</Route>
```

**Commit at end of Day 3:**
```bash
git add .
git commit -m "feat: register page and cart page UI"
git push origin feature/payal/consumer-frontend
```

---

## DAY 4 — CART PAGE (REAL API) + CHECKOUT PAGE (PART 1)

### Step 1: Connect Cart to Real API

Once Tukesh confirms cart APIs are working:

Replace the mock data with real API call:
```javascript
useEffect(() => {
  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      cartStore.setCart(response.data);
      const summary = await cartService.getSummary();
      setSummary(summary.data);
    } catch (err) {
      toast.error('Could not load cart');
    } finally {
      setLoading(false);
    }
  };
  loadCart();
}, []);
```

Connect quantity update:
```javascript
const handleQuantityChange = async (itemId, newQty) => {
  try {
    await cartService.updateItem(itemId, newQty);
    // Reload cart
    const response = await cartService.getCart();
    cartStore.setCart(response.data);
  } catch (err) {
    toast.error('Could not update quantity');
  }
};
```

Connect remove item:
```javascript
const handleRemove = async (itemId) => {
  try {
    await cartService.removeItem(itemId);
    cartStore.setCart(cartStore.items.filter(i => i.id !== itemId));
    toast.success('Item removed');
  } catch (err) {
    toast.error('Could not remove item');
  }
};
```

### Step 2: Build Checkout Page — Form Only

Use OpenCode prompt from Task.md Module 6. On Day 4, build just the form and order summary. The payment button will be connected on Day 5.

For now: clicking "Pay" just logs the form data to console.

Add route: `<Route path="/checkout" element={<Checkout />} />`

Verify the address form looks clean and validates correctly (error messages appear for empty required fields).

**Commit at end of Day 4:**
```bash
git add .
git commit -m "feat: cart connected to API, checkout form UI"
git push origin feature/payal/consumer-frontend
```

---

## DAY 5 — CHECKOUT PAYMENT + ORDER CONFIRMATION

### Step 1: Add Razorpay Payment to Checkout

This is the most important step. Take your time and test carefully.

Add the `loadRazorpay` helper function to your Checkout component (from Task.md Module 6).

Add the payment handler to the "Pay" button's onClick:

```javascript
const handlePay = async () => {
  // Step 1: Validate form
  const isValid = await form.trigger();
  if (!isValid) return;
  
  setPaymentLoading(true);
  
  try {
    const formData = form.getValues();
    const deliveryAddress = {
      full_name: formData.full_name,
      mobile: formData.mobile,
      full_address: formData.full_address,
      district: formData.district,
      state: formData.state,
      pin_code: formData.pin_code,
    };
    
    // Step 2: Place order
    const orderResponse = await orderService.placeOrder(deliveryAddress, formData.delivery_slot);
    const orderId = orderResponse.data.id;
    
    // Step 3: Create Razorpay order
    const payResponse = await paymentService.createRazorpayOrder(orderId);
    const { razorpay_order_id, amount, key_id } = payResponse.data;
    
    // Step 4: Load Razorpay script
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Payment service unavailable'); return; }
    
    // Step 5: Open Razorpay modal
    const rzp = new window.Razorpay({
      key: key_id,
      amount: amount,
      currency: 'INR',
      name: 'Kisan Connect',
      description: 'Fresh Produce Order',
      order_id: razorpay_order_id,
      handler: async (response) => {
        try {
          await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            order_id: orderId
          });
          toast.success('Payment successful!');
          navigate('/order-success/' + orderId);
        } catch (err) {
          toast.error('Payment verification failed. Contact support.');
        }
      },
      prefill: { name: formData.full_name, contact: formData.mobile },
      theme: { color: '#2D7A2D' },
      modal: { ondismiss: () => setPaymentLoading(false) }
    });
    rzp.open();
    
  } catch (err) {
    toast.error(err.message || 'Could not initiate payment');
    setPaymentLoading(false);
  }
};
```

**TEST THE PAYMENT FLOW:**
1. Login as consumer (test credentials from Context.md B.5).
2. Add items to cart (go to Marketplace, click Add to Cart on a listing).
3. Go to /cart — verify items appear.
4. Go to /checkout — fill address form.
5. Click Pay button.
6. Razorpay modal should open.
7. Enter test card: `4111 1111 1111 1111`, any future date, CVV `123`.
8. Click Pay.
9. Should navigate to /order-success page.

If the modal does not open: check browser console for errors. Most common issues:
- `window.Razorpay is not a constructor` → `loadRazorpay()` failed to load the script. Check your internet connection.
- 404 on `/api/payments/create-order` → Tukesh's endpoint is not ready yet. Ask him.

### Step 2: Build Order Confirmation Page

Use OpenCode prompt from Task.md Module 7.

Add route: `<Route path="/order-success/:id" element={<OrderSuccess />} />`

Test: after successful payment, the confirmation page should show order details.

**Commit at end of Day 5:**
```bash
git add .
git commit -m "feat: checkout with Razorpay payment, order confirmation page"
git push origin feature/payal/consumer-frontend
```

---

## DAY 6 — ORDER HISTORY + ORDER TRACKING

### Step 1: Build Order History Page

Use OpenCode prompt from Task.md Module 8.

Add route inside ProtectedRoute: `<Route path="/orders" element={<OrderHistory />} />`

Test: login as consumer who has placed an order → navigate to /orders → see their order listed.

If no orders exist yet (because test orders weren't placed): use mock orders to verify UI:
```javascript
const mockOrders = [
  { id: 'abc12345-...', status: 'delivered', createdAt: '2026-08-20', total_amount: 160, items: [{ crop_name: 'Tomato' }] },
  { id: 'def67890-...', status: 'in_transit', createdAt: '2026-08-25', total_amount: 94, items: [{ crop_name: 'Onion' }] },
];
```

### Step 2: Build Order Detail + Tracking Page

Use OpenCode prompt from Task.md Module 9.

The status timeline is the most visual part — verify it shows the correct active step based on order status.

Add route: `<Route path="/orders/:id" element={<OrderDetail />} />`

Test: click "View Details" from Order History → Order Detail should show full order information and correct timeline step highlighted.

**Commit at end of Day 6:**
```bash
git add .
git commit -m "feat: order history and order detail tracking pages"
git push origin feature/payal/consumer-frontend
```

---

## DAY 7 — MOBILE TESTING + FINAL POLISH + PR

### Step 1: Mobile Layout Check

Open Chrome → F12 → Toggle Device Toolbar → iPhone SE (375×667).

Check every page:
- [ ] Home: Hero text readable, buttons not cut off, all sections stacked properly
- [ ] Login: Card centered, inputs full-width on mobile
- [ ] Register: Role cards stacked, form full-width
- [ ] Cart: Items readable, summary below items (not side-by-side)
- [ ] Checkout: Form full-width, pay button visible
- [ ] Order Success: Checkmark centered, buttons full-width
- [ ] Order History: Cards readable, status badge visible
- [ ] Order Detail: Timeline readable on small screen, cards full-width

### Step 2: Fix Any Errors

Open browser DevTools → Console tab. Fix any red error messages.

Common issues:
- `Cannot read property 'X' of undefined` → Add optional chaining: `object?.property`.
- `Each child in a list should have a unique key` → Add `key={item.id}` to map items.
- Images not loading → Add `onError={(e) => e.target.src = '/placeholder-crop.jpg'}` to img tags.

### Step 3: Test Complete Consumer Journey

Do a full end-to-end test:
1. Open Home page (`/`).
2. Click "Shop Now" → Marketplace.
3. Browse listings → Click "Add to Cart" on one item.
4. Click Cart icon in Navbar → go to `/cart`.
5. Verify item is there. Change quantity. Remove item. Add it back.
6. Click "Proceed to Checkout".
7. Fill address form.
8. Click Pay → Razorpay modal opens → use test card → pay.
9. Land on Order Success page.
10. Click "Track Order" → Order Detail shows with correct status.
11. Click "← Back to Orders" → Order History shows the order.

All steps must work without errors.

### Step 4: Create Pull Request

```bash
git add .
git commit -m "feat: complete consumer frontend - all pages done and tested"
git push origin feature/payal/consumer-frontend
```

Go to GitHub → Create Pull Request → base: `dev` → compare: `feature/payal/consumer-frontend`.

Title: `[Payal] Consumer Frontend: Home + Auth + Cart + Checkout + Orders`

Description:
```
Pages completed:
- Home / Landing Page (/)
- Login Page (/login)
- Register Page (/register)
- Cart Page (/cart)
- Checkout Page with Razorpay (/checkout)
- Order Success Page (/order-success/:id)
- Order History (/orders)
- Order Detail + Tracking (/orders/:id)

Shared components:
- Navbar
- ProtectedRoute

Services: auth.service.js, cart.service.js, order.service.js, payment.service.js
Store: cartStore.js

Tested: Full consumer journey from browse → cart → checkout → payment → tracking.
Mobile: Tested on 375px viewport.
```

Ask Manthan to review and merge.

---

## COMMIT SCHEDULE

| Day | What to Commit |
|---|---|
| Day 1 | Navbar + ProtectedRoute + service files + cartStore |
| Day 2 | Home page + Login page |
| Day 3 | Register page + Cart page UI (with mock data) |
| Day 4 | Cart connected to real API + Checkout form UI |
| Day 5 | Checkout with Razorpay payment + Order Success page |
| Day 6 | Order History + Order Detail tracking |
| Day 7 | Mobile polish + final PR to dev |

---

*Implementation Plan v1.0 | Payal | Kisan Connect SIH 2026*
