# Frontend Notes - Structure Guide

Companion to `documentation.md`. Read this before touching any frontend code.

## Where things live

```
frontend/src/
  components/     Reusable UI (shared + per-portal)
  lib/            Roles + logger helpers
  locales/        i18n translation files (en.json, hi.json)
  pages/          Route-level screens, grouped by portal
  services/       API client wrappers (one per domain)
  stores/         Zustand global state (auth, cart)
  main.jsx        Entry point (i18n init + router)
  App.jsx         Route table + role-protected shells
```

## Page groups (pages/)

| Folder | Portal | Access |
| --- | --- | --- |
| (root) | Public / consumer pages | public or logged-in consumer/bulk_buyer |
| `admin/` | Admin portal | role `admin`, wrapped in AdminLayout |
| `farmer/` | Farmer portal | roles `farmer`, `fpo_admin` |
| `driver/` | Logistics portal | role `logistics` |

Root pages: Home, Marketplace, ProductDetail, Cart, Checkout,
OrderSuccess, Orders, OrderDetail, Login, Register, NotFound, Support.

`Support.jsx` is shared by all roles (it renders differently based on the
logged-in role) and is routed as `/support`, `/farmer/support`,
`/driver/support` which all render the same component.

## Routing (App.jsx)

Routes are grouped under role-protected shells using `ProtectedRoute`
(`components/common/ProtectedRoute.jsx`):

```
<Route element={<ProtectedRoute roles={['admin']} />}>
  <Route path="/admin" element={<AdminDashboard />} />      -> side shell
</Route>
```

A special pattern: the protected shell groups routes without a path so the
`AdminLayout`/sidebar shell wraps every child route. Farmer and driver
portals use the same technique.

Key routes:

- `/` Home, `/marketplace`, `/product/:id`, `/cart`, `/checkout`, `/order-success/:id`, `/orders`, `/orders/:id`
- `/login`, `/register`
- `/support`
- `/farmer/dashboard`, `/farmer/listings`, `/farmer/listings/new`, `/farmer/orders`, `/farmer/demand-advisory`
- `/driver`, `/driver/order/:assignmentId`
- `/admin`, `/admin/users`, `/admin/orders`, `/admin/grievances`, `/admin/analytics`

Adding a new page = new file in `pages/<portal>/`, one `<Route>` in App.jsx
inside the right protected shell, and (if needed) a sidebar/link update.

## Services layer (services/)

Axios instance in `services/api.js`:

- Base URL from `VITE_API_URL` (defaults to `http://localhost:5000`)
- Request interceptor attaches `Authorization: Bearer <token>` from `authStore`
- Response interceptor detects 401 and logs out

Domain modules (all export plain functions that call `api`):

| File | Covers |
| --- | --- |
| `auth.service.js` | register, login, OTP, forgot/reset password |
| `cart.service.js` | add/update/remove/get cart, summary |
| `listing.service.js` | marketplace listings, search, farmer CRUD |
| `order.service.js` | place/list/get/cancel/status |
| `payment.service.js` | create-order, verify, history |
| `admin.service.js` | admin endpoints + `getResponseData`/`getPaginatedData` helpers |
| `driver.service.js` | driver dashboard, available orders, accept, start/complete delivery |
| `ai.service.js` | chatbot / price forecast calls to the ai-service |

**Response unwrapping**: backend returns `{ success, message, data, pagination }`.
Every service returns the axios response; components read `res.data.data`.
`admin.service.getPaginatedData(res)` normalizes list responses to
`{ items, total }` (handles `pagination.total`, arrays, nested lists).

## Stores (stores/)

- `authStore.js` - `user`, `token`, `login()`, `logout()`, `setUser()`. Persisted
  (token). Login redirects by role via `lib/roles.getRoleHome`.
- `cartStore.js` - cart list + totals. `calculateTotals()` returns
  `{ subtotal, deliveryCharge, gst, total }` and MUST stay in sync with the
  backend `cart.service.getCartSummary`: flat delivery 30 rupees, GST 0.
  If the backend pricing changes, change both.

## State & data patterns (important)

- **Pages fetch their own data with `useEffect` + polling.** Dashboards
  poll every 30-45 seconds (clear the interval on unmount), e.g.
  `AdminDashboard`, `DriverDashboard`, `FarmerDashboard`, `Analytics`,
  `Support`. Keep the interval constant unbroken: `cancelled` flag prevents
  setting state after unmount.
- **No hardcoded mock data remains** in the admin/farmer/driver portals.
  Screens start with empty state and fill from live endpoints. If a screen
  shows demo data it is either an unported page or a bug.
- Optimistic updates are used for toggles (e.g. user active toggle, order
  status), with revert on error.

## Styling & UI primitives

- Tailwind CSS. Brand color classes `kisan-500/700/800` (green) defined in the
  Tailwind config.
- shadcn-style primitives in `components/ui/` (button, card, dialog, input,
  select, table, badge) - full-styled, use them for consistency.
- Icons: `lucide-react`.
- Toasts: `sonner` (`toast.success/error`).
- Charts: `recharts` (admin analytics + dashboards).

## i18n

`i18next` with `locales/en.json` and `locales/hi.json`. Keys are dotted
(`nav.support`, `footer.tagline`). `t()`, `i18n.changeLanguage()` from
`react-i18next`. When adding a user-facing string add it to BOTH files.

## Component inventory (components/)

- `common/ProtectedRoute.jsx` - role gate
- `admin/AdminLayout.jsx` + `AdminSidebar.jsx` + `StatCard.jsx` - admin shell
- `farmer/PhotoUpload.jsx` - Cloudinary image dropzone
- `marketplace/FilterSidebar.jsx`, `ProductCard.jsx`, `ProductGrid.jsx`
- `chatbot/ChatbotWidget.jsx` - floating AI chatbot using `ai.service`
- `ui/` - shadcn primitives listed above

## Important constants / behaviors

- `INDIA_DISTRICTS` (`pages/Checkout.jsx`) - ~350 districts mapped to their
  state for the delivery address dropdown + datalist autocomplete. Reused by
  create-listing screens conceptually (state auto-fills from chosen district).
- Delivery date (`delivery_slot`) is optional; submit `null` when empty.
- Checkout validates district/state against `INDIA_DISTRICTS`.
- `lib/logger.js` - gated console logger (dashboards log data loads).

## Build & checks

- `cd frontend && npm run build` - the only real check (compiles TSX/CSS).
  Always run it after changes.
- `npm run dev` for local development (proxies API via VITE_API_URL).

## Gotcha to remember when editing

- Keep `cartStore.calculateTotals` consistent with the backend cart summary.
- Keep the navbar portal links (components/Navbar.jsx) in sync with the
  routes; it decides visibility by role (desktop nav, mobile drawer, and
  a dropdown menu all reference the same list).
- New admin pages: use `AdminLayout` + add sidebar entry in `AdminSidebar.jsx`.