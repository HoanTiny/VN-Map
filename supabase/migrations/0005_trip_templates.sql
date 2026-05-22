-- Curated trip templates — pre-built itineraries by editors.
-- Users can "fork" a template (deep-copy into their own public.trips row).

do $$ begin
  create type trip_season as enum ('spring', 'summer', 'autumn', 'winter', 'tet', 'national_day', 'any');
exception when duplicate_object then null; end $$;

create table if not exists public.trip_templates (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  summary         text not null,
  cover           text not null,                  -- main cover image URL
  duration_days   int not null,                   -- derived from days but stored for fast filtering
  season          trip_season not null default 'any',
  destinations    text[] not null default '{}',   -- province slugs
  tags            text[] not null default '{}',
  days            jsonb not null,                 -- TripDay[] same shape as public.trips.days
  display_order   int not null default 100,
  enabled         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists trip_templates_order_idx
  on public.trip_templates (display_order, slug);

-- Public read (only enabled rows); admin/editor write via RLS.
alter table public.trip_templates enable row level security;

drop policy if exists "trip_templates readable by all" on public.trip_templates;
create policy "trip_templates readable by all"
  on public.trip_templates for select
  using (enabled = true);

drop policy if exists "trip_templates writable by admins" on public.trip_templates;
create policy "trip_templates writable by admins"
  on public.trip_templates for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'editor')
    )
  );

-- Bump updated_at
create or replace function public.touch_trip_templates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_trip_templates_touch on public.trip_templates;
create trigger trg_trip_templates_touch
  before update on public.trip_templates
  for each row execute function public.touch_trip_templates_updated_at();
