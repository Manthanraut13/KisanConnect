# 📡 KISAN CONNECT — API DOCUMENTATION
## Master API Reference for Frontend and AI Services

**Base URL (Local):** `http://localhost:5000`  
**Base URL (Production):** `https://kisan-connect-api.onrender.com`

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "full_name": "Ramesh Patil",
  "mobile": "9876543210",
  "email": "ramesh@gmail.com",
  "password": "Password@123",
  "role": "farmer",
  "district": "Nashik",
  "state": "Maharashtra",
  "village": "Pimpalgaon Baswant",
  "taluka": "Niphad",
  "land_area_acres": 4.5
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-v4",
      "full_name": "Ramesh Patil",
      "email": "ramesh@gmail.com",
      "mobile": "9876543210",
      "role": "farmer"
    },
    "access_token": "jwt-token-string",
    "refresh_token": "jwt-refresh-token-string"
  }
}
```

---

### 1.2 Login (Password)
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "mobile": "9876543210",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-v4",
      "full_name": "Ramesh Patil",
      "email": "ramesh@gmail.com",
      "mobile": "9876543210",
      "role": "farmer"
    },
    "access_token": "jwt-token",
    "refresh_token": "jwt-refresh-token"
  }
}
```

---

### 1.3 Send OTP
- **Method:** `POST`
- **Path:** `/api/auth/send-otp`
- **Auth Required:** No
- **Request Body:**
```json
{
  "mobile": "9876543210"
}
```

---

### 1.4 Verify OTP & Login
- **Method:** `POST`
- **Path:** `/api/auth/verify-otp`
- **Auth Required:** No
- **Request Body:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

---

### 1.5 Refresh Access Token
- **Method:** `POST`
- **Path:** `/api/auth/refresh-token`
- **Auth Required:** No
- **Request Body:**
```json
{
  "refresh_token": "jwt-refresh-token"
}
```

---

### 1.6 Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Auth Required:** Yes (`Bearer <token>`)

---

## 👤 2. User & Profile Endpoints (`/api/users`)

### 2.1 Get Current User Profile
- **Method:** `GET`
- **Path:** `/api/users/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):** Includes base user info and attached role profile (Farmer/BulkBuyer/Logistics).

### 2.2 Update Profile
- **Method:** `PUT`
- **Path:** `/api/users/me`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "full_name": "Ramesh G. Patil",
  "preferred_lang": "hi"
}
```

### 2.3 Upload Profile Image
- **Method:** `POST`
- **Path:** `/api/users/me/profile-image`
- **Auth Required:** Yes
- **Content-Type:** `multipart/form-data`
- **Field Name:** `image`

---

## 👑 3. Admin Endpoints (`/api/admin`)
*All require `role: admin`*

### 3.1 Platform KPI Stats
- **Method:** `GET`
- **Path:** `/api/admin/stats`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 125,
    "totalFarmers": 80,
    "totalOrders": 340,
    "totalListings": 95,
    "gmv": 154200.00
  }
}
```

### 3.2 List All Users (Paginated)
- **Method:** `GET`
- **Path:** `/api/admin/users?page=1&limit=10&role=farmer&is_active=true`

### 3.3 Toggle User Active Status
- **Method:** `PUT`
- **Path:** `/api/admin/users/:id/status`
- **Request Body:** `{ "is_active": false }`

### 3.4 Broadcast Notification
- **Method:** `POST`
- **Path:** `/api/admin/notifications/broadcast`
- **Request Body:**
```json
{
  "role": "farmer",
  "title": "MSP Update Notification",
  "message": "Government has announced new MSP rates for Tomato and Onion."
}
```

---

## 📢 4. Grievance Redressal Endpoints (`/api/grievances`)

### 4.1 Submit Grievance
- **Method:** `POST`
- **Path:** `/api/grievances`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "order_id": "optional-uuid",
  "category": "logistics",
  "description": "Delivery was not received within the slot."
}
```

### 4.2 List User Grievances
- **Method:** `GET`
- **Path:** `/api/grievances`
- **Auth Required:** Yes

---

## ⚡ 5. Webhook Endpoints (`/api/webhooks`)
*All require `x-webhook-secret: <WEBHOOK_SECRET>` in headers*

- `POST /api/webhooks/refresh-forecasts` — Triggers batch forecast recalculation
- `POST /api/webhooks/order-placed` — Dispatches SMS/Email/Push alerts on order placement
- `POST /api/webhooks/new-grievance` — Auto-triages grievance with Groq LLaMA AI
