-- Hero background presets — manageable via /admin/hero-presets.
-- Each row = one region with up to 3 time-of-day variants (day / sunset / night).
-- DynamicHeroBackground reads enabled rows; falls back to hardcoded defaults
-- if the table is empty or backend is unreachable.

create table if not exists public.hero_presets (
  id              uuid primary key default gen_random_uuid(),
  region          text not null unique,         -- machine key: 'hanoi', 'hue', 'default', etc.
  label           text not null,                -- display: 'Hà Nội'
  match_keywords  text[] not null default '{}', -- IP geolocation hints: ['hanoi', 'ha noi']
  presets         jsonb not null,               -- { day: { images: [{src, alt}], overlay }, sunset, night }
  is_default      boolean not null default false,
  enabled         boolean not null default true,
  display_order   int not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hero_presets_order_idx
  on public.hero_presets (display_order, region);

-- Public read for anonymous landing; only admins write.
alter table public.hero_presets enable row level security;

drop policy if exists "hero_presets readable by all" on public.hero_presets;
create policy "hero_presets readable by all"
  on public.hero_presets for select
  using (enabled = true);

drop policy if exists "hero_presets writable by admins" on public.hero_presets;
create policy "hero_presets writable by admins"
  on public.hero_presets for all
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

-- Auto-bump updated_at
create or replace function public.touch_hero_presets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_hero_presets_touch on public.hero_presets;
create trigger trg_hero_presets_touch
  before update on public.hero_presets
  for each row execute function public.touch_hero_presets_updated_at();
