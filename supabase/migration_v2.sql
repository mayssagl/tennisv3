-- ============================================================================
-- M'SAKEN TENNIS CLUB — Migration v2
-- Adds: points system, profile fields (bio/level/avatar), real court line-up
--       (1 clay + 8 hard), avatar storage, welcome points.
-- Run ONCE in the Supabase SQL Editor, AFTER schema.sql.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT where possible).
-- ============================================================================

-- ---- 1. PROFILE FIELDS ----------------------------------------------------
alter table profiles add column if not exists bio   text;
alter table profiles add column if not exists level text not null default 'beginner';
-- level keys used by the app: beginner | junior | intermediate | advanced | competitor

-- ---- 2. REAL COURT LINE-UP (1 clay + 8 hard) ------------------------------
-- NOTE: this clears existing courts (and cascades their bookings).
delete from courts;
insert into courts (name, type, status, description) values
  ('Court Terre Battue', 'clay', 'available', 'Unique court en terre battue — surface premium du club.');
insert into courts (name, type, status, description)
select 'Court Dur ' || g, 'hard', 'available', 'Surface dure, jeu rapide.'
from generate_series(1, 8) g;

-- ---- 3. POINTS SYSTEM -----------------------------------------------------
create table if not exists point_transactions (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references profiles(id) on delete cascade,
  amount      numeric(8,2) not null,        -- positive = credit, negative = debit
  reason      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_pt_player on point_transactions(player_id);

alter table point_transactions enable row level security;

drop policy if exists "read own transactions"   on point_transactions;
drop policy if exists "admins write transactions" on point_transactions;

create policy "read own transactions" on point_transactions
  for select to authenticated
  using (player_id = auth.uid() or public.current_role() = 'admin');

-- only admins create transactions from the client (recharges).
-- booking charges / refunds are done by SECURITY DEFINER triggers below.
create policy "admins write transactions" on point_transactions
  for insert to authenticated
  with check (public.current_role() = 'admin');

-- ---- 4. AUTO-CHARGE A BOOKING (atomic with payment) -----------------------
-- Booking costs 10 pts. Rejects the booking if the player can't afford it.
create or replace function public.charge_booking()
returns trigger language plpgsql security definer set search_path = public as $$
declare bal numeric; cost numeric := 10;
begin
  select coalesce(sum(amount), 0) into bal
  from point_transactions where player_id = new.player_id;

  if bal < cost then
    raise exception 'INSUFFICIENT_POINTS';
  end if;

  insert into point_transactions (player_id, amount, reason)
  values (new.player_id, -cost, 'Réservation de court');
  return new;
end $$;

drop trigger if exists trg_charge_booking on bookings;
create trigger trg_charge_booking
  before insert on bookings
  for each row execute function public.charge_booking();

-- ---- 5. REFUND ON CANCEL / REJECT -----------------------------------------
create or replace function public.refund_booking()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('cancelled','rejected')
     and old.status not in ('cancelled','rejected') then
    insert into point_transactions (player_id, amount, reason)
    values (new.player_id, 10, 'Remboursement réservation');
  end if;
  return new;
end $$;

drop trigger if exists trg_refund_booking on bookings;
create trigger trg_refund_booking
  after update on bookings
  for each row execute function public.refund_booking();

-- ---- 6. WELCOME POINTS ----------------------------------------------------
-- new signups get 50 pts (extend the existing signup handler)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          'player');
  insert into public.point_transactions (player_id, amount, reason)
  values (new.id, 50, 'Points de bienvenue');
  return new;
end $$;

-- backfill 50 welcome pts for existing members who have no transactions yet
insert into point_transactions (player_id, amount, reason)
select p.id, 50, 'Points de bienvenue'
from profiles p
left join point_transactions t on t.player_id = p.id
where t.id is null;

-- ---- 7. AVATAR STORAGE ----------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar public read"  on storage.objects;
drop policy if exists "avatar upload own"    on storage.objects;
drop policy if exists "avatar update own"    on storage.objects;

create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatar upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar update own" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
