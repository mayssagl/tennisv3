# M'Saken Tennis Club — Web Platform

Full-stack management platform for the M'Saken Tennis Club (Msaken, Tunisia).
**React + Vite + Supabase**, role-based (admin / coach / player), in French.

---

## 1. Prerequisites
- Node.js 18+
- A free Supabase project (https://supabase.com)

## 2. Supabase setup
1. Create a project.
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   This creates all tables, the `current_role()` helper, the signup trigger
   (auto-creates a `player` profile), Row Level Security policies, and seed courts.
3. Get your API keys: **Project Settings → API** → copy the *Project URL* and
   the *anon public* key.

## 3. Local setup
```bash
npm install
cp .env.example .env      # then fill in your two Supabase values
npm run dev
```
Open the printed URL (usually http://localhost:5173).

### Flouci integration
1. In Supabase Dashboard → Project Settings → Edge Functions → Secrets, add:
   - `FLOUCI_APP_TOKEN`
   - `FLOUCI_APP_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SITE_URL` (for example `http://localhost:5173`)
2. Deploy the edge functions:
```bash
supabase functions deploy flouci-initiate
supabase functions deploy flouci-verify
```
3. In the Flouci dashboard, enable sandbox mode and whitelist the success/failure redirect URLs (for example `/payment/success` and `/payment/failure` on your frontend origin).

### Production env vars
Vercel or Netlify should receive:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The frontend will call the edge functions through the Supabase client using the current project configuration.

## 4. First admin
Sign up through the app (you'll be a `player` by default), then in the Supabase
SQL editor promote yourself:
```sql
update profiles set role = 'admin' where email = 'you@example.com';
```
Log out / back in and you'll land on `/admin`.

---

## Roles & redirects
| Role   | Lands on  | Can do                                                        |
|--------|-----------|---------------------------------------------------------------|
| admin  | `/admin`  | overview, approve bookings, CRUD courts, manage members, post announcements |
| coach  | `/coach`  | schedule sessions, view their players                         |
| player | `/player` | book a court (pending → admin approval), track bookings, see schedule, edit profile |

Routing guards live in `src/components/ProtectedRoute.jsx`; a logged-in user
hitting the wrong role's URL is redirected to their own dashboard.

## Project structure
```
src/
  lib/supabaseClient.js      Supabase JS client (reads .env)
  context/AuthContext.jsx    session + profile + role, exposes useAuth()
  components/                Logo, Icon set, Navbar, Footer, DashboardShell, ui/
  pages/
    Landing.jsx              public landing page (the design)
    Login.jsx Register.jsx   email/password auth
    admin/  coach/  player/  role dashboards
supabase/schema.sql          schema + RLS + trigger + seed
```

## Key flows
- **Booking** — player picks an available court + date; taken slots are disabled
  in real time; submit creates a `pending` booking; admin approves/rejects;
  status reflects back in *Mes réservations*.
- **Auth** — Supabase email/password. A Postgres trigger inserts a `profiles`
  row with role `player` on signup. RLS uses a `SECURITY DEFINER` `current_role()`
  function to avoid recursive policy evaluation on `profiles`.

## Notes / next steps
- Court/event background images on the landing page are CSS gradients — swap in
  real club photos when ready.
- Flouci is now wired as a server-side payment flow through Supabase Edge Functions.
- For production data-fetching you can layer React Query over the existing
  Supabase calls; the queries are already isolated per page.

## Pre-launch checklist
- [ ] Flouci sandbox credentials configured and tested.
- [ ] Success and failure redirect URLs whitelisted in the Flouci dashboard.
- [ ] `SITE_URL` points to the correct frontend origin in production.
- [ ] RLS policies reviewed for `bookings`, `payments`, `profiles`, and `courts`.
- [ ] Supabase project env vars are set in the hosting platform.
- [ ] CORS and redirect URLs are verified for the deployed frontend.
- [ ] Admin approval flow still works for pending bookings after payment confirmation.
