# 🔐 KISAN CONNECT — Environment Variables Setup Guide
## Complete Step-by-Step Instructions to Get All API Keys & Credentials

---

## 📋 QUICK START CHECKLIST

Copy this file and check off as you complete each service:

- [ ] 1. JWT Secrets (generate locally)
- [ ] 2. Supabase (PostgreSQL Database)
- [ ] 3. Upstash (Redis Cache)
- [ ] 4. Cloudinary (Image Storage)
- [ ] 5. Razorpay (Payment Gateway)
- [ ] 6. MSG91 (SMS/OTP Service)
- [ ] 7. Gmail App Password (Email Service)
- [ ] 8. Firebase (Push Notifications)
- [ ] 9. Groq API (AI Chatbot)
- [ ] 10. Google Maps API (Optional for maps)
- [ ] 11. OpenRouteService (Route Optimization)
- [ ] 12. Webhook Secret (generate locally)

**Estimated Time:** 40-50 minutes total

---

## 🔑 1. JWT SECRETS (5 minutes)

### Generate Random Secrets Locally

**Option A — PowerShell (Windows):**
```powershell
# In PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
Run this **twice** to get two different secrets.

**Option B — Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C — Online Generator:**
Go to: https://randomkeygen.com/
Use "Fort Knox Passwords" — copy two different ones.

**What to copy:**
```env
JWT_SECRET=<paste 32+ char random string here>
JWT_REFRESH_SECRET=<paste different 32+ char random string here>
```

---

## 🗄️ 2. SUPABASE — PostgreSQL Database (FREE, 10 minutes)

### Step 1: Sign Up
1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if required

### Step 2: Create Project
1. Click **"New Project"**
2. **Organization**: Create new → Name: `Kisan Connect`
3. **Project Name**: `kisan-connect-db`
4. **Database Password**: Generate a strong password (SAVE THIS!)
5. **Region**: Choose **Mumbai (ap-south-1)** or closest to you
6. **Pricing Plan**: **Free** (500MB database, 500MB storage)
7. Click **"Create new project"** (takes 1-2 minutes)

### Step 3: Get Connection Details
1. Go to **Settings** (gear icon) → **Database**
2. Scroll to **"Connection string"** section
3. Select **URI** tab
4. Copy the **full connection string** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. **Replace `[YOUR-PASSWORD]` with the password you set in Step 2**

### Step 4: Get API Keys
1. Go to **Settings** → **API**
2. Copy these three values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

**What to copy:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

## 🔴 3. UPSTASH — Redis Cache (FREE, 5 minutes)

### Step 1: Sign Up
1. Go to: https://upstash.com
2. Click **"Get Started"** or **"Login"**
3. Sign in with **GitHub** or email

### Step 2: Create Redis Database
1. Click **"Create database"**
2. **Name**: `kisan-connect-cache`
3. **Type**: Regional
4. **Region**: Choose **ap-south-1 (Mumbai)** or closest
5. **Eviction**: No eviction
6. Click **"Create"**

### Step 3: Get Connection Details
1. In your database dashboard, scroll to **"REST API"** section
2. Copy these two values:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**
3. Also copy the **Redis URL** (starts with `rediss://`)

**What to copy:**
```env
UPSTASH_REDIS_REST_URL=https://xxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REDIS_URL=rediss://default:xxxxxxxxxxxxx@xxxxxx.upstash.io:6379
```

---

## ☁️ 4. CLOUDINARY — Image Storage (FREE, 10 minutes)

### Step 1: Sign Up
1. Go to: https://cloudinary.com/users/register/free
2. Fill in details and sign up (use your real email)
3. Verify email

### Step 2: Get Credentials
1. After login, you'll see the **Dashboard**
2. Under **"Account Details"**, you'll find:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click "eye" icon to reveal)

**What to copy:**
```env
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
```

**Free Tier Limits:** 25 credits/month (enough for 25GB bandwidth + 25GB storage)

---

## 💳 5. RAZORPAY — Payment Gateway (FREE TEST MODE, 10 minutes)

### Step 1: Sign Up
1. Go to: https://dashboard.razorpay.com/signup
2. Sign up with email or Google
3. **Business Details:**
   - Business Name: `Kisan Connect`
   - Business Type: `Individual / Proprietorship`
   - Category: `Agriculture`

### Step 2: Switch to Test Mode
1. After login, in the top-left corner, you'll see a toggle
2. Switch to **"Test Mode"** (it's free and unlimited)

### Step 3: Generate API Keys
1. Go to **Settings** (gear icon) → **API Keys**
2. Click **"Generate Test Key"** (or it's already generated)
3. Copy:
   - **Key Id** (starts with `rzp_test_`)
   - **Key Secret** (click "eye" icon to reveal)

### Step 4: Get Webhook Secret
1. Go to **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. **Webhook URL**: `https://your-backend-url.onrender.com/api/webhooks/razorpay` (you'll update this after deployment)
4. **Active Events**: Select `payment.captured`, `payment.failed`, `refund.created`
5. Click **"Create Webhook"**
6. Copy the **"Secret"** shown on the next screen

**What to copy:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📱 6. MSG91 — SMS/OTP Service (FREE 10 SMS/day, 15 minutes)

### Step 1: Sign Up
1. Go to: https://msg91.com/signup
2. Sign up with email and verify
3. Add your mobile number and verify via OTP

### Step 2: Get Auth Key
1. After login, go to **"API"** section in the left sidebar
2. Click **"Auth Key"**
3. Copy the **Auth Key** (long alphanumeric string)

### Step 3: Create SMS Template (Required by TRAI)
1. Go to **"Manage"** → **"Templates"**
2. Click **"Create Template"**
3. Template details:
   - **Template Name**: `Kisan Connect OTP`
   - **Template Type**: `Transactional`
   - **Template Category**: `OTP`
   - **Template Content**: `Your Kisan Connect OTP is {#var#}. Valid for 10 minutes. Do not share.`
   - **Entity ID**: (auto-filled or leave blank for test)
4. Click **"Submit"**
5. **Wait for approval** (usually instant for OTP templates)
6. Once approved, copy the **Template ID**

### Step 4: Set Sender ID
1. Go to **"Manage"** → **"Sender ID"**
2. Default sender ID is usually `MSGIND` for test mode
3. For production, you need to register a 6-letter sender ID (e.g., `KISNCT`)
4. Use `MSGIND` for now

**What to copy:**
```env
MSG91_AUTH_KEY=123456AaBbCcDdEeFfGgHhIi123456
MSG91_TEMPLATE_ID=1234567890abcdef12345678
MSG91_SENDER_ID=MSGIND
```

**Free Tier:** 10 SMS/day (enough for testing)

---

## 📧 7. GMAIL APP PASSWORD — Email Service (FREE, 5 minutes)

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Scroll to **"How you sign in to Google"**
3. Click **"2-Step Verification"**
4. If not enabled, click **"Get Started"** and follow steps
5. Verify with your phone

### Step 2: Generate App Password
1. Go back to: https://myaccount.google.com/security
2. Under **"2-Step Verification"**, click **"App passwords"**
3. **Select app**: Mail
4. **Select device**: Other (Custom name)
5. Enter: `Kisan Connect Backend`
6. Click **"Generate"**
7. Copy the **16-character password** shown (format: `xxxx xxxx xxxx xxxx`)

**What to copy:**
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdabcdabcdabcd
```

**Note:** Remove spaces from the app password when pasting.

---

## 🔔 8. FIREBASE — Push Notifications (FREE, 15 minutes)

### Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com
2. Click **"Add project"**
3. **Project name**: `Kisan Connect`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Add Web App
1. In the project dashboard, click the **web icon (</> )** to add a web app
2. **App nickname**: `Kisan Connect Web`
3. Do NOT check "Firebase Hosting"
4. Click **"Register app"**

### Step 3: Enable Cloud Messaging
1. In left sidebar, click **"Build"** → **"Cloud Messaging"**
2. Click **"Get Started"** if prompted

### Step 4: Get Server Key
1. Click the **gear icon** (Settings) → **"Project settings"**
2. Go to **"Cloud Messaging"** tab
3. Scroll down to **"Cloud Messaging API (Legacy)"**
4. Copy the **"Server key"**

### Step 5: Get Service Account Key
1. Still in **"Project settings"**, go to **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** (downloads a JSON file)
4. Open the JSON file and copy:
   - `project_id`
   - `client_email`
   - `private_key` (entire string including `\n` characters)

**What to copy:**
```env
FIREBASE_PROJECT_ID=kisan-connect-xxxxx
FIREBASE_SERVER_KEY=AAAAxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kisan-connect-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the quotes around `FIREBASE_PRIVATE_KEY` and preserve all `\n` characters.

---

## 🤖 9. GROQ API — AI Chatbot (FREE 14,400 requests/day, 5 minutes)

### Step 1: Sign Up
1. Go to: https://console.groq.com
2. Click **"Sign Up"**
3. Sign in with **GitHub** or **Google**

### Step 2: Create API Key
1. After login, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. **Name**: `Kisan Connect Backend`
4. Click **"Create"**
5. **Copy the key immediately** (shown only once)

**What to copy:**
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Free Tier:** 14,400 requests/day (enough for prototype)

---

## 🗺️ 10. GOOGLE MAPS API (Optional, $200 Free Credit/month, 10 minutes)

### Step 1: Create Google Cloud Project
1. Go to: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. **Project name**: `Kisan Connect`
4. Click **"Create"**

### Step 2: Enable Billing
1. Click **"Billing"** in the left menu
2. Click **"Link a billing account"**
3. Create new billing account (requires credit card, but won't be charged)
4. Link it to your project

### Step 3: Enable APIs
1. Go to **"APIs & Services"** → **"Library"**
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Directions API**

### Step 4: Create API Key
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API key"**
3. Copy the key immediately
4. Click **"Restrict Key"** for security
5. Under **"API restrictions"**, select the 3 APIs you enabled
6. Click **"Save"**

**What to copy:**
```env
GOOGLE_MAPS_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Free Tier:** $200 credit/month (enough for 28,000+ map loads)

---

## 🚗 11. OPENROUTESERVICE — Route Optimization (FREE 2000 req/day, 5 minutes)

### Step 1: Sign Up
1. Go to: https://openrouteservice.org/dev/#/signup
2. Fill in details and sign up
3. Verify email

### Step 2: Create Token
1. After login, go to: https://openrouteservice.org/dev/#/home
2. Click **"Request a token"** or go to **"Tokens"** tab
3. **Token name**: `Kisan Connect`
4. Click **"Create token"**
5. Copy the token

**What to copy:**
```env
ORS_API_KEY=5b3ce3597851110001cf6248xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Free Tier:** 2000 requests/day, 40 requests/minute

---

## 🔐 12. WEBHOOK SECRET — For External Integrations (2 minutes)

This is a security token to verify webhook calls from external services (like n8n, Zapier, or custom scripts).

### Generate Secret
Use the **same method from JWT Secrets section** (Step 1):

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**What to copy:**
```env
WEBHOOK_SECRET=<your generated 32+ char random string>
```

This will be used in the `x-webhook-secret` header when external services call your webhook endpoints (like `/api/webhooks/refresh-forecasts`).

---

## ✅ FINAL .env FILE

After collecting all credentials, create `backend/.env` file:

```env
# ===== SERVER CONFIG =====
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# ===== JWT =====
JWT_SECRET=<your generated 32+ char string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<your generated different 32+ char string>
JWT_REFRESH_EXPIRES_IN=30d

# ===== DATABASE (Supabase PostgreSQL) =====
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== REDIS (Upstash) =====
UPSTASH_REDIS_REST_URL=https://xxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REDIS_URL=rediss://default:xxxxxxxxxxxxx@xxxxxx.upstash.io:6379

# ===== CLOUDINARY =====
CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890

# ===== PAYMENT (Razorpay) =====
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# ===== SMS (MSG91) =====
MSG91_AUTH_KEY=123456AaBbCcDdEeFfGgHhIi123456
MSG91_TEMPLATE_ID=1234567890abcdef12345678
MSG91_SENDER_ID=MSGIND

# ===== EMAIL (Gmail SMTP) =====
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdabcdabcdabcd

# ===== FIREBASE (Push Notifications) =====
FIREBASE_PROJECT_ID=kisan-connect-xxxxx
FIREBASE_SERVER_KEY=AAAAxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@kisan-connect-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"

# ===== GOOGLE APIS (Optional) =====
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_MAPS_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===== AI SERVICES =====
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=
AI_SERVICE_URL=http://localhost:8000

# ===== BHASHINI (Optional — Government API) =====
BHASHINI_USER_ID=
BHASHINI_API_KEY=

# ===== GOVERNMENT APIS (Optional) =====
AGMARKNET_API_KEY=
ENAM_API_KEY=

# ===== OPEN ROUTING =====
ORS_API_KEY=5b3ce3597851110001cf6248xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ===== WEBHOOK SECURITY =====
WEBHOOK_SECRET=<your generated 32+ char string>

# ===== APP SECRETS =====
OTP_EXPIRY_MINUTES=10
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
```

---

## 🧪 TEST YOUR SETUP

After creating the `.env` file, test if everything works:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
✅ Models synced
✅ Server running on port 5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"success":true,"message":"Kisan Connect API is running","timestamp":"2026-09-05T..."}
```

---

## 🆘 TROUBLESHOOTING

**Database connection fails:**
- Double-check `DATABASE_URL` has the correct password
- Ensure Supabase project is in "Active" state (not paused)

**Redis connection fails:**
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check if Upstash database is active

**SMS not sending:**
- MSG91 free tier has only 10 SMS/day
- Check if template is approved
- Verify mobile number format (no country code needed for Indian numbers)

**Firebase push notification fails:**
- Ensure `FIREBASE_PRIVATE_KEY` is wrapped in double quotes
- Check all `\n` characters are preserved

---

## 📤 SHARE WITH TEAM

After you've set up your credentials, create a **secure shared document** (Google Doc with restricted access) and share:
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- `CLOUDINARY_*` credentials
- `JWT_SECRET` and `JWT_REFRESH_SECRET`

**DO NOT commit `.env` to GitHub. It's already in `.gitignore`.**

---

**Guide Version:** 1.0  
**Last Updated:** 2026-09-05  
**Estimated Total Time:** 45-60 minutes
