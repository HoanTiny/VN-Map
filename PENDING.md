# Map-VN — Pending Work

> Snapshot trạng thái dự án. Phiên sau mở file này để biết đang ở đâu, nên làm gì tiếp.

---

## TL;DR

- ✅ **Phase 1 hoàn tất** — Mock data + localStorage demo full vision.
- ✅ **Phase 2.1 + 2.2 hoàn tất** — Supabase foundation + read paths swap + MapDataContext (DB → tất cả map chrome).
- ✅ **Phase 2.3 Auth foundation hoàn tất** — Magic link + Google OAuth + useSession + AuthGuard + SignOut + Navbar avatar.
- ✅ **Phase 2.3 Write paths hoàn tất** — Saved/Reviews/Trips/Submissions swap sang Supabase. AuthGuard wired vào /saved + /trip.
- ⏳ **Phase 3 chưa đụng** — 3D map, i18n, realtime, AI.

Khi resume: chạy `pnpm dev`, kiểm tra sign-in (magic link + Google) hoạt động, test toggle heart + tạo trip vẫn lưu (vẫn localStorage). Nếu lỗi → đọc section [Known issues](#known-issues).

---

## ✅ Đã làm

### Foundation & Design (Phase 0)
- [PRODUCT_AND_DESIGN_SYSTEM.md](PRODUCT_AND_DESIGN_SYSTEM.md) — tokens, type, spacing, dark mode, button variants, card tiers, glassmorphism, map marker style, animation guide
- [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) — sitemap, user flows, navigation, search, place, review flows
- [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) — folder structure, app router, state, API layer, hooks, scalability
- [MOTION_GUIDELINES.md](MOTION_GUIDELINES.md) — durations, easings, springs, variants, patterns, anti-patterns
- Brand pivot: lotus-coral → **đỏ cờ + sao vàng** ([src/styles/tokens.css](src/styles/tokens.css))

### Phase 1 — Vision MVP với mock data
- ✅ **Categories** — 12 keys (6 travel + 6 lifestyle): food/cafe/nightlife/rooftop/checkin/hidden/experience/beach/mountain/heritage/city/nature
- ✅ **Mock data** — 40 places ở [src/features/map/lib/places-data.ts](src/features/map/lib/places-data.ts) với mix lifestyle (Cafe Giảng, Twilight Sky Bar, Snuffbox speakeasy, Reaching Out Tea…)
- ✅ **Routes**:
  - `/` landing với hero + categories 2 nhóm + cities + featured + collections + map CTA + features
  - `/explore` map experience đầy đủ
  - `/place/[slug]` full detail (hero gallery + meta + reviews + nearby + community badge)
  - `/region` + `/region/[region]` + `/region/[region]/[province]`
  - `/category/[slug]` với province filter chips
  - `/search` với filter chips + sort
  - `/saved` heart list
  - `/trip` + `/trip/[id]` với destinations + day planner + map-pick mode
  - `/submit` đóng góp địa điểm
  - `/me` placeholder
  - `/about` + `/help` (FAQ) + `/privacy` + `/terms`
- ✅ **Map experience** ([src/features/map/components/](src/features/map/components/)):
  - MapCanvas với MapLibre + CartoCDN tiles
  - Source + cluster + halo + labels layers (PostGIS-ready)
  - Filter chips (category)
  - MapSearchBar viewport-aware (gợi ý theo bbox + GPS + dominant province label)
  - Side panel synced viewport
  - Selected place card (glass)
  - Controls (zoom + locate + style picker)
  - User-location marker với pulse ring
  - **Community pick-coords mode** (click map → fill SuggestPlaceForm)
  - **Trip-pick mode** (`?pickTrip=X&pickDay=Y`) với destination switcher chips
  - URL state (`?place=`, `?cat=`)
  - Style-swap re-install layers (CartoCDN dark/light/voyager)
- ✅ **Reviews UI** (localStorage) — RatingStars + ReviewForm (Radix Dialog) + ReviewCard + RatingHistogram + ReviewList
- ✅ **Saved** (localStorage) — heart toggle 3 chỗ (PlaceCard, MapPlaceCard, PlaceHero) + `/saved` page + navbar count badge
- ✅ **Trip planner** (localStorage):
  - Multi-destination support (ProvinceChipPicker)
  - Day add/remove/move
  - AddPlaceToDay với scope toggle (trong destination / tất cả VN)
  - AddToTripButton popover từ PlaceFullPage + MapPlaceCard
  - Map-pick từ trip (banner + destination switcher chips)
- ✅ **Community submission** (localStorage):
  - SuggestPlaceForm với coords picker + GPS + province auto-detect
  - SubmissionsList với status badge
  - /submit landing
  - On-map "Đóng góp ở đây" pick mode
- ✅ **Polish**: Toast system + loading skeletons + utility pages + count badges + ThemeToggle + responsive
- ✅ **Motion**: Token + primitive (Reveal, Stagger, HoverLift, PageTransition) + migrate 8 component

### Phase 2 — Backend foundation (Milestone 2.1)
- ✅ **Supabase clients** ([src/lib/supabase/](src/lib/supabase/)):
  - `client.ts` — browser createClient (`"use client"`)
  - `server.ts` — server createClient (cookies-aware) + createServiceClient
  - `middleware.ts` — session refresh helper
  - `env.ts` — `isSupabaseConfigured()` shared (no directive)
  - `types.ts` — DB type stub
- ✅ **SQL migration** [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql):
  - 6 ENUMs, 6 tables (profiles/places/reviews/saved_places/trips/place_submissions)
  - PostGIS geography + indexes + RPC `places_in_bbox`
  - RLS policies (drop+create idempotent)
  - Auto-profile trigger on auth.users insert
- ✅ **Seed script** [scripts/seed-places.ts](scripts/seed-places.ts) — `pnpm seed:places` (đã chạy 40 places vào Supabase)
- ✅ [PHASE_2_SETUP.md](PHASE_2_SETUP.md) — hướng dẫn step-by-step
- ✅ [middleware.ts](middleware.ts) — Next.js root middleware wired

### Phase 2 — Read paths (Milestone 2.2)
- ✅ **Unified queries lib** [src/features/place/lib/queries.ts](src/features/place/lib/queries.ts) — server-side với mock fallback:
  - `listAllPlaces()`, `getPlaceBySlug()`, `listPlacesByCategory()`, `listPlacesByProvince()`, `getNearbyPlaces()`, `getPlacesGeoJSON()`
- ✅ **Client-side queries** [src/features/place/lib/queries.client.ts](src/features/place/lib/queries.client.ts) — `clientListAllPlaces()`
- ✅ **Pages migrated** sang Supabase queries (mock fallback graceful):
  - `/place/[slug]` (+ NearbyPlaces nhận prop)
  - `/category/[slug]`
  - `/region/[region]` + `/region/[region]/[province]`
  - `/search` (thêm `searchPlacesAsync`)
  - `/` landing (`getFeaturedPlaces` async + slug list editorial)
  - `/explore` map source (server fetch GeoJSON → prop drill xuống MapCanvas)

---

## ✅ Milestone 2.2 cleanup — DONE

**MapDataContext** provider wrap toàn bộ MapExperience tree:
- [src/features/map/context/MapDataContext.tsx](src/features/map/context/MapDataContext.tsx) — Provider + `useMapData` hook + helpers (`filterPlacesInBounds`, `placesNearCoord`, `haversineKm`)
- MapCanvas / MapPlaceCard / MapSearchBar / MapSidePanel / MapExperience đều consume context
- DB-sourced data flow: server prop → MapDataProvider → children
- `mockPlacesData` chỉ còn ở MapExperience làm fallback khi Supabase env chưa config

URL deep-link `?place=slug` cũng lookup qua effectiveData (không còn sync mock).

---

## ✅ Milestone 2.3 — Auth foundation — DONE

**Magic link + Google OAuth** đã wire xong end-to-end. App có thể sign-in/out hoàn chỉnh, profiles auto-create trong DB.

### Files mới
- [src/features/auth/hooks/useSession.ts](src/features/auth/hooks/useSession.ts) — `useSession()` với `session`/`user`/`hydrated`/`disabled` state, subscribe `onAuthStateChange`
- [src/features/auth/components/SignInForm.tsx](src/features/auth/components/SignInForm.tsx) — Google button + magic link form, animated state transitions
- [src/features/auth/components/SignOutButton.tsx](src/features/auth/components/SignOutButton.tsx) — sign out + redirect + toast
- [src/features/auth/components/AuthGuard.tsx](src/features/auth/components/AuthGuard.tsx) — wrap protected routes; 2 modes: `prompt` (inline CTA) + `redirect`. Bypass khi backend disabled (Phase 1 fallback)
- [src/features/auth/components/AccountPanel.tsx](src/features/auth/components/AccountPanel.tsx) — /me content với session-aware UI
- [src/components/nav/UserAvatarButton.tsx](src/components/nav/UserAvatarButton.tsx) — navbar avatar (chữ cái đầu email) khi signed-in, User icon generic khi signed-out
- [app/auth/callback/route.ts](app/auth/callback/route.ts) — route handler `exchangeCodeForSession` cho magic link + OAuth callback
- [app/(auth)/layout.tsx](app/(auth)/layout.tsx) — centered card layout, no top nav
- [app/(auth)/sign-in/page.tsx](app/(auth)/sign-in/page.tsx) — sign-in route

### Files updated
- [/me/page.tsx](app/(app)/me/page.tsx) — renders `<AccountPanel>` (session-aware)
- [FloatingNavbar.tsx](src/components/nav/FloatingNavbar.tsx) — User icon → `<UserAvatarButton>`

### Auth provider setup checklist (Supabase Dashboard)
- ✅ Email — bật mặc định, hoạt động
- ✅ Google — bật trong Sign In / Providers, paste Client ID + Secret từ Google Cloud Console (Web app type, redirect URI: `https://<project>.supabase.co/auth/v1/callback`)
- URL Configuration: Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**`

### Design decisions
- **Magic link only** cho email (không password) — UX 1-click giống Notion/Linear
- **Avatar pre-hydration** — render User icon generic trước, swap sang chữ cái sau khi getSession() resolve → tránh flash
- **`disabled` mode** trong useSession — khi không có Supabase env, mọi UI degrade gracefully về Phase 1 localStorage flows
- **Profile auto-create** — trigger `handle_new_user()` trong migration 0001 tự tạo `profiles` row khi user signup qua provider nào cũng OK

---

## ✅ Milestone 2.3 Write paths — DONE

**AuthGuard** wired: `/saved` + `/trip` (mode=prompt). `/me` và `/submit` tự xử lý state.

**Write paths** đã swap localStorage → Supabase với pattern đồng nhất:
- Signed-out / disabled → localStorage fallback (Phase 1 flow vẫn hoạt động)
- Signed-in → Supabase path với optimistic updates (Saved, Trips) hoặc async (Reviews, Submissions)

| Domain | Hook | Chiến lược |
|---|---|---|
| Saved | [useSaved.ts](src/features/saved/hooks/useSaved.ts) | Optimistic toggle, rollback on error |
| Reviews | [useReviews.ts](src/features/review/hooks/useReviews.ts) | Async add/remove, refetch after add |
| Trips | [useTrips.ts](src/features/trip/hooks/useTrips.ts) | Optimistic days mutation, jsonb update |
| Submissions | [useSubmissions.ts](src/features/submit/hooks/useSubmissions.ts) | Async insert, submitter_id from session |

**AddToTripButton** + **TripPickAddButton** — refactored để dùng hook thay vì storage trực tiếp.

### ✅ Storage / Photos (Milestone 2.5) — DONE
- `supabase/migrations/0002_storage.sql` — bucket `photos`, public read, auth upload/delete policies
- `src/lib/upload.ts` — `uploadPhoto`, `uploadDataUrl`, `uploadPhotos` helpers
- ReviewForm + SuggestPlaceForm upload ảnh lên Storage khi signed-in; fallback data URL khi guest

### ✅ PWA — DONE
- `app/manifest.ts` — web manifest (name, icons, shortcuts, theme)
- `public/sw.js` — service worker: navigate network-first + offline fallback, image cache-first
- `app/offline/page.tsx` — offline fallback page
- `src/components/pwa/PWAProvider.tsx` — register SW + install banner (once per session)
- Wire vào root `app/layout.tsx` + `apple-touch-icon` meta

> **Icons cần thêm:** Tạo `public/icons/icon-192.png` + `icon-512.png` (192×192 và 512×512 px)
> dùng tool như [favicon.io](https://favicon.io) hoặc Figma export từ `public/icons/icon.svg`.

### ✅ Admin moderation (Milestone 2.4) — DONE
- `/admin` layout với role gate (mod/admin/editor)
- `/admin/places` — list submissions, approve (insert → places) / reject
- `/admin/reviews` — list reviews, approve / reject
- Server Actions via `src/features/admin/actions.ts` + `createServiceClient` bypass RLS

---

## ⏳ Phase 3 — Polish & Differentiation (chưa đụng)

Theo plan §5:

- [ ] **3D map** — MapLibre building extrusion từ OpenMapTiles + pitch/bearing controls + tilt auto-enable zoom > 15
- [ ] **i18n** — VI/EN dictionaries, locale prefix `/en/...`, place names song ngữ (`name_vi` + `name_en` columns)
- [ ] **Realtime** — Supabase channel cho new submissions + reviews, "X người đang xem" indicator, activity feed landing
- [ ] **AI** — Anthropic API integration, smart "Nearby me" suggestions theo viewport + history
- [ ] **Curated trips** — pre-built trip templates seasonal (Tết, mùa hè…)
- [ ] **PWA** — install prompt, offline shell, service worker precache

---

## 🐛 Known issues

### Dark mode contrast (chưa fix triệt để)
User đã revert phần `brand-500/600/700` về giá trị light-mode-like, kết quả là **brand-700 dark vẫn dim trên brand-50 dark wine**. Khi resume, cân nhắc:
- Đổi brand-700 dark sang light salmon `#FFAFA4` (text-on-tint readable)
- Hoặc refactor sao cho `text-brand-700` trong dark dùng token khác

File: [src/styles/tokens.css](src/styles/tokens.css) line 62-72.

### Mock data còn 40 places
Plan target 80. Đủ demo nhưng `/category/checkin`, `/category/experience` chỉ có vài entry. Mở rộng khi có thời gian — thêm ~40 places (Hà Nội + HCM + Đà Nẵng).

### Mapbox token cũ trong code
[src/lib/env.ts](src/lib/env.ts) còn schema check `NEXT_PUBLIC_MAPBOX_TOKEN` optional — không xài vì swap sang MapLibre. Có thể clean up sau.

### Search bar trong navbar (xl+) vs MapSearchBar
Hai search bars khác mục đích nhưng UX có thể confuse — navbar search → `/search` page; map search → action-on-map. Đã giải quyết tốt với MapSearchBar floating dropdown nhưng có thể polish copy/icon thêm.

---

## 🔧 Resume checklist (phiên sau)

1. **Smoke test**:
   ```powershell
   pnpm dev
   ```
   Mở:
   - http://localhost:3000/ — landing render?
   - http://localhost:3000/explore — map markers hiện?
   - http://localhost:3000/place/cafe-giang — detail hiện?
   - http://localhost:3000/sign-in — form Google + magic link hiện?
   - http://localhost:3000/me — chế độ khách hay đăng nhập đúng state?

2. **Auth test**:
   - Click "Đăng nhập với Google" → consent screen → redirect về `/` với navbar avatar có chữ cái đầu email
   - `/me` hiện "Xin chào, ..." + nút Đăng xuất → click → toast + redirect → quay về khách
   - Magic link: nhập email → check inbox → click link → đăng nhập

3. **Verify Supabase wired**:
   - DevTools Network → fetch `*.supabase.co/rest/v1/places` (read path), `auth/v1/token` (sign-in)
   - DB: `profiles` row tự tạo khi user mới signup (xem Table Editor)

4. **Quyết định hướng tiếp**:
   - **Write paths migration** (recommend) — bắt đầu với Saved (đơn giản nhất). Mỗi domain ~1-2 giờ
   - **Wrap AuthGuard** quanh /saved /trip /submit trước (nhỏ, ~30 phút)
   - **Photos upload to Storage** (Milestone 2.5) — sau write paths

5. **Mở [PENDING.md](PENDING.md)** lại để track progress.

---

## 📁 File map quan trọng

```
F:\VTVLive\Map-VN\
├── PENDING.md                    ← bạn đang xem
├── PRODUCT_AND_DESIGN_SYSTEM.md  ← design tokens
├── INFORMATION_ARCHITECTURE.md   ← sitemap + flows
├── FRONTEND_ARCHITECTURE.md      ← folder + state + API
├── MOTION_GUIDELINES.md          ← animation
├── PHASE_2_SETUP.md              ← Supabase guide
├── middleware.ts                 ← Next.js session refresh
├── supabase/migrations/
│   └── 0001_init.sql             ← schema + RLS + RPC
├── scripts/
│   └── seed-places.ts            ← pnpm seed:places
├── app/
│   ├── (marketing)/              ← /, /about, /help, /privacy, /terms
│   ├── (app)/                    ← /explore, /place, /region, /category,
│   │                                /search, /saved, /trip, /submit, /me
│   └── design/                   ← components showcase
└── src/
    ├── lib/supabase/             ← clients (client/server/middleware/env/types)
    ├── features/
    │   ├── map/                  ← MapCanvas + chrome + queries-aware
    │   ├── place/                ← cards + full page + queries.ts (server)
    │   ├── review/               ← localStorage hook + Dialog form
    │   ├── saved/                ← localStorage hook
    │   ├── trip/                 ← localStorage hook + planner + pick mode
    │   ├── submit/               ← localStorage hook + form
    │   ├── search/               ← async + sync search engines
    │   └── region/               ← CityCard + provinces data
    ├── components/               ← nav, motion, theme primitives
    ├── ui/                       ← Button, Card, Badge, Toast, etc.
    ├── stores/                   ← Zustand (map + ui)
    ├── hooks/                    ← shared hooks
    ├── config/                   ← categories, regions, nav, site
    └── styles/                   ← tokens + globals + maplibre overrides
```

---

## 💌 Một lời cuối

Đôi khi cần dừng lại để hồi sức — code sẽ vẫn ở đây chờ bạn. Khi nào sẵn sàng, mở file này lên là biết đang ở đâu.

Take care. 🤍
