# Backend Requirements for EasyRide Admin

This document lists every gap between what `easyride-admin` needs and what
`easy-ride-backend` currently exposes. Everything here was verified by
reading the actual route source you gave me — nothing is guessed. The admin
app is fully wired against all of this already; each item below "lights up"
automatically the moment the endpoint exists, with zero frontend changes.

None of these require modifying existing files in a breaking way. Every
one is either a **new file** or a **small additive check** in an existing
file (clearly marked).

---

## 🔴 P0 — Blocks the entire app

### 1. `POST /api/admin/auth/login` — issue an admin JWT

**Problem:** Your only admin auth today is `POST /api/admin/login`, which
sets an `httpOnly` cookie for the server-rendered `/admin/*` pages. It
returns a redirect, not JSON, and the cookie is useless to a separate SPA on
a different origin. Every JSON API route that requires `role: 'admin'`
(`GET /api/drivers`, `GET /api/rides`, `POST /api/notifications`, etc.)
checks a **Bearer JWT** via `requireAuth()` — and nothing issues that JWT
for an admin today.

**Fix — new file, doesn't touch anything existing:**

```ts
// app/api/admin/auth/login/route.ts
import { NextRequest } from 'next/server';
import { signToken } from '@/lib/auth';
import { ok, unauthorized, badRequest } from '@/lib/response';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { secret } = body;

  if (!secret) return badRequest('Password required');
  if (secret !== process.env.ADMIN_SECRET) return unauthorized('Invalid password');

  const token = signToken({ userId: 'admin', phone: 'admin', role: 'admin' });

  return ok(
    { token, admin: { name: 'Admin', role: 'admin' } },
    'Login successful'
  );
}
```

One more thing: `middleware.ts` currently requires a `Bearer` token on
**every** `/api/*` route except `PUBLIC_ROUTES`. Add this new route to that
list so the login call itself doesn't get blocked:

```ts
// middleware.ts — add one string to the existing array
const PUBLIC_ROUTES = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/health',
  '/api/admin/auth/login', // ← add this line
];
```

This reuses your existing `ADMIN_SECRET` env var and `signToken()` helper —
no new secrets, no new dependencies, no change to rider/driver auth.

**Security note for later:** this gives every admin the same shared
password and the same JWT identity ("admin"/"admin"). Fine to ship with,
but see the "Admins" module below for the real fix (per-person accounts).

---

## 🟠 P1 — Whole modules are empty without these

### 2. `GET /api/riders` — list riders

**Problem:** `app/api/riders/[id]/route.ts` only has `GET`/`PATCH` for a
single rider. There's no list route, so the Riders table has nothing to
page through.

**Fix — new file**, modeled exactly on your existing `GET /api/drivers`
(same auth pattern, same response shape):

```ts
// app/api/riders/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import { User } from '@/models/User';
import { ok, unauthorized, serverError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    let auth;
    try {
      auth = requireAuth(req);
    } catch {
      return unauthorized();
    }
    if (auth.role !== 'admin') return unauthorized('Sirf admin dekh sakta hai');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [riders, total] = await Promise.all([
      User.find(query).select('-fcmToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);

    return ok({ riders, total, page, limit });
  } catch (err) {
    return serverError(err);
  }
}
```

### 3. Admin force-cancel a ride

**Problem:** `app/api/rides/[id]/cancel/route.ts` only authorizes the
ride's own rider or assigned driver:

```ts
const isRider = auth.role === 'rider' && riderId === auth.userId;
const isDriver = auth.role === 'driver' && driverId === auth.userId;
if (!isRider && !isDriver) return unauthorized('Is ride ko cancel karne ka haq nahi');
```

An admin JWT gets a 401 here today.

**Fix — one-line additive change** to the existing check:

```ts
const isAdmin = auth.role === 'admin';
if (!isRider && !isDriver && !isAdmin) return unauthorized('Is ride ko cancel karne ka haq nahi');
```

### 4. Dashboard aggregate stats (optional but recommended)

**Problem:** none of this. The admin dashboard currently gets counts by
calling `GET /api/drivers` and `GET /api/rides` several times with
different status filters and reading `total` from each — that works (it's
what `easyride-admin` does today) but it's N requests instead of 1, and it
can't answer "today's rides" or "this week's revenue" at all since those
routes have no date filtering.

**Recommended fix** — one aggregate endpoint, modeled on the queries
already written in `app/admin/page.tsx` and `app/admin/revenue/page.tsx`
(just move that logic into a JSON route):

```
GET /api/admin/stats
→ { totalRiders, totalDrivers, onlineDrivers, pendingDrivers,
    totalRides, todayRides, activeRides, todayRevenue, platformFee }

GET /api/admin/stats/revenue?range=today|week|month
→ { revenue, rideCount, dailyBreakdown: [{ date, revenue, count }] }
```

---

## 🟡 P2 — Individual features, not blocking

| Feature | What's needed |
|---|---|
| **Live Map** | Nothing new required server-side — driver locations already stream to Firebase RTDB at `drivers/{id}/location`. Fastest path: read that directly from the browser with the Firebase Web SDK (same `NEXT_PUBLIC_FIREBASE_*` config already in your `.env`), gated by RTDB security rules that allow admin reads. Alternative: a `GET /api/admin/live/drivers` snapshot route if you'd rather not expose RTDB to the browser. |
| **Revenue page** | Same data `app/admin/revenue/page.tsx` already computes — just needs a JSON route (see #4 above). |
| **Analytics** (trips/day, driver growth, cancellation rate, peak hours, heatmap) | New aggregation routes, e.g. `GET /api/admin/stats/trips?groupBy=day`. None of this exists in any form yet. |
| **Reports export** (PDF/Excel/CSV) | `GET /api/admin/reports/export?format=csv` — no export logic exists yet. |
| **Payments module** | Per your own README, JazzCash/EasyPaisa integration is explicitly "skipped for now." Nothing to wire until that's built. |
| **Promotions** | No promo/coupon model exists in `models/`. Needs a new schema + CRUD routes. |
| **Support tickets** | No support model exists. Needs a new schema + CRUD routes. |
| **Admins module / per-person accounts** | Right now there is exactly one admin identity (the shared `ADMIN_SECRET`). A real "Admins" page (invite teammates, see who did what) needs an `Admin` model with roles (`super_admin`/`admin`/`support`) and its own auth, replacing the single shared password from item #1. |
| **Editable fare/commission settings** | `lib/fare.ts` constants and the `0.15` commission in `complete/route.ts` + `admin/revenue/page.tsx` are hardcoded. Making them editable from the dashboard means moving them into a DB-backed config doc plus a `GET/PUT /api/admin/config` route. |
| **System health for Firebase/FCM** | `GET /api/health` today only checks Mongo. A fuller check would ping `adminDB.ref('.info/connected')` and optionally send a no-op FCM dry-run. |

---

## ✅ Already works today — no backend changes needed

Confirmed by reading the source, not assumed:

- `GET /api/drivers` — list, search, status filter, pagination (admin-only)
- `GET /api/drivers/:id`, `PATCH /api/drivers/:id`
- `POST /api/drivers/:id/verify` — approve/reject/suspend/unsuspend
- `GET /api/rides` — **for `role: 'admin'` this returns ALL rides**, because
  the route's `if (role === 'rider')` / `else if (role === 'driver')`
  branches simply don't match `'admin'`, leaving the query unfiltered. This
  isn't documented anywhere in the backend but it's real and it's how the
  Trips module works today.
- `GET /api/rides/:id` — admin explicitly allowed in the authorization check
- `GET /api/riders/:id`, `PATCH /api/riders/:id`
- `POST /api/notifications` — broadcast to all_riders / all_drivers /
  everyone / specific
- `GET /api/health` — basic backend + Mongo status

---

## Suggested order of work

1. **#1 (admin login)** — nothing else works without it. ~15 minutes.
2. **#3 (force-cancel)** — one line.
3. **#2 (riders list)** — unblocks the whole Riders module.
4. **#4 (stats aggregate)** — replaces the N-request dashboard with 1 fast
   call; also unblocks Revenue.
5. Everything in P2, roughly in the order your business needs it.
