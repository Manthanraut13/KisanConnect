# IMPLEMENTATION PLAN — Pratham
## Day-by-Day Build Guide: Admin Dashboard + Chatbot Widget + Driver PWA

---

## PRE-START CHECKLIST

- [ ] Clone GitHub repo: `git clone https://github.com/<org>/kisan-connect.git`
- [ ] Install Node.js 20 LTS from https://nodejs.org
- [ ] Install VS Code + extensions (ES7 React Snippets, Tailwind CSS IntelliSense, Prettier)
- [ ] Get `VITE_API_URL` from Tukesh
- [ ] Confirm Sunidhi's `api.js` and `authStore.js` are pushed to dev branch (wait for Day 1)
- [ ] Confirm Payal's `ProtectedRoute.jsx` is pushed (wait for Day 1)
- [ ] Get demo admin credentials from Manthan (email + password for admin account)
- [ ] Get demo driver credentials from Manthan (for driver PWA testing)

---

## DAY 1 — SETUP + SERVICE FILES + ADMIN LAYOUT

### Step 1: Pull Latest Code

```bash
cd kisan-connect
git pull origin dev
git checkout -b feature/pratham/admin-chatbot-driver
cd frontend
npm install   # Sunidhi already set up the project — just pull
npm run dev   # Should start at http://localhost:3000
```

### Step 2: Create Your Folders

```bash
mkdir -p src/pages/admin src/pages/driver src/components/admin src/components/chatbot
touch src/services/admin.service.js src/services/driver.service.js
touch src/pages/admin/AdminDashboard.jsx
touch src/pages/admin/UserManagement.jsx
touch src/pages/admin/AdminOrders.jsx
touch src/pages/admin/Grievances.jsx
touch src/pages/admin/Analytics.jsx
touch src/pages/driver/DriverDashboard.jsx
touch src/pages/driver/ActiveDelivery.jsx
touch src/components/admin/AdminLayout.jsx
touch src/components/admin/AdminSidebar.jsx
touch src/components/admin/StatCard.jsx
touch src/components/chatbot/ChatbotWidget.jsx
```

### Step 3: Generate Service Files

Use OpenCode prompts from Task.md Module 1 to generate `admin.service.js` and `driver.service.js`.

### Step 4: Generate StatCard Component

Use OpenCode prompt from Task.md Module 2 (StatCard section).

Test StatCard with hardcoded props:
```jsx
// Temporarily add to any page to test:
<StatCard title="Total Users" value={1234} icon={Users} color="bg-blue-100" />
```

### Step 5: Generate AdminSidebar

Use OpenCode prompt from Task.md Module 2 (AdminSidebar section).

To test sidebar in isolation, create a temporary test page:
```jsx
// src/pages/admin/TestAdmin.jsx (delete after testing)
import AdminSidebar from '../../components/admin/AdminSidebar';
const TestAdmin = () => <div className="flex h-screen"><AdminSidebar /></div>;
export default TestAdmin;
```

Add temporary route in App.jsx: `<Route path="/test-admin" element={<TestAdmin />} />`
Open `http://localhost:3000/test-admin` — sidebar should appear on the left.

### Step 6: Generate AdminLayout

Use OpenCode prompt from Task.md Module 2 (AdminLayout section).

**Commit: `feature/pratham/setup-and-admin-layout`**

---

## DAY 2 — ADMIN DASHBOARD + CHATBOT SHELL

### Step 1: Build Admin Dashboard

Use OpenCode prompt from Task.md Module 3.

**Use mock stats while Manthan's API is not ready:**
```javascript
// TEMPORARY — add at top of AdminDashboard.jsx (remove when API ready):
const mockStats = {
  totalUsers: 1247,
  totalFarmers: 342,
  totalOrders: 876,
  totalListings: 519,
  gmv: 2847500
};
// Comment out the adminService.getStats() call and setStats(mockStats) instead
```

**Mock chart data:**
```javascript
const ordersChartData = [
  { day: 'Mon', orders: 18 }, { day: 'Tue', orders: 24 },
  { day: 'Wed', orders: 15 }, { day: 'Thu', orders: 31 },
  { day: 'Fri', orders: 28 }, { day: 'Sat', orders: 42 },
  { day: 'Sun', orders: 35 },
];
const gmvChartData = [
  { day: 'Mon', gmv: 8400 }, { day: 'Tue', gmv: 12300 },
  { day: 'Wed', gmv: 7200 }, { day: 'Thu', gmv: 15600 },
  { day: 'Fri', gmv: 14100 }, { day: 'Sat', gmv: 21000 },
  { day: 'Sun', gmv: 18200 },
];
```

Add route to App.jsx (ask Sunidhi, or do it yourself):
```jsx
<Route path="/admin" element={<AdminDashboard />} />
```

Open `http://localhost:3000/admin` — dashboard should display with charts.

Verify:
- All 4 stat cards visible.
- Both charts render (Recharts BarChart and LineChart).
- Recent Grievances table shows mock data.

### Step 2: Build Chatbot Widget — Part 1 (Shell Only)

This is very important — start it today even if it's just the visual shell.

Use OpenCode prompt from Task.md Module 7, Part 1.

After generating:

Add ChatbotWidget to App.jsx immediately (ask Sunidhi):
```jsx
import ChatbotWidget from './components/chatbot/ChatbotWidget';
// At very end of App's return, before last </div>:
<ChatbotWidget />
```

Open any page → you should see a green floating button in bottom-right corner.
Click it → chat panel should slide/appear open.
Click X → panel closes.
Click EN/HI toggle → text label changes.

**If the panel looks off on mobile:**
Open DevTools → toggle device toolbar → iPhone SE.
Adjust: on mobile the panel should be full width (`w-full`) and take 85% of screen height.

**Commit: `feature/pratham/admin-dashboard-and-chatbot-shell`**

---

## DAY 3 — CHATBOT FULL LOGIC

This is the most important day. Focus entirely on getting the chatbot working.

### Step 1: Generate Chatbot Part 2 (Full Logic)

Use OpenCode prompt from Task.md Module 7, Part 2.

This adds: messages state, sendMessage function, API call to Siddhesh's chatbot endpoint, message bubbles, typing indicator, quick replies.

After generating, carefully merge Part 2 code into Part 1 code. The shell from Part 1 is the outer structure — Part 2 replaces the body content and adds state/functions.

If merging is confusing, use this OpenCode prompt instead to generate the whole thing at once:
```
"Generate the complete ChatbotWidget.jsx combining shell + full chat logic. [Paste both Part 1 and Part 2 prompts from Task.md combined]"
```

### Step 2: Test Chatbot with Mock Response (While Siddhesh's API is not ready)

Add this temporary mock at the start of `sendMessage()`:

```javascript
const sendMessage = async (messageText) => {
  if (!messageText.trim()) return;
  
  // Add user message
  const userMsg = { role: 'user', content: messageText, timestamp: Date.now() };
  setMessages(prev => [...prev, userMsg]);
  setInputValue('');
  setIsTyping(true);
  
  // TEMPORARY MOCK — replace with real API call when Siddhesh's service is ready
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  const mockResponse = language === 'hi'
    ? 'मैं आपकी मदद के लिए यहाँ हूँ! आपको क्या जानकारी चाहिए?'
    : 'I am here to help you! What would you like to know?';
  
  setMessages(prev => [...prev, { role: 'assistant', content: mockResponse, timestamp: Date.now() }]);
  setIsTyping(false);
};
```

### Step 3: Verify All Chatbot Features

Open the app → click the green chat button → test:
- [ ] Chat window opens with greeting message
- [ ] Type a message → Enter → user bubble appears right-aligned (green)
- [ ] Typing indicator (3 bouncing dots) appears while "waiting"
- [ ] Bot response appears left-aligned (white bubble)
- [ ] Quick reply buttons appear below bot response
- [ ] Clicking a quick reply sends that text as a message
- [ ] Scrolls to bottom when new message appears
- [ ] Language toggle switches EN/HI label (and will affect API language field once connected)
- [ ] X button closes the widget
- [ ] On mobile: widget is full-width at bottom of screen

### Step 4: Connect to Real API (When Siddhesh Confirms Deployment)

Replace mock with real API call:

```javascript
// Remove mock code and replace with:
try {
  const conversationHistory = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
  
  const response = await api.post('/ai/chatbot/query', {
    message: messageText,
    language: language,
    user_role: userRole,
    conversation_history: conversationHistory
  });
  
  const botReply = response.data.response;
  setMessages(prev => [...prev, { role: 'assistant', content: botReply, timestamp: Date.now(), is_fallback: response.data.is_fallback }]);
} catch (err) {
  const fallback = language === 'hi'
    ? 'माफ करें, तकनीकी समस्या है। थोड़ी देर बाद प्रयास करें।'
    : 'Sorry, I am having trouble. Please try again in a moment.';
  setMessages(prev => [...prev, { role: 'assistant', content: fallback, timestamp: Date.now(), is_fallback: true }]);
} finally {
  setIsTyping(false);
}
```

Test with real API:
- English: "How do I add a listing?" → should get a helpful response.
- Hindi: "मुझे टमाटर कैसे लिस्ट करने हैं?" → should get a Hindi response.

**Commit: `feature/pratham/chatbot-complete`**

---

## DAY 4 — USER MANAGEMENT + GRIEVANCES PANEL

### Step 1: Build User Management Page

Use OpenCode prompt from Task.md Module 4.

**Mock users for testing:**
```javascript
const mockUsers = [
  { id: '1', full_name: 'Ramesh Patil', mobile: '9876543210', role: 'farmer', district: 'Nashik', is_active: true },
  { id: '2', full_name: 'Priya Sharma', mobile: '9765432109', role: 'consumer', district: 'Pune', is_active: true },
  { id: '3', full_name: 'Rajesh Kumar', mobile: '9654321098', role: 'bulk_buyer', district: 'Amritsar', is_active: false },
];
```

Test the toggle switch: clicking active toggle should visually flip (update local state). Real API call to `PUT /api/admin/users/:id/status` fires but may return 404 until Manthan deploys — that is OK for now.

### Step 2: Build Grievances Panel

Use OpenCode prompt from Task.md Module 5.

**Mock grievances:**
```javascript
const mockGrievances = [
  { id: 'grievance-uuid-1', user: { full_name: 'Priya Sharma' }, category: 'payment', severity: 'high', description: 'Payment was deducted but order not confirmed.', status: 'open', sla_deadline: '2026-09-03' },
  { id: 'grievance-uuid-2', user: { full_name: 'Ramesh Patil' }, category: 'logistics', severity: 'medium', description: 'Driver did not arrive for pickup.', status: 'in_progress', sla_deadline: '2026-09-05' },
  { id: 'grievance-uuid-3', user: { full_name: 'Anita Singh' }, category: 'quality', severity: 'low', description: 'Tomatoes were slightly damaged on delivery.', status: 'resolved', sla_deadline: '2026-09-04' },
];
```

The SLA deadline coloring is an important visual — verify:
- Past deadline + not resolved = red text + AlertCircle icon
- Future deadline = normal text
- Resolved = green status badge

Test the resolve dialog: click "Resolve" → dialog opens → type a note → click "Mark Resolved" → dialog closes → status changes to resolved in the list.

**Commit: `feature/pratham/admin-users-grievances`**

---

## DAY 5 — ADMIN ORDERS + ANALYTICS + DRIVER DASHBOARD

### Step 1: Build Admin Orders Page

Use OpenCode prompt from Task.md Module 6 (Admin Orders).

Quick mock orders:
```javascript
const mockOrders = [
  { id: 'order-uuid-1', buyer: { full_name: 'Priya Sharma' }, total_amount: 220, status: 'delivered', payment_status: 'paid', createdAt: '2026-08-26', items: [{ crop_name: 'Tomato', quantity_kg: 5, price_per_kg: 22 }] },
  { id: 'order-uuid-2', buyer: { full_name: 'Rajesh Kumar' }, total_amount: 94, status: 'in_transit', payment_status: 'paid', createdAt: '2026-08-27', items: [{ crop_name: 'Onion', quantity_kg: 5, price_per_kg: 18 }] },
];
```

### Step 2: Build Analytics Page (Quick)

Use OpenCode prompt from Task.md Module 6 (Analytics). This page uses mock data and charts — it should be straightforward.

### Step 3: Build Driver Dashboard

Use OpenCode prompt from Task.md Module 8.

Mock assignments:
```javascript
const mockAssignments = [
  {
    id: 'assign-1',
    order: { id: 'ORDER-A1', items: [{ crop_name: 'Tomato', quantity_kg: 5 }, { crop_name: 'Onion', quantity_kg: 3 }], total_amount: 164 },
    delivery_location: { full_name: 'Priya Sharma', mobile: '9765432109', full_address: '12 MG Road, Nashik', district: 'Nashik', latitude: 20.01, longitude: 73.79 },
    status: 'assigned',
    estimated_km: 8.2,
    estimated_minutes: 30
  }
];
```

Key to test: "Start Delivery" button changes status to "in_transit" visually (update local state). Real API call may fail until Tukesh's endpoint is ready.

**Commit: `feature/pratham/admin-orders-analytics-driver`**

---

## DAY 6 — ACTIVE DELIVERY VIEW + FULL INTEGRATION

### Step 1: Build Active Delivery View

Use OpenCode prompt from Task.md Module 8 (ActiveDelivery).

**Install Leaflet CSS** (if not already done):
In `src/main.jsx`, add: `import 'leaflet/dist/leaflet.css';`

Fix marker icon issue (same as Sunidhi did — ask her for the fix if needed).

Test the map with hardcoded coordinates: `latitude: 20.01, longitude: 73.79` (Nashik area).

**Camera access test:**
On mobile (or Chrome DevTools device simulation):
- The file input with `capture="camera"` should open the camera directly.
- On desktop: it opens a regular file picker.

### Step 2: Connect All APIs to Real Backend

Now that Manthan and Tukesh have their APIs deployed, replace all mock data with real API calls:

**Admin Dashboard:**
```javascript
useEffect(() => {
  const load = async () => {
    try {
      const [statsRes, grievancesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getGrievances({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentGrievances(grievancesRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };
  load();
}, []);
```

Do the same for User Management, Grievances, Orders.

### Step 3: Test Admin Login

```
1. Go to http://localhost:3000/login
2. Login with admin credentials (get from Manthan — typically mobile: 9000000000, password: Admin@123)
3. After login, navigate to http://localhost:3000/admin
4. Should see Admin Dashboard without redirect
```

If redirected: the ProtectedRoute is blocking admin access — check that admin account has role = 'admin' in DB.

### Step 4: Test Chatbot Language Switch

1. Open chatbot widget (floating button).
2. Type: "What is the price of tomato today?"
3. Verify English response.
4. Click "HI" toggle.
5. Type: "मुझे अपना ऑर्डर ट्रैक करना है"
6. Verify Hindi response from Siddhesh's Groq-powered chatbot.

**Commit: `feature/pratham/active-delivery-and-integration`**

---

## DAY 7 — MOBILE TESTING + FINAL POLISH + PR

### Step 1: Test Everything on Mobile

Open Chrome DevTools → F12 → Toggle Device Toolbar → iPhone SE (375×667).

Checklist:
- [ ] Admin Dashboard: Stat cards stacked (2 per row), charts readable
- [ ] User Management: Table scrollable horizontally on mobile
- [ ] Grievances: Cards readable, action button accessible
- [ ] **Chatbot Widget: Full-width on mobile, large input field, send button accessible**
- [ ] Driver Dashboard: Large buttons (easy to tap), readable address
- [ ] Active Delivery: Camera input works, confirm button large and green

### Step 2: Fix Common Mobile Issues

If buttons are too small: add `min-h-12 text-base` Tailwind classes.
If text is cut off: add `truncate` or `text-sm` Tailwind classes.
If table overflows: wrap in `<div className="overflow-x-auto">`.

### Step 3: Demo Test — Chatbot for Judges

Practice this exact chatbot demo flow for SIH judges:

1. Open any page (e.g., Home).
2. Click the green floating Kisan Mitra button.
3. Chat window opens with greeting.
4. Type: "How do I list my tomatoes?"
5. Wait for response → show to judges.
6. Click "HI" toggle.
7. Type: "मुझे टमाटर की कीमत बताओ" (Tell me tomato price).
8. Wait for Hindi response → show to judges.
9. Click a quick reply button.
10. Close the chat.

This should be smooth, fast, and impressive.

### Step 4: Create Pull Request

```bash
git add .
git commit -m "feat: complete admin dashboard, chatbot widget, and driver PWA"
git push origin feature/pratham/admin-chatbot-driver
```

Create PR on GitHub:
- Base: `dev`
- Compare: `feature/pratham/admin-chatbot-driver`
- Title: `[Pratham] Admin Dashboard + Kisan Mitra Chatbot + Driver PWA`
- Description: list all pages completed, note that chatbot works in EN and HI

Ask Manthan to review and merge.

---

## COMMIT SCHEDULE

| Day | Commit Target |
|---|---|
| Day 1 | Service files + AdminSidebar + AdminLayout + StatCard |
| Day 2 | Admin Dashboard (mock data) + Chatbot widget shell |
| Day 3 | Chatbot full logic — mock response then real API |
| Day 4 | User Management + Grievances Panel |
| Day 5 | Admin Orders + Analytics + Driver Dashboard |
| Day 6 | Active Delivery view + all real API connections |
| Day 7 | Mobile polish + full demo test + PR to dev |

---

## IMPORTANT NOTES FOR PRATHAM

1. **Start with the chatbot** — it is the most impressive feature for judges. Even if admin pages have mock data, chatbot must work with real AI.

2. **Get Siddhesh's Railway URL early** — without it, the chatbot shows fallback messages. Ask Siddhesh to share as soon as possible (Day 3-4).

3. **Admin login credentials** — get from Manthan. The admin dashboard will not be accessible without a user with `role = 'admin'` in the database.

4. **Driver login credentials** — get from Manthan (seed data). The driver pages need a user with `role = 'logistics'`.

5. **The chatbot widget is visible on ALL pages** — so if it breaks, it breaks the whole app's impression. Test it thoroughly.

---

*Implementation Plan v1.0 | Pratham | Kisan Connect SIH 2026*
