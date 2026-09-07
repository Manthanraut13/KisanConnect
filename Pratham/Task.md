# TASK.md — Pratham
## Frontend: Admin Dashboard + Chatbot Widget + Driver PWA

---

## ASSIGNED PAGES & COMPONENTS

| # | Page / Component | Route | Priority | Est. Days |
|---|---|---|---|---|
| 1 | Admin Service + Driver Service | — | CRITICAL | 0.5 |
| 2 | Admin Layout + Sidebar | `/admin/*` | CRITICAL | 0.5 |
| 3 | Admin Dashboard | `/admin` | CRITICAL | 1.5 |
| 4 | User Management Page | `/admin/users` | HIGH | 1 |
| 5 | Grievances Panel | `/admin/grievances` | HIGH | 1 |
| 6 | Orders Management | `/admin/orders` | HIGH | 1 |
| 7 | Analytics Page | `/admin/analytics` | MEDIUM | 0.5 |
| 8 | **Chatbot Widget (Kisan Mitra)** | Global | CRITICAL | 2 |
| 9 | Driver Dashboard | `/driver` | HIGH | 0.5 |
| 10 | Active Delivery View | `/driver/delivery/:id` | HIGH | 1 |
| **Total** | | | | **~9.5 days** |

---

## DEPENDENCIES — WHAT YOU NEED BEFORE STARTING

| What | From Whom | When |
|---|---|---|
| `VITE_API_URL` (Omniroute URL) | Tukesh | Day 1 |
| `api.js`, `authStore.js` | Sunidhi | Day 1 |
| `ProtectedRoute` component | Payal | Day 1 |
| Admin APIs working (`/api/admin/*`) | Manthan | Day 3-4 |
| Chatbot API working (`/ai/chatbot/query`) | Siddhesh | Day 3-4 |
| Logistics driver APIs (`/api/logistics/driver/*`) | Tukesh | Day 5-6 |

While any API is not ready, build the UI with mock data and swap later.

---

## YOUR FILES GO HERE

```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.jsx    ← YOU BUILD
│   │   ├── UserManagement.jsx    ← YOU BUILD
│   │   ├── AdminOrders.jsx       ← YOU BUILD
│   │   ├── Grievances.jsx        ← YOU BUILD
│   │   └── Analytics.jsx         ← YOU BUILD
│   └── driver/
│       ├── DriverDashboard.jsx   ← YOU BUILD
│       └── ActiveDelivery.jsx    ← YOU BUILD
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx       ← YOU BUILD
│   │   ├── AdminSidebar.jsx      ← YOU BUILD
│   │   └── StatCard.jsx          ← YOU BUILD
│   └── chatbot/
│       └── ChatbotWidget.jsx     ← YOU BUILD (most important!)
└── services/
    ├── admin.service.js          ← YOU BUILD
    └── driver.service.js         ← YOU BUILD
```

---

## MODULE 1 — SERVICE FILES

### Admin Service

```
OpenCode Prompt:
"Generate /frontend/src/services/admin.service.js.
Import api from './api'.
Export adminService object with:
- getStats: () => api.get('/api/admin/stats')
- getUsers: (params) => api.get('/api/admin/users', { params })
- updateUserStatus: (id, isActive) => api.put('/api/admin/users/' + id + '/status', { is_active: isActive })
- getOrders: (params) => api.get('/api/admin/orders', { params })
- updateOrderStatus: (id, status) => api.put('/api/admin/orders/' + id + '/status', { status })
- getGrievances: (params) => api.get('/api/admin/grievances', { params })
- resolveGrievance: (id, note) => api.put('/api/admin/grievances/' + id, { status: 'resolved', resolution_note: note })
- getAnalytics: () => api.get('/api/admin/reports/orders')"
```

### Driver Service

```
OpenCode Prompt:
"Generate /frontend/src/services/driver.service.js.
Import api from './api'.
Export driverService object with:
- getAssignments: () => api.get('/api/logistics/driver/assignments')
- updateDeliveryStatus: (id, status) => api.put('/api/logistics/delivery/' + id + '/start', { status })
- confirmDelivery: (id, formData) => api.put('/api/logistics/delivery/' + id + '/confirm', formData, { headers: { 'Content-Type': 'multipart/form-data' } })"
```

---

## MODULE 2 — ADMIN LAYOUT + SIDEBAR

### Admin Sidebar

```
OpenCode Prompt:
"Generate React component /frontend/src/components/admin/AdminSidebar.jsx.
A vertical left sidebar for admin navigation.
Width: 240px on desktop. Collapsible to icon-only on smaller screens.
Background: bg-green-900. Text: white.

Navigation items with icons from lucide-react:
1. LayoutDashboard icon — 'Dashboard' — navigates to /admin
2. Users icon — 'Users' — navigates to /admin/users
3. ShoppingBag icon — 'Orders' — navigates to /admin/orders
4. MessageSquare icon — 'Grievances' — navigates to /admin/grievances
5. BarChart2 icon — 'Analytics' — navigates to /admin/analytics

Each nav item: flex row (icon + label), p-3, rounded-lg.
Active item (current route matches): bg-green-700.
Hover: bg-green-800.

Top of sidebar: 'Kisan Connect' logo text + 'Admin' badge.
Bottom: logout button (LogOut icon + 'Logout' text).

Use useLocation to determine active route. Use useNavigate for navigation. Export default."
```

### Admin Layout Wrapper

```
OpenCode Prompt:
"Generate React component /frontend/src/components/admin/AdminLayout.jsx.
It wraps all admin pages with a two-column layout:
Left: AdminSidebar (fixed, 240px wide).
Right: Main content area (flex-1, overflow-auto, bg-gray-50).
  Top bar: breadcrumb showing current page name, admin user name (right).
  Below: children (the actual page content).

Props: { children, pageTitle }.
Import AdminSidebar from './AdminSidebar'. Import useAuthStore from stores/authStore.
The outer div: flex h-screen overflow-hidden. Export default."
```

### Stat Card Component

```
OpenCode Prompt:
"Generate React component /frontend/src/components/admin/StatCard.jsx.
Props: { title, value, icon: IconComponent, color, change }.
Renders a shadcn Card with:
- Left: colored icon background circle (using color prop for bg, e.g. 'bg-blue-100') with icon inside.
- Right: title (text-sm text-gray-500), value (text-2xl font-bold), 
  optional change badge (e.g. '+12% this week' in green text if positive).
Export default."
```

---

## MODULE 3 — ADMIN DASHBOARD

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/admin/AdminDashboard.jsx.
Wrap in AdminLayout with pageTitle='Dashboard'.

On mount: call adminService.getStats() and adminService.getGrievances({ limit: 5 }).
State: stats (object), recentGrievances (array), loading (bool), ordersChartData (array), gmvChartData (array).

After getStats() returns, build mock chart data for week:
ordersChartData = last 7 days array: [{ day: 'Mon', orders: randomInt(5,25) }, ...]
gmvChartData = last 7 days array: [{ day: 'Mon', gmv: randomInt(2000,15000) }, ...]
(Use real data when analytics API is ready, for now use random realistic numbers)

Layout:
ROW 1 — 4 StatCards (2 cols mobile, 4 cols desktop):
  StatCard 1: title='Total Users', value=stats.totalUsers, icon=Users, color='bg-blue-100'
  StatCard 2: title='Active Listings', value=stats.totalListings, icon=Package, color='bg-green-100'
  StatCard 3: title='Total Orders', value=stats.totalOrders, icon=ShoppingBag, color='bg-purple-100'
  StatCard 4: title='Platform GMV', value='₹'+stats.gmv.toLocaleString('en-IN'), icon=TrendingUp, color='bg-amber-100'

ROW 2 — Two charts side by side (grid-cols-2 gap-6, stacked on mobile):
Left chart — shadcn Card with 'Orders This Week' title:
  Recharts BarChart (height 220) with ordersChartData. X-axis: day. Y-axis: orders. Bar fill: #2D7A2D.
Right chart — shadcn Card with 'Revenue This Week (₹)' title:
  Recharts LineChart (height 220) with gmvChartData. X-axis: day. Y-axis: gmv. Line stroke: #2D7A2D.

ROW 3 — Recent Grievances card:
Title: 'Recent Grievances' + 'View All' link → /admin/grievances.
Table with cols: User, Category, Severity badge, Status, SLA Deadline, Action.
Severity badge: critical=red-100/red-800, high=orange-100/orange-800, medium=yellow-100/yellow-800, low=gray-100/gray-700.
Action: 'Resolve' button → navigates to /admin/grievances.
Export default."
```

---

## MODULE 4 — USER MANAGEMENT PAGE

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/admin/UserManagement.jsx.
Wrap in AdminLayout with pageTitle='User Management'.

State: users (array), loading (bool), searchQuery (''), roleFilter ('all'), page (1), totalPages (1).
On mount and when filters change: call adminService.getUsers({ page, limit: 20, search: searchQuery, role: roleFilter !== 'all' ? roleFilter : undefined }).

Top bar: search input (Search icon inside, placeholder 'Search by name or mobile') + role filter dropdown (All, Farmer, Consumer, Bulk Buyer, Logistics).

shadcn Table with columns:
- Full Name (with profile image placeholder circle if no image)
- Mobile (text-sm)
- Role badge: farmer=green, consumer=blue, bulk_buyer=purple, logistics=orange, admin=red
- District (text-sm text-gray-500)
- Status: Active=green toggle ON, Inactive=gray toggle OFF (shadcn Switch component)
- Actions: 'View' button (opens Dialog with full user details)

On toggle switch change: call adminService.updateUserStatus(user.id, !user.is_active).
On success: update user in local users array. Show toast.
On 'View' click: open shadcn Dialog showing: all user fields, farmerProfile or buyerProfile details if applicable.

Pagination below table: Previous / Page X of Y / Next.
Export default."
```

---

## MODULE 5 — GRIEVANCES PANEL

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/admin/Grievances.jsx.
Wrap in AdminLayout with pageTitle='Grievances'.

On mount: call adminService.getGrievances().
State: grievances (array), selectedGrievance (null), resolveNote (''), loading (bool).

Table columns:
- Ticket # (id first 8 chars, monospace font)
- User Name
- Category badge (payment=blue, logistics=orange, quality=green, fraud=red, other=gray)
- Severity badge (critical=red, high=orange, medium=yellow, low=gray). Bold for critical.
- Description (max 80 chars with '...' truncation, full on hover tooltip)
- Status badge (open=yellow, in_progress=blue, resolved=green, closed=gray)
- SLA Deadline: show date. If deadline is past and status != resolved/closed: show in red with AlertCircle icon.
- Action column: 'Resolve' button (disabled if already resolved/closed)

On 'Resolve' click: open shadcn Dialog:
  Title: 'Resolve Grievance #{short_id}'
  Show: description, user name, category, severity.
  Textarea: 'Resolution Note' (resolveNote state).
  Buttons: 'Cancel' and 'Mark Resolved' (green).
  On confirm: call adminService.resolveGrievance(grievance.id, resolveNote). Update local state. Close dialog. Toast success.

Filter bar above table: Status filter dropdown (All/Open/In Progress/Resolved), Severity filter.
Export default."
```

---

## MODULE 6 — ADMIN ORDERS + ANALYTICS

### Admin Orders (simpler version)

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/admin/AdminOrders.jsx.
Wrap in AdminLayout with pageTitle='Orders'.
On mount: call adminService.getOrders().
Simple table: Order ID (short), Buyer Name, Total Amount, Status badge, Payment Status badge, Date, 'View' action button.
Status colors same as consumer side. Payment: paid=green, pending=yellow, failed=red.
'View' opens a Dialog showing full order details and items list.
Search input to filter by order ID or buyer name (client-side filtering on the orders array).
Export default."
```

### Analytics Page (simple)

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/admin/Analytics.jsx.
Wrap in AdminLayout with pageTitle='Analytics'.
On mount: call adminService.getAnalytics(). If API not ready, use mock data.

Mock data for prototype:
topCrops = [{crop:'Tomato',orders:145},{crop:'Onion',orders:120},{crop:'Potato',orders:98},{crop:'Rice',orders:87},{crop:'Banana',orders:76}]
dailyOrders = last 14 days array: [{date:'Aug 13', orders:12},{...}...]

Show:
1. 'Top 5 Crops by Orders' — Recharts BarChart horizontal (layout='vertical'), height 300.
2. 'Daily Orders (Last 14 Days)' — Recharts LineChart, height 250.
3. Three summary stat cards: 'Avg Order Value', 'Orders This Month', 'Active Districts'.
Export default."
```

---

## MODULE 7 — CHATBOT WIDGET (MOST IMPORTANT)

This is the most complex component Pratham builds. Generate it in two parts.

### Part 1: Chat Widget Shell

```
OpenCode Prompt:
"Generate React component /frontend/src/components/chatbot/ChatbotWidget.jsx — PART 1: The shell.
This is a floating chatbot widget that appears on ALL pages.

State: isOpen (bool, default false), language ('en' or 'hi').

CLOSED STATE (isOpen = false):
Fixed position: bottom-6 right-6. z-50.
A circular button: w-16 h-16, bg-green-700, rounded-full, shadow-xl.
Inside: MessageCircle icon (white, size 28).
Tooltip on hover: 'Kisan Mitra'.
On click: setIsOpen(true).

OPEN STATE (isOpen = true):
Fixed panel: bottom-6 right-6 on desktop (w-96 h-[500px]).
On mobile (screen < 640px): fixed bottom-0 right-0 w-full h-[85vh] rounded-t-2xl.
Shadow-2xl, rounded-2xl (desktop), bg-white.

Panel header (bg-green-700, text-white, rounded-t-2xl, p-4):
  Left: green circle avatar with 'KM' text initials. Right of avatar: 'Kisan Mitra' bold + 'AI Assistant' small.
  Right: Language toggle button ('EN' / 'HI' text toggle, clicking swaps language state).
         Close button (X icon, on click setIsOpen(false)).

Panel body (flex-1, overflow-y-auto, p-4, bg-gray-50): 
  This is where messages will go. For now: placeholder text 'Messages will appear here'.

Panel footer (p-3 bg-white border-t):
  Input row: text input (flex-1, rounded-full, border, px-4) + Send button (green, rounded-full, Send icon).

Import lucide-react icons: MessageCircle, X, Send.
Export default."
```

### Part 2: Chat Logic

```
OpenCode Prompt:
"Update /frontend/src/components/chatbot/ChatbotWidget.jsx — PART 2: Add full chat logic.
Add these to the existing component:

New state: messages (array, default: [{role:'assistant', content:'नमस्ते! 👋 I am Kisan Mitra. How can I help you? / मैं आपकी मदद कैसे करूँ?', timestamp: Date.now()}]), inputValue (''), isTyping (false).

Message data shape: { role: 'user'|'assistant', content: string, timestamp: number, is_fallback: bool }

Get user role from useAuthStore: const user = useAuthStore(s => s.user). userRole = user?.role || 'consumer'.

SEND MESSAGE function:
async sendMessage(messageText):
  1. If !messageText.trim() return.
  2. Add user message to messages: { role:'user', content: messageText, timestamp: Date.now() }.
  3. Clear inputValue.
  4. Set isTyping = true.
  5. Build conversation_history: last 6 messages (before the new one) formatted as [{role, content}].
  6. Call: api.post('/ai/chatbot/query', { message: messageText, language, user_role: userRole, conversation_history }).
  7. On success: add assistant message from response.data.data.response.
  8. On error: add fallback message:
     EN: 'Sorry, I am having trouble right now. Please try again in a moment.'
     HI: 'माफ करें, अभी कोई तकनीकी समस्या है। थोड़ी देर बाद प्रयास करें।'
  9. Set isTyping = false.

MESSAGES AREA (replace placeholder):
Map over messages array. Each message:
  - User message: flex justify-end. Bubble: bg-green-700 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-xs.
  - Assistant message: flex justify-start gap-2.
    Avatar: w-8 h-8 rounded-full bg-green-100 flex items-center justify-center 'KM' text-green-700 text-xs font-bold.
    Bubble: bg-white text-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs shadow-sm border border-gray-100.
  - Timestamp: text-xs text-gray-400 below each bubble.

TYPING INDICATOR (shown when isTyping=true):
Same style as assistant message but bubble contains 3 animated dots:
  span with class 'flex gap-1': three w-2 h-2 bg-gray-400 rounded-full with animate-bounce and different animation-delays (0ms, 150ms, 300ms).

QUICK REPLY BUTTONS (below last assistant message only):
Three buttons: 'Track my order', farmer ? 'List a crop' : 'Find fresh produce', 'Talk to support'.
Style: small rounded pills, border border-green-600 text-green-600 text-xs px-3 py-1 hover:bg-green-50.
On click: call sendMessage(buttonText).

INPUT: onKeyDown — if key is 'Enter' (not Shift+Enter): call sendMessage(inputValue).
Send button: onClick calls sendMessage(inputValue).

Auto-scroll: useEffect on messages change: scroll messages div to bottom (messagesEndRef with scrollIntoView).

Import: api from services/api. Import useAuthStore. Export default."
```

---

## MODULE 8 — DRIVER DASHBOARD + ACTIVE DELIVERY

### Driver Dashboard

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/driver/DriverDashboard.jsx.
On mount: call driverService.getAssignments(). Store as assignments.
Show loading spinner while loading.

Header: 'My Deliveries Today' + driver's full_name (from authStore).

EMPTY STATE: Truck icon (large, gray) + 'No deliveries assigned' + 'Pull down to refresh' text.

DELIVERY CARDS (if assignments exist):
Each card (white, rounded-xl, shadow, p-4, mb-4):
- Top: Order ID badge (monospace) + Status badge (Assigned=yellow, In Transit=blue, Delivered=green).
- Customer: person icon + customer name + clickable mobile number (tel: link, so driver can call directly).
- Address: MapPin icon + full delivery address.
- Items: Package icon + comma-separated crop names + total weight.
- Bottom buttons (full width, large — minimum h-12 for easy tapping):
  If status = 'assigned': 'Start Delivery' button (green) → calls driverService.updateDeliveryStatus(id, 'in_transit') then refresh.
  If status = 'in_transit': 'Mark as Delivered' button (green) + 'View Route' button (outline) → /driver/delivery/:id.
  If status = 'delivered': 'Completed ✓' (gray, disabled).

Note: All text size-base or larger. Buttons min-h-12. This is used on mobile in the field.
Export default."
```

### Active Delivery View

```
OpenCode Prompt:
"Generate React page /frontend/src/pages/driver/ActiveDelivery.jsx.
Use useParams to get id. On mount: get assignments from driverService.getAssignments() and find the one matching id.
State: assignment (object), uploading (bool), proofFile (File|null).

Show loading spinner while loading.

Layout (mobile-first, max-w-lg mx-auto):

SECTION 1 — Customer & Address card (white, shadow, rounded-xl, p-4):
  Customer name (text-xl font-bold).
  Phone: clickable 'Call Customer' link (tel:{mobile}) — big green button style.
  Address: full_address, district, state, pin_code.
  Items: list of crop + qty.

SECTION 2 — Map (if assignment has pickup/delivery coordinates):
  Small react-leaflet MapContainer (h-48, rounded-xl, overflow-hidden).
  Marker at delivery_location lat/lng. Popup: 'Deliver Here'.
  Note: if coordinates not available, show 'Map not available' gray box.

SECTION 3 — Delivery Confirmation (only if status = 'in_transit'):
  Title: 'Confirm Delivery'.
  Instructions: 'Take a photo of the delivered package as proof.'
  File input: accept='image/*' capture='camera' (on mobile this opens camera directly).
  Preview: if proofFile selected: show small image preview.
  'Confirm Delivery' button (full width, bg-green-700, h-14, text-lg).
  On click:
    If no proofFile: toast.error('Please take a proof photo').
    Else: create FormData, append proof image.
    Call driverService.confirmDelivery(id, formData). Set uploading=true.
    On success: toast.success('Delivery confirmed!') + navigate to /driver.
    On error: toast.error('Failed to confirm. Try again.').

Back button: '← Back' → /driver.
Export default."
```

---

## ADD CHATBOT WIDGET TO APP.JSX

This is critical. The ChatbotWidget must appear on ALL pages. Ask Sunidhi to add it to `App.jsx`:

```jsx
import ChatbotWidget from './components/chatbot/ChatbotWidget';

// Inside App component's return, at the very end (before closing div):
<ChatbotWidget />
```

---

## ADD ROUTES TO APP.JSX

Ask Sunidhi to add your routes to `src/App.jsx`:

```jsx
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminOrders from './pages/admin/AdminOrders';
import Grievances from './pages/admin/Grievances';
import Analytics from './pages/admin/Analytics';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveDelivery from './pages/driver/ActiveDelivery';

// Admin routes (inside ProtectedRoute roles=['admin']):
<Route element={<ProtectedRoute roles={['admin']} />}>
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/users" element={<UserManagement />} />
  <Route path="/admin/orders" element={<AdminOrders />} />
  <Route path="/admin/grievances" element={<Grievances />} />
  <Route path="/admin/analytics" element={<Analytics />} />
</Route>

// Driver routes:
<Route element={<ProtectedRoute roles={['logistics']} />}>
  <Route path="/driver" element={<DriverDashboard />} />
  <Route path="/driver/delivery/:id" element={<ActiveDelivery />} />
</Route>
```

---

## DELIVERABLES CHECKLIST

By Day 3 (chatbot is demo-critical):
- [ ] ChatbotWidget renders and opens correctly (even with mock responses)
- [ ] Chat messages display correctly (user right, bot left)
- [ ] Language toggle works (changes EN/HI label)

By Day 5 (chatbot connected to real API):
- [ ] Chatbot calls Siddhesh's `/ai/chatbot/query` and shows real responses in English
- [ ] Chatbot responds in Hindi when language toggled to HI

By Day 6 (admin complete):
- [ ] All 5 admin pages working with real or mock data
- [ ] Admin stat cards showing platform numbers
- [ ] Grievance resolve flow works end-to-end

By Day 7:
- [ ] Driver dashboard shows assignments
- [ ] Delivery confirmation uploads proof photo
- [ ] Everything tested on mobile (375px viewport)

---

*Task version: 1.0 | Pratham | Kisan Connect SIH 2026*
