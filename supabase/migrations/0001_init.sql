-- ============================================================================
-- Map-VN — Phase 2 initial schema
-- ============================================================================
-- Paste this into Supabase SQL Editor (https://supabase.com/dashboard/.../sql)
-- and click "Run". Idempotent — safe to re-run.
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- ============================================================================
-- ENUMs
-- ============================================================================

do $body$ begin
  create type place_source as enum ('seed', 'community');
exception when duplicate_object then null; end $body$;

do $body$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $body$;

do $body$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $body$;

do $body$ begin
  create type user_role as enum ('user', 'editor', 'mod', 'admin');
exception when duplicate_object then null; end $body$;

do $body$ begin
  create type price_range as enum ('$', '$$', '$$$', '$$$$');
exception when duplicate_object then null; end $body$;

do $body$ begin
  create type companion as enum ('family', 'friends', 'couple', 'solo', 'work');
exception when duplicate_object then null; end $body$;

-- ============================================================================
-- profiles — extends auth.users
-- ============================================================================

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  role         user_role not null default 'user',
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row when a new auth.users is created.
create or replace function public.handle_new_user() returns trigger as $func$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email, 'Người dùng'));
  return new;
end;
$func$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- places
-- ============================================================================

create table if not exists public.places (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  province      text not null,
  province_slug text not null,
  district      text,
  address       text,
  category      text not null,
  cover         text not null,
  rating        numeric(2,1) not null default 0,
  review_count  integer not null default 0,
  highlight     text,
  price_range   price_range,
  opening_hours text,
  tags          text[],
  source        place_source not null default 'seed',
  submitted_by  text,
  -- PostGIS geometry — stores [lng, lat] as Point in WGS84 (SRID 4326)
  location      geography(Point, 4326) not null,
  lng           double precision generated always as (st_x(location::geometry)) stored,
  lat           double precision generated always as (st_y(location::geometry)) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists places_category_idx on public.places (category);
create index if not exists places_province_idx on public.places (province_slug);
create index if not exists places_location_gix on public.places using gist (location);

-- ============================================================================
-- reviews
-- ============================================================================

create table if not exists public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  place_slug   text not null references public.places(slug) on delete cascade,
  author_id    uuid references auth.users(id) on delete cascade,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  body         text not null check (char_length(body) between 30 and 2000),
  photos       text[],
  companion    companion,
  visited_at   text,
  status       review_status not null default 'approved',
  created_at   timestamptz not null default now()
);

create index if not exists reviews_place_idx on public.reviews (place_slug, created_at desc);
create index if not exists reviews_author_idx on public.reviews (author_id);

-- ============================================================================
-- saved_places — user "hearts"
-- ============================================================================

create table if not exists public.saved_places (
  user_id    uuid not null references auth.users(id) on delete cascade,
  place_slug text not null references public.places(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_slug)
);

create index if not exists saved_user_idx on public.saved_places (user_id, created_at desc);

-- ============================================================================
-- trips
-- ============================================================================

create table if not exists public.trips (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text,
  cover        text,
  destinations text[] not null default '{}',
  days         jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists trips_owner_idx on public.trips (owner_id, updated_at desc);

-- ============================================================================
-- place_submissions — community contributions awaiting moderation
-- ============================================================================

create table if not exists public.place_submissions (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  category         text not null,
  province         text not null,
  province_slug    text not null,
  district         text,
  address          text,
  description      text not null check (char_length(description) between 50 and 1000),
  location         geography(Point, 4326) not null,
  lng              double precision generated always as (st_x(location::geometry)) stored,
  lat              double precision generated always as (st_y(location::geometry)) stored,
  price_range      price_range,
  opening_hours    text,
  tags             text[],
  photos           text[],
  submitted_by     text not null,
  submitter_id     uuid references auth.users(id) on delete set null,
  status           submission_status not null default 'pending',
  rejection_reason text,
  created_at       timestamptz not null default now()
);

create index if not exists submissions_status_idx on public.place_submissions (status, created_at);

-- ============================================================================
-- Helper RPC: places_in_bbox — used by the map source for fast bbox queries.
-- ============================================================================

create or replace function public.places_in_bbox(
  west  double precision,
  south double precision,
  east  double precision,
  north double precision
) returns setof public.places language sql stable as $func$
  select *
  from public.places
  where location && st_makeenvelope(west, south, east, north, 4326);
$func$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles          enable row level security;
alter table public.places            enable row level security;
alter table public.reviews           enable row level security;
alter table public.saved_places      enable row level security;
alter table public.trips             enable row level security;
alter table public.place_submissions enable row level security;

-- Postgres doesn't support `CREATE POLICY IF NOT EXISTS` — use drop+create
-- pairs so the migration stays idempotent.

-- profiles: public read, self-write
drop policy if exists "profiles read"  on public.profiles;
create policy "profiles read"  on public.profiles for select using (true);

drop policy if exists "profiles write" on public.profiles;
create policy "profiles write" on public.profiles for update using (auth.uid() = id);

-- places: public read, editor+ write
drop policy if exists "places read"  on public.places;
create policy "places read"  on public.places for select using (true);

drop policy if exists "places admin" on public.places;
create policy "places admin" on public.places for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('editor','mod','admin'))
);

-- reviews
drop policy if exists "reviews read approved" on public.reviews;
create policy "reviews read approved" on public.reviews
  for select using (status = 'approved' or author_id = auth.uid());

drop policy if exists "reviews insert" on public.reviews;
create policy "reviews insert" on public.reviews
  for insert with check (author_id = auth.uid());

drop policy if exists "reviews update own" on public.reviews;
create policy "reviews update own" on public.reviews
  for update using (author_id = auth.uid());

drop policy if exists "reviews delete own" on public.reviews;
create policy "reviews delete own" on public.reviews
  for delete using (author_id = auth.uid());

drop policy if exists "reviews mod" on public.reviews;
create policy "reviews mod" on public.reviews for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('mod','admin'))
);

-- saved_places
drop policy if exists "saved read own" on public.saved_places;
create policy "saved read own" on public.saved_places for select using (auth.uid() = user_id);

drop policy if exists "saved insert" on public.saved_places;
create policy "saved insert" on public.saved_places for insert with check (auth.uid() = user_id);

drop policy if exists "saved delete" on public.saved_places;
create policy "saved delete" on public.saved_places for delete using (auth.uid() = user_id);

-- trips
drop policy if exists "trips read own" on public.trips;
create policy "trips read own" on public.trips for select using (auth.uid() = owner_id);

drop policy if exists "trips insert" on public.trips;
create policy "trips insert" on public.trips for insert with check (auth.uid() = owner_id);

drop policy if exists "trips update" on public.trips;
create policy "trips update" on public.trips for update using (auth.uid() = owner_id);

drop policy if exists "trips delete" on public.trips;
create policy "trips delete" on public.trips for delete using (auth.uid() = owner_id);

-- submissions
drop policy if exists "submissions read own" on public.place_submissions;
create policy "submissions read own" on public.place_submissions
  for select using (submitter_id = auth.uid() or status = 'approved');

drop policy if exists "submissions insert" on public.place_submissions;
create policy "submissions insert" on public.place_submissions
  for insert with check (auth.uid() = submitter_id);

drop policy if exists "submissions mod" on public.place_submissions;
create policy "submissions mod" on public.place_submissions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('editor','mod','admin'))
);
