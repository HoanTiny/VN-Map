# VN-Map — Claude Code Guide

## Project Overview
Interactive map and travel guide for Vietnam. Next.js 15 App Router, Supabase (Postgres + PostGIS), MapLibre GL, full i18n (vi/en).

## Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack dev)
- **Language**: TypeScript strict
- **Database**: Supabase (Postgres + PostGIS) — PostGIS `location` column for places
- **Auth**: Supabase Auth (magic link + OAuth) via `@supabase/ssr`
- **Map**: MapLibre GL 4.x + CartoCDN tiles
- **State**: Zustand (`useMapStore`, `useUIStore`)
- **Data fetching**: React Query (client) + Server Components (server)
- **i18n**: next-intl — `vi` (default, no prefix), `en` (/en prefix)
- **UI**: Radix UI + Tailwind CSS 3.4 + class-variance-authority
- **AI**: Google Gemini via `@google/generative-ai`
- **Forms**: React Hook Form + Zod

## Project Structure
```
app/                        # Next.js App Router
  [locale]/                 # All user-facing pages (vi/en)
    (admin)/                # Admin panel — role-gated at layout level
    (app)/                  # Main app (map, place detail, trips, etc.)
    (auth)/                 # Auth pages
    (marketing)/            # Landing page
  api/
    ai/suggest/             # Gemini AI suggestion endpoint (rate-limited 15/hr)
    search/suggest/         # Search autocomplete (rate-limited 60/min)
  auth/callback/            # Supabase OAuth callback (non-localized)
src/
  features/                 # Feature modules (place, map, search, admin, realtime, …)
  lib/supabase/             # createClient (user session) / createServiceClient (service role)
  i18n/                     # next-intl routing config
messages/
  vi.json                   # Vietnamese strings (~45 namespaces)
  en.json                   # English strings
```

## Key Conventions

### Supabase clients
- `createClient()` — async, uses user session cookies. Use in Server Components, Route Handlers.
- `createServiceClient()` — sync, service role (bypasses RLS). Only for admin server actions — always call `requireAdminRole()` first.

### Admin server actions
All functions in `src/features/admin/actions.ts` call `requireAdminRole()` at the top before using `createServiceClient()`. Never skip this guard.

### i18n
- All user-facing strings go in `messages/vi.json` and `messages/en.json` under matching keys.
- `app/error.tsx` and `app/not-found.tsx` are outside the locale layout — they use bilingual inline text (vi + en) since next-intl is unavailable there.
- Admin pages use the `Admin.*` namespace.

### Realtime hooks
Hooks in `src/features/realtime/hooks/` use `useRef` to stabilize callbacks so Supabase channels don't resubscribe on every render.

### API rate limiting
In-memory rate limiters (resets on cold start — acceptable for serverless). AI: 15 req/hr per user/IP. Search: 60 req/min per IP.

### Mock fallback
App works without Supabase configured — `isSupabaseConfigured()` guards all DB calls and falls back to in-memory mock data.

## Common Commands
```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm seed:places  # Seed Supabase with place data
pnpm seed:hero    # Seed hero presets
pnpm seed:trips   # Seed curated trip templates
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # Admin actions only
GEMINI_API_KEY=               # AI suggestions
```

## Database Schema Notes
- `places.location` — PostGIS `geography(Point)` column, stored as `POINT(lng lat)`
- `profiles.role` — "admin" | "mod" | "editor" | null
- Province slugs use VN34 (post-2025 merger): 34 provinces instead of 63
- Legacy province name mapping in `src/config/regions.ts` for search compatibility

## What's in Progress (Phase 3)
- i18n: global error/not-found pages are bilingual inline (can't use next-intl at root)
- Tests: Vitest configured for utility functions
