# EasyRide Admin

Operations console for EasyRide Chakwal. Independent React + TypeScript SPA
that consumes the `easy-ride-backend` REST API — no shared code, no shared
deploy, ships on its own.

**Before you do anything else, read [`BACKEND_REQUIREMENTS.md`](./BACKEND_REQUIREMENTS.md).**
The single highest-priority item is adding `POST /api/admin/auth/login` to
`easy-ride-backend` — without it, this app cannot authenticate at all.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Radix primitives (shadcn-style,
hand-rolled — no CLI dependency) · React Router 7 · TanStack Query 5 ·
TanStack Table · Axios · React Hook Form + Zod · Zustand · react-hot-toast ·
Lucide icons. ApexCharts and Leaflet are installed and ready for the
Analytics and Live Map modules once their backend endpoints exist.

## Getting started

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_API_BASE_URL=/api
```

In dev, `vite.config.ts` proxies `/api/*` to `http://localhost:3000` (your
local `easy-ride-backend`) so you never deal with CORS. If your backend runs
elsewhere, set `VITE_DEV_PROXY_TARGET` before starting the dev server:

```bash
VITE_DEV_PROXY_TARGET=http://localhost:4000 npm run dev
```

```bash
npm run dev       # http://localhost:5173
npm run build     # type-checks with tsc -b, then builds to dist/
npm run preview   # serve the production build locally
npm run lint
```

## Architecture

```
src/
  components/
    ui/          Hand-built shadcn-style primitives (button, card, table,
                  dialog, dropdown-menu, select, tabs, tooltip, ...)
    layout/       Sidebar, Topbar, AppLayout (the authenticated shell)
    common/       ProtectedRoute, ErrorBoundary, StatCard, StatusBadge,
                  EmptyState/QueryErrorState, Pagination, SearchInput,
                  FilterChips, ComingSoonPage
  features/
    auth/         Login page, useAuth hook, api.ts
    dashboard/    Dashboard home, composed from real endpoints only
    drivers/      List, detail, verify/suspend actions
    riders/       List (needs backend), detail (works today)
    rides/        List, detail, force-cancel
    notifications/ Push broadcast (works today)
    settings/      Settings + System health pages
  lib/
    api-client.ts  Axios instance, auth header injection, normalized errors
    query-client.ts TanStack Query defaults
    utils.ts       cn(), formatPKR(), initialsOf(), etc.
    type-guards.ts Runtime guards for the backend's populate-or-string unions
  store/
    authStore.ts   Persisted JWT session (Zustand)
    themeStore.ts  Persisted light/dark preference
  types/           Mirrors easy-ride-backend/types — keep in sync manually
  routes/router.tsx All routes, protected + public
```

### Why some pages show "needs backend endpoint" instead of data

This app never fabricates numbers. Every `features/*/api.ts` file is a
thin, typed wrapper around a real backend route — and I read your actual
route source to write them, not guessed. Where the backend genuinely
doesn't have the data yet (total riders, revenue, analytics, live map),
the UI says so explicitly instead of showing a fake chart. See
`BACKEND_REQUIREMENTS.md` for exactly what to add and in what order — the
frontend is already wired for all of it and needs zero changes once those
routes ship.

### Auth model

`useAuthStore` persists `{ token, admin }` to `localStorage`. Every request
via `apiClient` (in `lib/api-client.ts`) attaches `Authorization: Bearer
<token>`. A 401 response anywhere clears the session and redirects to
`/login`. There is currently one role tier functionally (`admin`, via the
shared `ADMIN_SECRET`) — `admin.role` supports `super_admin`/`admin`/
`support` in the type system already, ready for the day `easy-ride-backend`
gets a real multi-admin model (see BACKEND_REQUIREMENTS.md → "Admins
module").

## Deployment

### Vercel (recommended, matches your backend's likely host)

```bash
npm install -g vercel
vercel
```

`vercel.json` is already set up with an SPA rewrite so client-side routes
(`/drivers/:id`, etc.) don't 404 on refresh. Set `VITE_API_BASE_URL` to
your deployed backend's full URL in Vercel's Environment Variables (e.g.
`https://api.easyridechakwal.com/api`) — remember this must point at an
**absolute** URL in production since there's no dev proxy there.

### Any static host (Netlify, S3+CloudFront, etc.)

```bash
npm run build
```

Upload `dist/`. `public/_redirects` is included for Netlify-style hosts;
for anything else, configure a catch-all rewrite to `index.html` (same
reason as above — client-side routing).

### CORS

Your backend needs to allow requests from wherever this app is hosted.
`easy-ride-backend` doesn't currently set CORS headers on API routes (fine
today since everything is same-origin behind the Next.js server + the dev
proxy). Once this SPA is deployed on its own domain, either:
- put both behind the same domain via a reverse proxy / rewrite, or
- add CORS headers to the Next.js API routes for the admin app's origin.

## What's NOT done yet (by design)

Live Map, Payments, Revenue, Promotions, Analytics, Reports, Support, and
Admins all render a `ComingSoonPage` that lists exactly which backend
endpoint(s) unlock them. This isn't a stub for the sake of a stub — it's
the honest state of the integration, and it's meant to be read by whoever
picks up the backend work next.
