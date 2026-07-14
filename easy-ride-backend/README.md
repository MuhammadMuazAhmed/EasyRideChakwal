# Easy Ride Chakwal — Backend

Next.js + TypeScript backend for Easy Ride Chakwal ride-sharing app.

## Quick Setup

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your actual keys (see below)
npm run dev
```

Server runs at `http://localhost:3000`. Test it: `http://localhost:3000/api/health`

Admin dashboard: `http://localhost:3000/admin` (login with `ADMIN_SECRET` from `.env.local`)

---

## Accounts You Need to Create

### 1. MongoDB Atlas (Database) — Required
- Go to mongodb.com/cloud/atlas → Sign up free
- Create a free M0 cluster (sufficient for Chakwal scale)
- Database Access → Add new database user → note username/password
- Network Access → Add IP `0.0.0.0/0` (allow from anywhere — needed for Vercel)
- Connect → Drivers → copy connection string
- Paste into `.env.local` as `MONGODB_URI`

### 2. Firebase (Real-time, Push, Auth) — Required
- Go to console.firebase.google.com → Create project → name it `easy-ride-chakwal`
- Enable **Realtime Database** (not Firestore) → choose a region close to Pakistan (asia-southeast1 / Singapore)
- Project Settings (gear icon) → General tab → scroll to "Your apps" → Add app → Web → copy the config values into `.env.local` (the `NEXT_PUBLIC_FIREBASE_*` keys)
- Project Settings → Service Accounts tab → Generate new private key → downloads a JSON file
  - Open that JSON file, copy `project_id` → `FIREBASE_PROJECT_ID`
  - Copy `client_email` → `FIREBASE_CLIENT_EMAIL`
  - Copy `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters exactly as they appear)
- Enable **Cloud Messaging** (for push notifications) — no extra setup needed, just enabled by default

### 3. Twilio (SMS OTP) — Required
- Go to twilio.com → Sign up (free trial gives you credit)
- Console Dashboard → copy `Account SID` → `TWILIO_ACCOUNT_SID`
- Copy `Auth Token` → `TWILIO_AUTH_TOKEN`
- Get a phone number: Phone Numbers → Buy a number (or use trial number) → `TWILIO_PHONE_NUMBER`
- Note: Twilio trial accounts can only send SMS to verified numbers. Verify your own + your 20 drivers' numbers in Twilio Console → Verified Caller IDs, or upgrade to a paid account (~$20 minimum) before public launch.

### 4. Admin Secret — Required (you create this yourself)
- Just pick any strong password
- Put it in `.env.local` as `ADMIN_SECRET`
- This is what you use to log into `/admin`

### 5. JWT Secret — Required (you generate this yourself)
- Run this to generate a secure random string:
  ```bash
  openssl rand -hex 32
  ```
- Paste the output into `.env.local` as `JWT_SECRET`

---

## Skipped For Now (add later)
- JazzCash merchant account — needed only when you enable digital payments
- EasyPaisa merchant account — same as above
- NADRA Verisys API access — for MVP, verify CNICs manually via id.nadra.gov.pk/e-verisys and mark driver as verified in admin panel

---

## Project Structure

```
app/
  api/              ← All REST API endpoints
    auth/           ← OTP send/verify
    rides/          ← Ride lifecycle (create, accept, start, complete, cancel, rate, chat, sos)
    drivers/        ← Driver registration, verification, location, status, nearby search
    riders/         ← Rider profile management
    fare/           ← Fare calculation
    notifications/  ← Push notification broadcast
  admin/            ← Admin web dashboard (server-rendered pages)
lib/                ← Shared utilities (db, firebase, auth, fare engine, fcm, otp)
models/             ← MongoDB schemas (User, Driver, Ride, OTP)
types/              ← Shared TypeScript types (keep in sync with mobile app)
middleware.ts       ← Auth + admin route protection
```

---

## Connecting Your React Native App

In your mobile app, set the API base URL:

```typescript
// src/config/api.ts (or wherever your axios instance is)
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3000/api'   // e.g. http://192.168.1.5:3000/api — use your PC's LAN IP, not localhost, so your phone can reach it
  : 'https://your-deployed-backend.vercel.app/api';
```

All protected routes need this header:

```typescript
headers: {
  Authorization: `Bearer ${token}`,
}
```

---

## Deployment (Vercel — Free)

```bash
npm install -g vercel
vercel login
vercel
```

Then add all your `.env.local` variables in Vercel Dashboard → Project → Settings → Environment Variables. Redeploy after adding them.

---

## Testing Endpoints Quickly

```bash
# Health check
curl http://localhost:3000/api/health

# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"03001234567","role":"rider"}'

# Verify OTP (check your phone for the code)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"03001234567","otp":"123456","role":"rider","firstName":"Test","lastName":"User"}'
```
