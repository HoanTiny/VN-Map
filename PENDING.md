# Map-VN — Pending Work

> Snapshot trạng thái dự án. Phiên sau mở file này để biết đang ở đâu, nên làm gì tiếp.

---

## TL;DR

- ✅ **Phase 1 hoàn tất** — Mock data + localStorage demo full vision.
- ✅ **Phase 2.1 + 2.2 hoàn tất** — Supabase foundation + read paths swap + MapDataContext (DB → tất cả map chrome).
- ✅ **Phase 2.3 Auth foundation hoàn tất** — Magic link + Google OAuth + useSession + AuthGuard + SignOut + Navbar avatar.
- ✅ **Phase 2.3 Write paths hoàn tất** — Saved/Reviews/Trips/Submissions swap sang Supabase. AuthGuard wired vào /saved + /trip.
- ✅ **Phase 2.4 Admin moderation hoàn tất** — `/admin` role gate, approve/reject submissions + reviews.
- ✅ **Phase 2.5 Storage hoàn tất** — `photos` bucket, upload helpers, ReviewForm + SuggestPlaceForm dùng Storage khi signed-in.
- ✅ **PWA hoàn tất** — manifest, service worker, offline page, install banner.
- ✅ **SEO & Favicon hoàn tất** — Dynamic OG images `/api/og`, favicon từ logo MapVN, apple-icon.
- ✅ **Production live** — Deployed Vercel, env vars set, Supabase migrations 0001–0003 chạy.
- ✅ **Admin merger 01/07/2025** — Update 63 → 34 đơn vị hành chính theo Nghị quyết. Provinces config, places remap, search match legacy name, map polygon highlight đều hoàn tất.
- ✅ **Admin merger pushed + migrated** (2026-05-26) — branch `pharse3`, migration đã chạy production, smoke test pass.
- ✅ **AI history-aware** (2026-05-26) — Gemini route dùng `startChat({history})`, client gửi 5 turn cuối, system prompt biết câu nối tiếp + tránh lặp.
- ✅ **i18n Phase A foundation + Phase B (~95%)** (2026-05-26) — next-intl wired, full app/[locale] routing, 9 migration sessions covering ~50 components. Còn admin pages + editorial body copy + root error.tsx/not-found.tsx.
- ✅ **i18n Phase C foundation + migration đã chạy production** (2026-05-26) — DB schema bilingual ready, queries fallback VI khi EN thiếu, SuggestPlaceForm có optional EN section, admin approve copy EN columns.
- ⏳ **Next improvements** — xem [section "Cải thiện tiếp theo"](#cải-thiện-tiếp-theo) bên dưới.

Khi resume: chạy `pnpm dev` và smoke test các route chính. Nếu lỗi → đọc section [Known issues](#known-issues).

---

## ✅ Đã làm (cập nhật 2026-05-22)

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

### ✅ SEO & Favicon (Session 2026-05-22) — DONE
- **Dynamic OG images** — `/api/og` route (`next/og` ImageResponse, gradient + logo + text) wired vào:
  - `app/layout.tsx` (root metadata)
  - `app/(app)/category/[slug]/page.tsx`
  - `app/(app)/place/[slug]/page.tsx`
  - `app/(app)/region/[region]/[province]/page.tsx`
- **Favicon từ logo MapVN** — `app/favicon.ico` + `app/icon.png` + `app/apple-icon.png` (Next.js app-dir convention, auto-injects `<link>` tags)
- **ESLint/TypeScript Vercel build** — toàn bộ lỗi đã fix: `@eslint/eslintrc` dep, `import/no-restricted-paths` rule xóa, `any` types typed, unescaped entities, `@ts-ignore` removed, `displayName` hoisting fix

### ✅ Homepage UX overhaul (Session 2026-05-22) — DONE
- **Categories marquee** — hai static grid gộp thành marquee animation với CSS `@keyframes`
  - Desktop: `DraggableMarqueeRow` drag-to-scroll, 2 hàng chạy ngược chiều nhau, edge fade mask
  - Mobile: static 2-column grid (không có auto-scroll, dễ tap)
  - `src/components/DraggableMarqueeRow.tsx` — "use client", `DOMMatrix` resume animation sau drag
- **"Xem tất cả" link** — fix `/category/cafe` → `/explore`
- **Mobile overflow fix** — `overflow-hidden` trên `<section>` ngăn marquee gây horizontal scroll

### ✅ Map UX fixes (Session 2026-05-22) — DONE
- **AI suggest panel** — dời từ `bottom-20 left-4` → `top-32 left-4` (tránh bị MapPlaceCard che khi chọn địa điểm)
- **Panel animation** — đổi slide từ dưới lên → từ trên xuống (hợp với vị trí mới)
- **Dev background switcher xóa** — bỏ HN/ĐN/SG/DF buttons khỏi `DynamicHeroBackground.tsx`

### ✅ Production deployment (Session 2026-05-22) — DONE
- Vercel build sạch (không còn ESLint / TypeScript errors)
- Env vars set: `NEXT_PUBLIC_APP_URL`, `GEMINI_API_KEY`, Supabase keys
- Supabase migrations 0001–0003 chạy xong

### ✅ Administrative merger 01/07/2025 (Session 2026-05-22 chiều) — DONE (local), pending DB push
Áp dụng Nghị quyết 60-NQ/TW: 63 tỉnh/TP cũ → **34 đơn vị mới** (6 TP TW + 28 tỉnh).

**Config & data:**
- [src/config/regions.ts](src/config/regions.ts) — viết lại 34 đơn vị, thêm field `isCity`, `merged[]` (tỉnh cũ gộp vào), export `legacyProvinceMap` (oldName → newSlug)
- [src/features/map/lib/places-data.ts](src/features/map/lib/places-data.ts) — remap 20 places sang tỉnh mới, giữ tỉnh cũ trong `district` (vd: Hội An → province "Đà Nẵng", district "Hội An (Quảng Nam cũ)")
- [scripts/seed-trip-templates.ts](scripts/seed-trip-templates.ts) — update destinations
- [app/design/page.tsx](app/design/page.tsx) — fix province placeholder
- [supabase/migrations/0002_admin_merger_2025.sql](supabase/migrations/0002_admin_merger_2025.sql) — idempotent UPDATE province/province_slug cho `places` + `place_submissions`, dùng `VALUES (...)` trong DO block (tránh giới hạn 100 args của `jsonb_build_object`), có warning log row chưa map được. **Cần chạy lại trên Supabase production sau khi push.**

**Homepage search nâng cấp:**
- [app/api/search/suggest/route.ts](app/api/search/suggest/route.ts) — endpoint mới, gọi `searchPlacesAsync` (DB + fallback mock), match thêm provinces/categories, **match legacy names** (Bắc Giang → suggest "Bắc Giang → Bắc Ninh")
- [src/features/search/components/SearchBar.tsx](src/features/search/components/SearchBar.tsx) — bỏ MOCK cứng, fetch API với debounce + AbortController, hiện "Đang tìm…" loading state

**Map polygon layer:**
- [public/json/VN63.geojson](public/json/VN63.geojson) — 63 tỉnh cũ (user cung cấp, 15 MB)
- [public/json/VN34.geojson](public/json/VN34.geojson) — 34 tỉnh mới đã merge (0.7 MB), generate từ VN63 bằng [scripts/build-vn34-geojson.ts](scripts/build-vn34-geojson.ts) (turf union + simplify, dùng `legacyProvinceMap`)
- npm script: `pnpm build:vn34` để regenerate
- [MapCanvas.tsx](src/features/map/components/MapCanvas.tsx):
  - `province-line` — boundary xám nhạt luôn hiện
  - `province-fill` — đỏ brand 18% khi `feature-state.active=true`
  - `province-labels` — tên tỉnh hiện ở zoom 4.5-9
  - `window.__mapVN.highlightProvince(slug)` — flyTo (zoom 8.2) + active 5.5s + auto-clear
- [MapSearchBar.tsx](src/features/map/components/MapSearchBar.tsx) — search match cả legacy names, suggest hiện "Bắc Giang → Bắc Ninh" với hint "Đã sáp nhập vào ... (01/07/2025)", click → flyTo + highlight polygon

**Dependencies thêm (dev):** `@turf/union`, `@turf/simplify`, `@turf/helpers`, `@types/geojson`

**Git status:** 2 commits ahead of origin/main (`c6ff458` + `53eadbc`), chưa push.

---

## ⏳ Phase 3 — Polish & Differentiation (chưa đụng)

Theo plan §5:

- [x] **3D map** — MapLibre building extrusion từ OpenFreeMap (OpenMapTiles schema) + pitch/bearing controls (Session 2026-05-22)
  - `enable3D` state ở [map-store.ts](src/stores/map-store.ts), Box toggle button trong [MapControls.tsx](src/features/map/components/MapControls.tsx)
  - Khi bật: setStyle sang OpenFreeMap liberty/positron, easeTo pitch 45° bearing -17°, fill-extrusion layer ở zoom ≥ 14
  - Khi tắt: revert sang CartoCDN positron/dark-matter, pitch 0
- [~] **i18n** — Phase A foundation **DONE** (2026-05-26):
  - `next-intl@4.12` installed, `src/i18n/{routing,navigation,request}.ts` setup với `localePrefix: "as-needed"` (`/` = VI, `/en/...` = EN)
  - `messages/{vi,en}.json` skeleton (Common, Nav, Home, Footer)
  - Route group `(admin)`, `(app)`, `(auth)`, `(marketing)` đã move vào `app/[locale]/`
  - `app/[locale]/layout.tsx` wrap `NextIntlClientProvider` + `setRequestLocale`
  - Middleware compose: `intlMiddleware` + `updateSession` (supabase cookie refresh), skip intl cho `/auth/*`, `/offline`, `/design`
  - `app/layout.tsx` (root) giữ nguyên html/body/fonts/providers để non-localized routes vẫn render được
  - `next.config.ts` wrap với `createNextIntlPlugin("./src/i18n/request.ts")`
  - Build pass: routes hiện ra cả `/vi/...` và `/en/...`
  - **Phase B partial DONE** (2026-05-26):
    - [messages/vi.json](messages/vi.json) + [en.json](messages/en.json) namespaces: `Common`, `Nav`, `Home`, `Footer`
    - [Footer.tsx](src/components/nav/Footer.tsx) — async server, `getTranslations("Footer")`
    - [FloatingNavbar.tsx](src/components/nav/FloatingNavbar.tsx) — `useTranslations("Nav")` + `useTranslations("Common")`
    - [TopBar.tsx](src/components/nav/TopBar.tsx) — async server với `getTranslations`
    - [BottomTabBar.tsx](src/components/nav/BottomTabBar.tsx) — `useTranslations("Nav")`
    - [nav.ts](src/config/nav.ts) — refactor `NavItem.label` → `NavItem.key` (i18n key)
    - [(marketing)/page.tsx](app/[locale]/(marketing)/page.tsx) — landing all sections (hero, cities, places, activity, curated, collections, mapCTA, stats) dùng `getTranslations`
    - `/design` move vào `[locale]/` vì dùng FloatingNavbar
    - **(2026-05-26 session 2)**:
    - [SearchBar.tsx](src/features/search/components/SearchBar.tsx) — `useTranslations("Search")` cho placeholder, aria, type labels, trending, empty state, no results
    - [search/page.tsx](app/[locale]/(app)/search/page.tsx) — `getTranslations("SearchPage")` cho metadata + tất cả strings, empty state
    - [saved/page.tsx](app/[locale]/(app)/saved/page.tsx) + [me/page.tsx](app/[locale]/(app)/me/page.tsx) — metadata async qua `generateMetadata`
    - [sign-in/page.tsx](app/[locale]/(auth)/sign-in/page.tsx) — toàn bộ headlines, badges, terms agreement (rich text), roadtrip section
    - [PlaceCard.tsx](src/features/place/components/PlaceCard.tsx) — `useTranslations("Place")` cho aria-label, perPerson; `useLocale()` để pick `cat.labelVi` vs `cat.label` (EN từ config sẵn có)
    - Thêm namespaces: `Search`, `SearchPage`, `SavedPage`, `MePage`, `SignInPage`, `Place`
    - [LanguageSwitcher.tsx](src/components/nav/LanguageSwitcher.tsx) — pill VI/EN dùng `useRouter`+`usePathname` từ `@/i18n/navigation`. Wired vào [FloatingNavbar](src/components/nav/FloatingNavbar.tsx) (desktop cạnh ThemeToggle + mobile menu drawer)
    - **(2026-05-26 session 3)** — core content pages migrated:
    - [/place/[slug]/page.tsx](app/[locale]/(app)/place/[slug]/page.tsx) — metadata async với getTranslations + getLocale (pick `cat.label` vs `cat.labelVi`)
    - [PlaceFullPage.tsx](src/features/place/components/PlaceFullPage.tsx) — `useTranslations("PlaceDetail")` cho directions/viewOnMap/report/viewers/intro/location/submittedBy (rich text với `<b>`). CategoryTipsCard dùng `t.raw()` để đọc array tips theo category. SidebarNearbyPlaces dùng `useLocale()` cho category label
    - [/category/[slug]/page.tsx](app/[locale]/(app)/category/[slug]/page.tsx) — full migration (metadata + heading + CTA + results count). Category label pick theo locale
    - [/region/page.tsx](app/[locale]/(app)/region/page.tsx) — landing 3 vùng
    - [/region/[region]/page.tsx](app/[locale]/(app)/region/[region]/page.tsx) — detail vùng + ProvinceCard nhận `placeCountLabel` prop từ parent
    - [/region/[region]/[province]/page.tsx](app/[locale]/(app)/region/[region]/[province]/page.tsx) — province detail với category chips, results count, contribute CTA. CatChip nhận pre-translated label
    - Namespaces mới: `PlaceDetail`, `CategoryPage`, `RegionPage`
    - **(2026-05-26 session 4)** — explore + map shell:
    - [/explore/page.tsx](app/[locale]/(app)/explore/page.tsx) — metadata async
    - [MapExperience.tsx](src/features/map/components/MapExperience.tsx) — contributeHere fab, pickPrompt banner + cancel aria, TripPickBanner (default name, day, hint, done, focus label, all)
    - [MapPlaceCard.tsx](src/features/map/components/MapPlaceCard.tsx) — close/share aria, save/saved label, viewDetails, explore CTA. CategoryChip dùng useLocale
    - [MapControls.tsx](src/features/map/components/MapControls.tsx) — style picker labels (auto/light/dark/satellite), 3D hint + toggle, locate, zoomIn/Out
    - [MapSearchBar.tsx](src/features/map/components/MapSearchBar.tsx) — placeholder, clear, group labels (places/provinces/categories), merged-into, filter hint, viewAllResults, empty state (quickFilters/nearYou/inViewport/expandTo/trending), noResults. EmptyState + NoResults dùng useTranslations riêng
    - [MapFilterChips.tsx](src/features/map/components/MapFilterChips.tsx) — clear aria, category labels via useLocale
    - Namespaces mới: `Explore`, `Map`
    - **(2026-05-26 session 5)** — trip + submit + auth components:
    - [/trip/page.tsx](app/[locale]/(app)/trip/page.tsx) + [/trip/[id]/page.tsx](app/[locale]/(app)/trip/[id]/page.tsx) + [/submit/page.tsx](app/[locale]/(app)/submit/page.tsx) — async metadata
    - [/trips/[slug]/page.tsx](app/[locale]/(app)/trips/[slug]/page.tsx) — curated trip detail (home link, duration, season label via Season namespace, empty-day fallback)
    - [CuratedTripCard.tsx](src/features/trip-template/components/CuratedTripCard.tsx) — converted to async server component dùng `getTranslations` (season + duration + viewItinerary + multi-destination)
    - [SubmitLanding.tsx](src/features/submit/components/SubmitLanding.tsx) — toàn bộ hero + 3 steps + new category card + submissions section
    - [TripList.tsx](src/features/trip/components/TripList.tsx) — heading + empty state + CTA
    - [AccountPanel.tsx](src/features/auth/components/AccountPanel.tsx) — profile (statuses, guest name, sync notes rich text, sign in/out CTAs), control board tiles (saved/trips/submit/explore với count messages)
    - [SignInForm.tsx](src/features/auth/components/SignInForm.tsx) — 3 OAuth buttons, magic link flow, sent notice rich text
    - [AuthGuard.tsx](src/features/auth/components/AuthGuard.tsx) — defaultMessage qua hook, title + CTA
    - Namespaces mới: `TripPage`, `SubmitPage`, `CuratedTrip`, `Season`, `AuthGuard`, `SignInForm` (+ mở rộng `MePage`)
    - **(2026-05-26 session 6)** — reviews + trip dialogs + nav misc:
    - [ReviewList](src/features/review/components/ReviewList.tsx) — overline, title, write CTA, 4 sort tabs, new-reviews nudge, empty state
    - [ReviewCard](src/features/review/components/ReviewCard.tsx) — visited-on, delete aria, read-more/collapse, photo alt, relative time formatter (vi/en-US toLocaleDateString)
    - [ReviewForm](src/features/review/components/ReviewForm.tsx) — validation messages (rating/body/title/name), submitted toast, full dialog (title, fields rating/title/body/photos/companion/visited/name, photo add/remove, cancel/submit)
    - [TripCard](src/features/trip/components/TripCard.tsx) — days/places counters, updated relative time
    - [NewTripDialog](src/features/trip/components/NewTripDialog.tsx) — full form (name/desc/destinations/days +/-, validation, submit)
    - [AddToTripButton](src/features/trip/components/AddToTripButton.tsx) — label, popover (empty/pick), trip list rows, added toast with day, create-new CTA
    - [SavedHeartButton](src/components/nav/SavedHeartButton.tsx), [UserAvatarButton](src/components/nav/UserAvatarButton.tsx) — aria labels
    - [SignOutButton](src/features/auth/components/SignOutButton.tsx) — toast messages + label (reuses MePage namespace)
    - Namespaces mới: `Review`, `TripCard`, `NewTrip`, `AddToTrip`
    - **(2026-05-26 session 7)** — SuggestPlaceForm + TripPlanner + small forms:
    - [SuggestPlaceForm](src/features/submit/components/SuggestPlaceForm.tsx) — toàn bộ dialog đóng góp: 4 price options, geolocation errors, 8 validation messages, 12 fields (name/category/province/district/address/coords/desc/price/hours/tags/photos/contributor), submitted toast, moderation notice. Category select dùng locale-aware label
    - [SubmissionsList](src/features/submit/components/SubmissionsList.tsx) — 3 status badges, empty state, delete confirm flow, locale-aware relative time + category label
    - [ProvinceChipPicker](src/features/trip/components/ProvinceChipPicker.tsx) — placeholder, remove aria, region labels (Bắc/Trung/Nam → North/Central/South)
    - [TripPlanner](src/features/trip/components/TripPlanner.tsx) — loading/notFound states, breadcrumb, header desc placeholder, delete confirm flow, day/place counts, destinations picker, day card (remove day, empty state, add from map), add day CTA. PlaceRow + AddPlaceToDay với scope toggle, search, no-suggestions
    - Namespaces mới: `Suggest`, `Submissions`, `ProvincePicker`, `TripPlanner`
    - **(2026-05-26 session 8)** — CategoriesBento + AI panel + utility metadata:
    - [CategoriesBento](src/components/CategoriesBento.tsx) — section overline/title/subtitle + 2 group tabs (lifestyle/travel) + BentoCatCard locale-aware label. Per-category metadata (tagline/highlights/counts) giữ VI vì cần editorial review
    - [ProvinceFilterChips](src/features/place/components/ProvinceFilterChips.tsx) — "Tất cả tỉnh" → all-provinces
    - [AISuggestPanel](src/features/ai/components/AISuggestPanel.tsx) — label, prompt, 3 examples, thinking state, input placeholder, unknownError, SuggestionCard view button
    - About page: full metadata + headline + badge + 2 CTAs (body copy giữ VI cho editorial pass)
    - Help / Privacy / Terms: metadata async qua `generateMetadata` (body copy giữ VI)
    - Namespaces mới: `CategoriesBento`, `ProvinceFilter`, `AISuggest`, `About`, `Help`, `Privacy`, `Terms`, `Error`, `NotFound`
    - **(2026-05-26 session 9)** — minor components batch:
    - [TripPickAddButton](src/features/trip/components/TripPickAddButton.tsx) — added/add to day label
    - [MapSidePanel](src/features/map/components/MapSidePanel.tsx) — collapse, viewport header, locale-aware category, empty state
    - [ActivityFeed](src/features/activity/components/ActivityFeed.tsx) — live badge, count, empty state, newlyApproved, fallback category, guest author, locale-aware `Intl.RelativeTimeFormat`
    - [ForkTripButton](src/features/trip-template/components/ForkTripButton.tsx) — copying state + copied toast + CTA
    - [RatingHistogram](src/features/review/components/RatingHistogram.tsx) — count label
    - [PlaceMeta](src/features/place/components/PlaceMeta.tsx) — info title, 4 field labels, 4 price labels, review suffix, tags
    - [PlaceHero](src/features/place/components/PlaceHero.tsx) — save/share/close aria + locale-aware category + lightbox prev/next/zoom
    - [NearbyPlaces](src/features/place/components/NearbyPlaces.tsx) — converted to async server, overline/title
    - [SearchFilters](src/features/search/components/SearchFilters.tsx) — all chip, 3 sort options, results count, locale-aware category labels
    - [CityCard](src/features/region/components/CityCard.tsx) — placeCount fallback labels (2 variants)
    - Namespaces mới: `TripPickAdd`, `Activity`, `ForkTrip`, `CityCard`
  - **Phase C foundation DONE (2026-05-26)**:
    - [supabase/migrations/0006_i18n_place_names.sql](supabase/migrations/0006_i18n_place_names.sql) — idempotent ADD COLUMN IF NOT EXISTS cho name_en/description_en/highlight_en (places) + name_en/description_en (place_submissions). **Cần chạy trên Supabase production.**
    - [PlaceFeatureProps](src/features/map/lib/places-data.ts) thêm `nameEn`/`highlightEn`/`descriptionEn` optional
    - [queries.ts](src/features/place/lib/queries.ts) — `currentLocale()` helper từ `getLocale()` next-intl, `rowToPlace(row, locale)` resolve name/highlight theo locale với VI fallback, tất cả list/get functions wire locale qua `Promise.all`
    - [PlaceFullPage](src/features/place/components/PlaceFullPage.tsx) — render `descriptionEn` khi locale=en + có data, fallback `placeholderDesc` text từ messages
    - [PlaceSubmission](src/features/submit/lib/types.ts) thêm `nameEn`/`descriptionEn` optional
    - [useSubmissions](src/features/submit/hooks/useSubmissions.ts) — row mapper + insert payload include EN columns
    - [SuggestPlaceForm](src/features/submit/components/SuggestPlaceForm.tsx) — section "🌐 English version (optional)" với 2 fields name_en + description_en, reset trên close
    - [admin/actions.ts](src/features/admin/actions.ts) — approveSubmission copy `name_en` + `description_en` từ submission sang places row
    - Namespaces mở rộng: `Suggest` thêm 6 keys cho EN section
  - **Phase C TODO còn lại**:
    - Bilingual editor cho places approved (admin chưa có per-place edit UI — chỉ có approve/reject submissions)
    - Backfill VI → EN cho 40 seed places (cần content team hoặc machine translation pass)
    - Optional: SubmissionsList hiển thị badge khi submission có EN data
    - Optional: GeoJSON feature props include EN fields (để client search có thể match cả hai language)
  - **Phase B TODO còn lại (đều minor / editorial)**:
    - `app/error.tsx` + `app/not-found.tsx` ở root layer ngoài NextIntlProvider — cần move xuống `[locale]/` hoặc workaround để dùng translations
    - Body copy của About/Help/Privacy/Terms cần editorial pass cho EN
    - Per-category metadata trong CategoriesBento (tagline/highlights/counts) cần editorial pass cho EN
    - `companionLabels` constants trong `src/features/review/lib/types.ts` còn VI (used in ReviewForm + ReviewCard)
    - Admin pages (`/admin/*`) — internal, low priority
  - **Phase C (TODO)**: migration thêm `name_en`, `description_en` cho `places` + `place_submissions`, queries fallback VI khi EN thiếu, admin form song ngữ
  - **Note**: nhiều component sâu (PlaceCard, CategoryCard, SearchBar, MapPlaceCard…) còn hard-code VI — sẽ migrate dần ở Phase B sau
- [x] **Realtime** (partial):
  - ✅ `usePresence` — "X người đang xem" trên place detail (hiện khi ≥2 viewer cùng lúc)
  - ✅ `useRealtimeReviews` — review mới tự append vào list không cần reload
  - ✅ `useRealtimePlaces` — place mới được approve tự hiện marker trên map (wired 2026-05-22)
  - [x] Activity feed landing — `ActivityFeed` ([components/ActivityFeed.tsx](src/features/activity/components/ActivityFeed.tsx)) trên homepage, fetch initial 8 mixed places+reviews từ Supabase, prepend places mới qua `useRealtimePlaces` (Session 2026-05-22)
- [x] **AI**:
  - ✅ Gemini API wired với rate-limit + cache
  - ✅ Viewport-aware: truyền bounds + GPS lên API, Gemini gợi ý địa điểm trong vùng đang xem (2026-05-22)
  - ✅ **History-aware (2026-05-26)** — [route.ts](app/api/ai/suggest/route.ts) dùng `model.startChat({history})`, nhận `history: HistoryTurn[]` (max 5 turn), bypass cache khi có history. Client [AISuggestPanel.tsx](src/features/ai/components/AISuggestPanel.tsx) snapshot `turns` (chỉ turn đã có response) trước khi append pending turn. System prompt thêm 2 quy tắc: hiểu câu nối tiếp ("rẻ hơn", "khu khác"…) + không lặp lại suggestion cũ.
- [x] **Curated trips** — `trip_templates` table + 4 templates seed + landing section "Sao chép — đi liền" + detail page `/trips/[slug]` + ForkTripButton (deep-copy template → user's trips) (Session 2026-05-22)
  - Migration `0005_trip_templates.sql`, seed `pnpm seed:trips`
  - [queries.ts](src/features/trip-template/lib/queries.ts), [actions.ts](src/features/trip-template/actions.ts)
  - **Admin CMS**: `/admin/trip-templates` ([TripTemplatesEditor.tsx](src/features/admin/components/TripTemplatesEditor.tsx)) — CRUD đầy đủ: cover upload, meta (slug/title/summary/season/duration/destinations/tags), days editor (add/remove/reorder day, edit label/note/placeSlugs CSV), toggle ẩn/hiện
- [x] **PWA** — ✅ manifest, service worker, offline page, install banner (done)

---

## 🎯 Cải thiện tiếp theo {#cải-thiện-tiếp-theo}

Sau khi i18n core đã ship (Phase A + B + C), 3 hướng nâng cấp theo thứ tự ưu tiên:

### 🅰️ Hướng A — Hoàn thiện i18n technical (quick wins)

> **✅ SEO i18n core DONE (2026-05-27)** — hreflang + sitemap + OG locale-aware đã ship.
> Helper [src/i18n/metadata.ts](src/i18n/metadata.ts) (`localizedAlternates`, `localizedHref`) dùng ở **20 files**
> (root layout + mọi page có `generateMetadata`). Sitemap emit cả `/vi` + `/en` + `x-default`
> ([app/sitemap.ts](app/sitemap.ts)). OG nhận `?locale=en` ([app/api/og/route.tsx](app/api/og/route.tsx#L9)).

| Mục | Effort | Impact | Status |
|---|---|---|---|
| **hreflang tags** trong root metadata (`<link rel="alternate" hreflang="vi/en/x-default">`) | Nhỏ | Cao — SEO i18n chuẩn cho Google | ✅ |
| **Sitemap include EN routes** + `<xhtml:link rel="alternate">` alternates | Nhỏ | Cao — Google index EN | ✅ |
| **OG metadata** locale-aware (hiện tại description tiếng VI cho cả /en) | Nhỏ | Trung — social share đúng ngôn ngữ | ✅ |
| Move `app/error.tsx` + `not-found.tsx` vào `[locale]/` để dùng `useTranslations` | Nhỏ | Thấp | ✅ (thêm bản `[locale]/`, root giữ làm fallback) |
| `companionLabels` constants ([src/features/review/lib/types.ts](src/features/review/lib/types.ts)) migrate sang messages | Nhỏ | Thấp | ✅ (namespace `Companion`) |
| Admin pages (`/admin/*`) translate UI | Trung | Thấp (internal) | 🔄 phần chrome + 3 page lite DONE (2026-05-27); 3 editor lớn (Places/Hero/TripTemplates) skip vì internal low ROI |

**File cần đụng:**
- [app/layout.tsx](app/layout.tsx) — root metadata: thêm `alternates.languages`
- [app/[locale]/(marketing)/page.tsx](app/[locale]/(marketing)/page.tsx) + tất cả pages có `generateMetadata` — thêm `alternates.languages` per-route
- [app/sitemap.ts](app/sitemap.ts) — emit cả `/vi/...` và `/en/...` (hoặc dùng `next-intl` sitemap helper)
- [api/og/route.tsx](app/api/og/route.tsx) — nhận `?locale=en` để switch font/copy nếu cần

### 🅱️ Hướng B — Content & polish (editorial)

| Mục | Effort | Impact | Status |
|---|---|---|---|
| **Backfill places EN** (name_en/highlight_en) | Lớn (content) | Cao — EN users thấy ngay | ✅ (2026-05-27, đã chạy production — 17 row backfill) |
| → Gemini batch script translate VI → EN | Trung (1 script) | | ✅ [scripts/translate-places.ts](scripts/translate-places.ts) (`pnpm translate:places`) |
| Body copy EN cho About/Help/Privacy/Terms (hiện chỉ metadata) | Trung | Trung | ✅ (2026-05-27, About + Help + Privacy + Terms) |
| CategoriesBento per-category EN metadata (12 taglines + highlights + counts) | Nhỏ | Thấp | ✅ (2026-05-27) |
| Mock data 40 → 80 places (HN/HCM/ĐN) — giảm gaps `/category/checkin`, `/category/experience` | Lớn | Trung | ✅ (2026-05-27, hiện **87 places** — vượt target) |
| Admin per-place bilingual editor (hiện chỉ có approve/reject) | Trung | Trung | ✅ [PlacesEditor.tsx](src/features/admin/components/PlacesEditor.tsx) |

**Backfill EN content — cách chạy:**
- `pnpm translate:places --dry-run` — xem trước bản dịch (không ghi DB). Đã verify 2026-05-27: 17/40 places thiếu EN, chất lượng dịch tốt (giữ proper noun, dịch highlight tự nhiên).
- `pnpm translate:places` — backfill các row thiếu `name_en`/`highlight_en`.
- `pnpm translate:places --force` — dịch lại toàn bộ (ghi đè EN cũ).
- Lưu ý: bảng `places` không có cột VI `description`, nên script chỉ dịch `name` + `highlight`. `description_en` để null.

**File còn cần làm:**
- Editorial pass cho `app/[locale]/(marketing)/about/page.tsx`, `help/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`

### 🅲 Hướng C — Sản phẩm & performance

| Mục | Effort | Impact | Status |
|---|---|---|---|
| **Performance audit** — Lighthouse, bundle size sau khi thêm next-intl + 50 components | Trung | Cao — UX | ⏳ |
| → Có thể có bundle bloat từ `useTranslations` (~24KB next-intl client) | | | |
| → Check ảnh hưởng LCP ở landing (rất nhiều Reveal + framer-motion) | | | |
| **Accessibility audit** — keyboard nav, screen reader labels, focus traps trong dialogs | Trung | Trung | ⏳ |
| **Map marker labels theo locale** — hiện tại VI cứng trên symbol layer | Nhỏ | Trung — bilingual UX nhất quán | ✅ (2026-05-27) |
| **PWA screenshots refresh** — chụp lại sau khi UI ổn định (cần manual) | Nhỏ | Thấp | ⏳ |
| **Realtime EN broadcast** — `useRealtimePlaces` payload thiếu `name_en` | Nhỏ | Thấp | ✅ (2026-05-27) |

### 🌟 Khuyến nghị thứ tự ship

- ✅ **Hướng A (SEO i18n)** — DONE (hreflang + sitemap + OG locale-aware).
- ✅ **AI-backfill places EN (Hướng B)** — DONE 2026-05-27, `pnpm translate:places` đã chạy production (17 row updated, `name_en` + `highlight_en`).

**Đang làm / kế tiếp (2026-05-27):**
1. ✅ **Quick i18n cleanups** — DONE 2026-05-27:
   - [app/[locale]/error.tsx](app/[locale]/error.tsx) + [app/[locale]/not-found.tsx](app/[locale]/not-found.tsx) — bản localized dùng `useTranslations("Error"/"NotFound")` (bắt mọi route trong `[locale]`). Root `app/error.tsx`/`not-found.tsx` giữ làm fallback VI cho route non-localized (`/auth`, `/offline`, `/design`).
   - `companionLabels` → namespace `Companion` trong messages; `types.ts` export `companionKeys`; ReviewForm + ReviewCard dùng `useTranslations("Companion")`.
   - `useRealtimePlaces` payload thêm `name_en`; MapCanvas chọn tên marker theo `useLocale()` (place mới approve hiện đúng ngôn ngữ).
   - typecheck pass.
2. **Performance + bundle audit (Hướng C)** — 🔄 bundle audit DONE (2026-05-27), Lighthouse runtime chưa chạy.
   - **Build pass 22s, 356 trang.** Shared baseline **103 kB** (tốt). `/explore` chỉ **116 kB** (map lazy-load đúng). Landing `/[locale]` **246 kB**, `/place/[slug]` **263 kB** (nặng nhất — lightbox + reviews eager). Middleware **102 kB** (intl + supabase, chạy mọi request).
   - **Đã fix:** server-geo không còn log `DYNAMIC_SERVER_USAGE` như lỗi lúc prerender landing (landing giữ static, client geolocation lo phần geo); dọn ~10 import/biến thừa (typecheck + lint sạch các warning đó).
   - **Bỏ qua (theo yêu cầu):** convert 5 chỗ `<img>` → `next/Image` (TopBar/FloatingNavbar/Footer/AccountPanel/sign-in) — vẫn là LCP win nếu sau này muốn làm.
   - **Còn lại:** Lighthouse runtime (LCP/CLS/TBT) trên `next start` — cần lighthouse CLI.
   - **Fix (2026-05-27):** `readCache`/`writeCache` ở server-geo đã re-enable, debug logs dọn sạch.
   - **Đã verify (2026-05-27):** exhaustive-deps `user` ở 4 hook (useReviews/Saved/Submissions/Trips) **KHÔNG phải bug** — deps dùng `user?.id` nên re-run đúng khi đăng nhập/xuất; chỉ là false positive của lint rule.
3. ✅ **Editorial EN body copy** — DONE (2026-05-27): About + Help + Privacy + Terms, toàn bộ body chuyển từ hardcode VI sang messages, render `t.rich` (b/link/code/email chunks). Ngày "Cập nhật" ở Privacy/Terms giờ locale-aware (`en-US`/`vi-VN`). typecheck pass.
4. ✅ **Rebrand "Bộ sưu tập"** — DONE (2026-05-27): section Collections cũ trùng concept với Curated trips (route `/collection/[slug]` không tồn tại, link gãy). Đã xoá `CollectionsSection` + data hardcode (`src/features/region/data.ts`), repoint `CuratedTripsSection` dùng namespace `collections*` để section curated trips giờ mang nhãn "BỘ SƯU TẬP" theo Vietnamese branding. Nav `/collection` → `/#bo-suu-tap` anchor (section có `id="bo-suu-tap" scroll-mt-24`). Cleanup: keys `curatedOverline/Title/Subtitle` + `collectionMeta` xoá khỏi messages, import `Card`/`CardBody` thừa bỏ. typecheck + lint sạch (12 warning còn lại đều là intentional).
5. ✅ **CategoriesBento per-category EN** — DONE (2026-05-27): 12 categories × (count + tagline + highlights[]) chuyển từ hardcode VI sang messages namespace `CategoriesBento.meta.<key>`. Component đọc qua `t()` cho count/tagline + `t.raw()` cho highlights array. `isHot` boolean giữ trong code (`HOT_CATEGORIES` Set, không phải text). Người EN giờ thấy "Salt coffee", "Egg coffee", "Captivating sounds and late-night energy" thay vì hardcode VI. typecheck pass.
6. 🔄 **Admin UI i18n (phần chrome)** — DONE (2026-05-27): namespace `Admin` mới (vi+en); migrate **AdminShell** (sidebar nav + mobile strip + "Về trang chủ"), **Dashboard page** (heading + 2 stat labels + metadata), **/admin/places approval** (heading/count/empty/status/submittedBy rich text/approve+reject), **/admin/reviews** (tương tự). Ngày dùng locale-aware (`en-US`/`vi-VN`). typecheck pass. **Skip:** 3 editor lớn (PlacesEditor 383, HeroPresetsEditor 685, TripTemplatesEditor 577 = 1645 dòng) + 3 page wrapper editor — internal low ROI, để khi cần.
7. ✅ **I18n straggler pass** — DONE (2026-05-27): 3 file user-facing còn VI hardcode đã migrate.
   - **SavedPlaces** (`/saved` nội dung): overline/title/empty/count/emptyHeadline/emptyHint/emptyCta — namespace `SavedPage` mở rộng.
   - **DynamicHeroText** (4 rotating phrases trên hero landing — visible mỗi lần load): mảng `heroDynamicPhrases` đọc qua `t.raw()`. EN: "your way." / "with local taste." / "endlessly chill." / "no rip-offs."
   - **PWAProvider** (install banner mobile): namespace `PWA` mới (bannerTitle/bannerHint/install + reuse `Common.close` cho aria).
   - Phụ: cài `@dnd-kit/*` deps thiếu (do TripPlanner mới thêm trong commit trước) — typecheck đang fail vì lý do unrelated, giờ pass.
   - ⚠️ **Privacy + Terms là legal copy** — bản EN do mình dịch máy, **org nên review/sở hữu wording chính thức** (đặc biệt phần trách nhiệm/liability + GDPR).
   - Namespaces mở rộng: `About` (intro/philosophy×4/roadmap×3), `Help` (badge/title/subtitle/q1–q6/a1–a6), `Privacy` (badge/title/updated/s1–s4/contact), `Terms` (badge/title/updated/intro/s1/s2+ban1–4/note/s3/contact).
4. ✅ **Mở rộng data 70 → 80 places** (2026-05-27) — thêm 10 places: checkin (Hồ Hoàn Kiếm, Bưu điện SG, Nguyễn Huệ, Cầu Vàng Ba Nà), experience (Bát Tràng, Food Tour HN, Cooking SG, Trà Quế), nightlife (Bùi Viện), hidden (The Bookworm). Seed production xong.
5. ✅ **server-geo cache re-enable** (2026-05-27) — bỏ comment `readCache`/`writeCache`, dọn debug logs.
6. ✅ **Lighthouse + a11y pass** (2026-05-27):
   - Performance 63 / Accessibility 93–96 baseline trên localhost.
   - Preload hint hero image (`ReactDOM.preload` wsrv.nl URL) → browser fetch sớm hơn.
   - `text-text-subtle` contrast: `#9a9890` → `#706e6b` (light) / `#6e6c67` → `#807e7a` (dark) → WCAG AA ≥4.5:1.
   - Hero dot buttons: `p-2.5 -m-2.5` padding → touch target ≥24px.
   - DynamicHeroBackground: dọn 10 debug console.log.

7. ✅ **Map marker labels theo locale** (2026-05-27):
   - `PROVINCE_EN_NAMES` export trong [src/config/regions.ts](src/config/regions.ts) — 36 entries (34 tỉnh + 2 quần đảo VI→EN).
   - Helper `provinceNameExpr(locale)` trong [MapCanvas.tsx](src/features/map/components/MapCanvas.tsx) — trả về `["get", "name"]` (VI) hoặc MapLibre `match` expression (EN).
   - `installProvinceLayers` nhận `locale` param, dùng expression đúng từ lần render đầu.
   - `useEffect([locale])` — gọi `setLayoutProperty` trên `LAYER_PROVINCE_LABELS` + `LAYER_ISLAND_LABELS` khi user toggle VI/EN.
   - typecheck pass.

**Kế tiếp (2026-05-28):**
- **Lighthouse runtime** — chạy `lighthouse http://localhost:3000 --view` sau khi cài `npm i -g lighthouse`, lấy số LCP/CLS/TBT thực tế
- **Accessibility audit sâu** — keyboard nav, focus traps trong dialogs (score hiện 93–96)

---

## 🐛 Known issues

### ~~Dark mode contrast~~ — FIXED (verified 2026-05-26)
`--brand-700` dark đã là `#ff9e99` (light salmon) trên `--brand-50` dark `#2a0e0c` → contrast ratio **9.11:1** (WCAG AAA). File [tokens.css:70](src/styles/tokens.css#L70) comment cũng confirm. Note này từ session cũ, đã được fix trong commit `cd67ae3`.

### ~~Mock data còn 40 places~~ — FIXED (2026-05-27)
Data đã **80 places** (IDs 1–80). Thêm 10 places mới: Hồ Hoàn Kiếm, Bát Tràng, Food Tour HN, The Bookworm, Bưu điện SG, Nguyễn Huệ, Bùi Viện, Cooking class SG, Cầu Vàng Ba Nà, Làng rau Trà Quế. Đã seed production.

### Mapbox token cũ trong code
[src/lib/env.ts](src/lib/env.ts) còn schema check `NEXT_PUBLIC_MAPBOX_TOKEN` optional — không xài vì swap sang MapLibre. Có thể clean up sau.

### Search bar trong navbar (xl+) vs MapSearchBar
Hai search bars khác mục đích nhưng UX có thể confuse — navbar search → `/search` page; map search → action-on-map. Đã giải quyết tốt với MapSearchBar floating dropdown nhưng có thể polish copy/icon thêm.

### PWA screenshots placeholder
`public/screenshots/` vẫn còn ảnh placeholder. Chưa ảnh hưởng chức năng, chỉ cần thay khi có thời gian chụp màn hình thật.

### ~~Hero stats hardcoded~~ — FIXED (2026-05-22)
Đã wire `getSiteStats()` ([queries.ts](src/features/place/lib/queries.ts)) — landing fetch placeCount / provinceCount / categoryCount / avgRating / userCount từ Supabase, fallback về mock khi backend disabled.

---

## 🔧 Resume checklist (phiên sau)

### 0. ~~Push & migrate~~ — ✅ DONE (2026-05-26/27)
Branch `pharse3` đã sync với `origin/pharse3`, working tree sạch. Admin-merger migration
(`0002_admin_merger_2025.sql`) + i18n migration (`0006`) đã chạy production. Không còn pending push.

### 0b. **Backfill EN content** (ưu tiên cao — script đã sẵn sàng):
```powershell
pnpm translate:places --dry-run   # xem trước
pnpm translate:places             # backfill 17 row thiếu EN vào production
```
Ghi thẳng vào Supabase production qua service-role key. Idempotent — chỉ đụng row thiếu `name_en`/`highlight_en`.

### 1. **Smoke test mới (sau merger):**
   ```powershell
   pnpm dev
   ```
   Mở:
   - http://localhost:3000/explore — zoom out, thấy tên 34 tỉnh + ranh giới xám?
   - Tìm "Bắc Giang" → suggest "Bắc Giang → Bắc Ninh"? Click → polygon Bắc Ninh đỏ?
   - Tìm "Phú Thọ" → polygon bao cả Vĩnh Phúc + Hòa Bình cũ (gộp)?
   - Tìm "TP. HCM" → bao Sài Gòn + Bình Dương + Côn Đảo?
   - Tìm "Đà Nẵng" → bao Đà Nẵng + Quảng Nam (Hội An)?

### 2. **Smoke test cũ:**
   - http://localhost:3000/ — landing, categories marquee, search homepage gõ "Hòa Bình" có ra "Phú Thọ" không?
   - http://localhost:3000/place/hoi-an — chip province hiện "Đà Nẵng"?
   - http://localhost:3000/place/cafe-giang — detail hiện?
   - http://localhost:3000/sign-in — Google + magic link hiện?
   - http://localhost:3000/me — session-aware?

### 3. **Auth test:**
   - Click "Đăng nhập với Google" → consent → redirect với navbar avatar
   - `/me` hiện "Xin chào, ..." + nút Đăng xuất
   - Magic link: nhập email → check inbox → click link → đăng nhập

### 4. **Verify Supabase wired:**
   - DevTools Network → fetch `*.supabase.co/rest/v1/places` (read path)
   - DB: `profiles` row tự tạo khi user mới signup

### 5. **Smoke test i18n (Phase A + B + C đã ship):**
   - `http://localhost:3000/` — landing VI, navbar có pill `VI`/`EN`
   - Click `EN` → URL thành `/en` → toàn bộ UI English (~95% string)
   - `/en/explore` — map chrome + place card + search + filter tất cả English
   - `/en/place/cafe-giang` — title metadata English, place name vẫn VI (chưa backfill `name_en` trong DB)
   - `/en/submit` → form có section "🌐 English version (optional)"
   - Toggle `VI` ở bất kỳ page → preserve path
   - DB check: `places.name_en` column tồn tại (migration 0006 chạy production rồi)

### 6. **Hướng tiếp theo — xem [section Cải thiện tiếp theo](#cải-thiện-tiếp-theo) ở giữa file** cho chi tiết. Top 3:
   1. **SEO i18n** (hreflang + sitemap với /en routes + locale-aware OG) — small effort, high SEO value
   2. **Performance audit** — Lighthouse + bundle size sau khi thêm next-intl + 50 components
   3. **AI-backfill 40 places EN content** — script Gemini dịch VI → EN, write vào DB columns

---

## 📁 File map quan trọng

```
d:\Work\VN-Map\
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
