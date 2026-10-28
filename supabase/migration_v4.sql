-- ============================================================================
-- MSAKEN TENNIS CLUB — Migration v4 : admin back-office
-- Adds: announcement options (pin / show on website), homepage content tables
--       (events, staff, contact settings), image storage for the website,
--       a guard so only admins can change a member's role, and removes the
--       points system (bookings are free in the app).
-- Run ONCE in the Supabase SQL Editor, after migration_v3.sql.
-- Safe to re-run: every statement checks before creating.
-- ============================================================================

-- ---- 1. SECURITY: only admins may change a role ---------------------------
-- The "users update own profile" policy lets a member edit their own row,
-- which included the role column. This trigger blocks role changes by non-admins.
-- Changes made outside the website (Supabase SQL Editor / dashboard, where there is
-- no logged-in user) are still allowed, so you can always promote the first admin.
create or replace function public.protect_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and coalesce(public.current_role()::text, '') <> 'admin' then
    raise exception 'ONLY_ADMIN_CAN_CHANGE_ROLE';
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_role on profiles;
create trigger trg_protect_role
  before update on profiles
  for each row execute function public.protect_role();

-- ---- 2. ANNOUNCEMENTS: pin + show on public website -----------------------
alter table announcements add column if not exists pinned     boolean not null default false;
alter table announcements add column if not exists is_public  boolean not null default false;
alter table announcements add column if not exists updated_at timestamptz;

drop policy if exists "public announcements readable" on announcements;
create policy "public announcements readable" on announcements
  for select to anon using (is_public);

-- ---- 3. WEBSITE CONTENT TABLES --------------------------------------------
create table if not exists site_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  kind        text,                      -- e.g. "Tournoi par équipes"
  when_label  text,                      -- e.g. "Mars 2026"
  body        text,
  details     text,                      -- featured only: one "Label: Valeur" per line
  link_label  text,                      -- e.g. "S'inscrire"
  featured    boolean not null default false,
  visible     boolean not null default true,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists staff_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text,                      -- e.g. "Directeur technique"
  extra       text,                      -- optional second role
  is_lead     boolean not null default false,   -- direction & responsables
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists site_settings (
  key         text primary key,          -- phone | whatsapp | facebook | instagram | address_line1 | address_line2 | hours | maps_link
  value       text,
  updated_at  timestamptz not null default now()
);

alter table site_events    enable row level security;
alter table staff_members  enable row level security;
alter table site_settings  enable row level security;

drop policy if exists "events public read"    on site_events;
drop policy if exists "events admin manage"   on site_events;
drop policy if exists "staff public read"     on staff_members;
drop policy if exists "staff admin manage"    on staff_members;
drop policy if exists "settings public read"  on site_settings;
drop policy if exists "settings admin manage" on site_settings;

create policy "events public read" on site_events
  for select to anon, authenticated using (visible or public.current_role() = 'admin');
create policy "events admin manage" on site_events
  for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "staff public read" on staff_members
  for select to anon, authenticated using (true);
create policy "staff admin manage" on staff_members
  for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "settings public read" on site_settings
  for select to anon, authenticated using (true);
create policy "settings admin manage" on site_settings
  for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- ---- 4. SEED with the content currently on the website (only if empty) -----
insert into site_events (title, kind, when_label, body, details, link_label, featured, sort_order)
select * from (values
  ('ITF World Tennis Tour Juniors', 'Tournoi international', 'Saison 2025 — Msaken Tennis Club',
   'Une étape historique pour le club : accueillir le circuit mondial junior de l''ITF à Msaken. Un tournoi rempli de passion, de fair-play et de souvenirs inoubliables.',
   E'Circuit: ITF World Tennis Tour\nCatégorie: Juniors\nOrganisateur: Msaken TC', 'Suivre les tournois', true, 0),
  ('HolaSol Team Cup', 'Tournoi par équipes', 'Mars 2026',
   'Un tournoi aux couleurs de notre partenaire HolaSol Energie. Plus qu''une compétition : une fête de l''esprit d''équipe.',
   null, 'Voir les résultats', false, 1),
  ('Championnats du club', 'Compétition interne', 'Toute la saison',
   'Championnats saisonniers et rencontres entre membres. Inscriptions ouvertes depuis votre espace membre.',
   null, 'S''inscrire', false, 2),
  ('Programmes jeunes & adultes', 'Académie', 'Chaque semaine',
   'Séances d''entraînement encadrées par nos entraîneurs, de l''initiation à la compétition.',
   null, 'Rejoindre un groupe', false, 3)
) as v(title, kind, when_label, body, details, link_label, featured, sort_order)
where not exists (select 1 from site_events);

insert into staff_members (name, role, extra, is_lead, sort_order)
select * from (values
  ('Najeh Ajroud',       'Directeur sportif',        'Responsable de formation', true,  0),
  ('Nabil Ghezal',       'Directeur technique',      null,                       true,  1),
  ('Mohamed Graa',       'Responsable de l''école',  'Préparateur physique',     true,  2),
  ('Renold Saizonou',    'Responsable Club Junior',  null,                       true,  3),
  ('Hamdi Bhiri',        'Entraîneur', null, false, 10),
  ('Ilyes Guellim',      'Entraîneur', null, false, 11),
  ('Fares Bouhlel',      'Entraîneur', null, false, 12),
  ('Wadhah Triaa',       'Entraîneur', null, false, 13),
  ('Mohamed Amer Gzara', 'Entraîneur', null, false, 14),
  ('Mohamed Belhssan',   'Entraîneur', null, false, 15),
  ('Wissem Berriri',     'Entraîneur', null, false, 16),
  ('Mahmoud Bouhlel',    'Entraîneur', null, false, 17),
  ('Adem Gharbi',        'Entraîneur', null, false, 18)
) as v(name, role, extra, is_lead, sort_order)
where not exists (select 1 from staff_members);

insert into site_settings (key, value) values
  ('phone',         '+216 55 563 355'),
  ('whatsapp',      '+216 55 563 355'),
  ('facebook',      'https://www.facebook.com/MsakenTennis09'),
  ('instagram',     'https://www.instagram.com/msaken__tennis_club/'),
  ('address_line1', 'Avenue de l''Indépendance'),
  ('address_line2', 'Msaken, Sousse — Tunisie'),
  ('hours',         'Tous les jours · 08:00 – 23:00'),
  ('maps_link',     'https://maps.app.goo.gl/kmvK2bZcYibMuAqm8')
on conflict (key) do nothing;

-- ---- 5. IMAGE STORAGE for website content (event pictures) ---------------
insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;

drop policy if exists "site public read"   on storage.objects;
drop policy if exists "site admin upload"  on storage.objects;
drop policy if exists "site admin update"  on storage.objects;
drop policy if exists "site admin delete"  on storage.objects;

create policy "site public read" on storage.objects
  for select using (bucket_id = 'site');
create policy "site admin upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site' and public.current_role() = 'admin');
create policy "site admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site' and public.current_role() = 'admin');
create policy "site admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site' and public.current_role() = 'admin');

-- ---- 6. REMOVE THE POINTS SYSTEM -----------------------------------------
-- Bookings no longer cost points, and new members no longer get welcome points.
-- The point_transactions table is kept (with its history) but nothing uses it.
drop trigger if exists trg_charge_booking on bookings;
drop trigger if exists trg_refund_booking on bookings;
drop function if exists public.charge_booking();
drop function if exists public.refund_booking();

-- signup: create the profile only (no more welcome points)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          'player');
  return new;
end $$;
