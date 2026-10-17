-- ============================================================================
-- M'SAKEN TENNIS CLUB — Supabase schema + Row Level Security
-- Run this in the Supabase SQL Editor (one shot). Order matters.
-- ============================================================================

-- ---- ENUM TYPES ----------------------------------------------------------
create type user_role      as enum ('admin', 'coach', 'player');
create type court_status    as enum ('available', 'maintenance');
create type booking_status  as enum ('pending', 'approved', 'rejected', 'cancelled');

-- ---- TABLES --------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        user_role not null default 'player',
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now()
);

create table courts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text default 'clay',          -- clay | hard | indoor ...
  status      court_status not null default 'available',
  description text,
  created_at  timestamptz not null default now()
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  court_id    uuid not null references courts(id) on delete cascade,
  player_id   uuid not null references profiles(id) on delete cascade,
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  status      booking_status not null default 'pending',
  created_at  timestamptz not null default now()
);

create table sessions (
  id          uuid primary key default gen_random_uuid(),
  coach_id    uuid not null references profiles(id) on delete cascade,
  player_id   uuid references profiles(id) on delete set null,
  court_id    uuid references courts(id) on delete set null,
  date        date not null,
  time        time not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create table payments (
  id          uuid primary key default gen_random_uuid(),
  payment_id  text unique,
  booking_id  uuid references bookings(id) on delete cascade,
  player_id   uuid not null references profiles(id) on delete cascade,
  amount      numeric(10,2) not null,
  status      text default 'pending',       -- pending | paid | failed | refunded
  flouci_ref  text,
  created_at  timestamptz not null default now()
);

create table announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---- HELPER: current user's role (SECURITY DEFINER avoids RLS recursion) --
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---- AUTO-CREATE PROFILE ON SIGNUP ---------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'player'                           -- default role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles      enable row level security;
alter table courts        enable row level security;
alter table bookings      enable row level security;
alter table sessions      enable row level security;
alter table payments      enable row level security;
alter table announcements enable row level security;

-- PROFILES ------------------------------------------------------------------
create policy "profiles readable by authenticated"
  on profiles for select to authenticated using (true);
create policy "users update own profile"
  on profiles for update to authenticated using (id = auth.uid());
create policy "admins update any profile"
  on profiles for update to authenticated using (public.current_role() = 'admin');

-- COURTS --------------------------------------------------------------------
create policy "courts readable by authenticated"
  on courts for select to authenticated using (true);
create policy "admins manage courts"
  on courts for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- BOOKINGS ------------------------------------------------------------------
create policy "players read own bookings"
  on bookings for select to authenticated
  using (player_id = auth.uid() or public.current_role() = 'admin');
create policy "players create own bookings"
  on bookings for insert to authenticated
  with check (player_id = auth.uid());
create policy "players cancel own bookings"
  on bookings for update to authenticated
  using (player_id = auth.uid());
create policy "admins manage bookings"
  on bookings for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- SESSIONS ------------------------------------------------------------------
create policy "session participants read"
  on sessions for select to authenticated
  using (coach_id = auth.uid() or player_id = auth.uid() or public.current_role() = 'admin');
create policy "coaches manage own sessions"
  on sessions for all to authenticated
  using (coach_id = auth.uid() or public.current_role() = 'admin')
  with check (coach_id = auth.uid() or public.current_role() = 'admin');

-- PAYMENTS ------------------------------------------------------------------
create policy "players read own payments"
  on payments for select to authenticated
  using (player_id = auth.uid() or public.current_role() = 'admin');
create policy "players create own payment records"
  on payments for insert to authenticated
  with check (player_id = auth.uid());
create policy "admins manage payments"
  on payments for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ANNOUNCEMENTS -------------------------------------------------------------
create policy "announcements readable by authenticated"
  on announcements for select to authenticated using (true);
create policy "admins manage announcements"
  on announcements for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- ---- OPTIONAL SEED DATA ---------------------------------------------------
insert into courts (name, type, status, description) values
  ('Court Central',  'clay', 'available',   'Court principal en terre battue, tribune couverte.'),
  ('Court n°2',       'clay', 'available',   'Terre battue, éclairage nocturne.'),
  ('Court n°3',       'clay', 'maintenance', 'Réfection de la surface en cours.'),
  ('Court Couvert',   'hard', 'available',   'Court intérieur, surface dure.');

-- After creating your first admin user via the app, promote them:
--   update profiles set role = 'admin' where email = 'you@example.com';
