-- ============================================================================
-- MSAKEN TENNIS CLUB — Migration v3
-- Adds: "Trouver un partenaire" — match board (posts + responses).
-- (Member directory reuses the existing profiles read policy.)
-- Run ONCE in the Supabase SQL Editor, after migration_v2.sql.
-- Password reset needs no schema — it uses Supabase Auth.
-- ============================================================================

create table if not exists match_posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references profiles(id) on delete cascade,
  play_date   date,
  play_time   text,
  surface     text default 'any',     -- any | clay | hard
  level_pref  text default 'any',     -- any | beginner | junior | intermediate | advanced | competitor
  note        text,
  status      text not null default 'open',   -- open | closed
  created_at  timestamptz not null default now()
);
create index if not exists idx_mp_status on match_posts(status, created_at desc);

create table if not exists match_responses (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references match_posts(id) on delete cascade,
  responder_id uuid not null references profiles(id) on delete cascade,
  message      text,
  created_at   timestamptz not null default now(),
  unique (post_id, responder_id)       -- one response per member per post
);

alter table match_posts     enable row level security;
alter table match_responses enable row level security;

-- POSTS ---------------------------------------------------------------------
drop policy if exists "posts readable"      on match_posts;
drop policy if exists "create own post"     on match_posts;
drop policy if exists "manage own post"     on match_posts;

create policy "posts readable" on match_posts
  for select to authenticated using (true);
create policy "create own post" on match_posts
  for insert to authenticated with check (author_id = auth.uid());
create policy "manage own post" on match_posts
  for all to authenticated
  using (author_id = auth.uid() or public.current_role() = 'admin')
  with check (author_id = auth.uid() or public.current_role() = 'admin');

-- RESPONSES -----------------------------------------------------------------
drop policy if exists "responses visible to parties" on match_responses;
drop policy if exists "create own response"          on match_responses;
drop policy if exists "delete own response"          on match_responses;

-- a responder sees their own; a post author sees everyone who responded
create policy "responses visible to parties" on match_responses
  for select to authenticated using (
    responder_id = auth.uid()
    or exists (select 1 from match_posts p where p.id = post_id and p.author_id = auth.uid())
    or public.current_role() = 'admin'
  );
create policy "create own response" on match_responses
  for insert to authenticated with check (responder_id = auth.uid());
create policy "delete own response" on match_responses
  for delete to authenticated using (responder_id = auth.uid());
