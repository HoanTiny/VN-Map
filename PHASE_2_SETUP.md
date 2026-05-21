# Phase 2 — Supabase Backend Setup

> Phase 2 swap localStorage demo → real Supabase backend với Postgres + PostGIS + Auth + Storage.
> Hướng dẫn này cài Foundation (Milestone 2.1). Sau khi xong, bước tiếp theo sẽ swap data layer.

## Yêu cầu

- Tài khoản Supabase (miễn phí, **không cần thẻ**) — đăng ký tại [supabase.com](https://supabase.com).
- Node 18.18+ (bạn đang chạy Node 20 — ok).
- `pnpm` hoặc `npm`.

---

## Bước 1 — Tạo Supabase project

1. Vào [app.supabase.com](https://app.supabase.com) → **New project**.
2. Chọn region **Southeast Asia (Singapore)** — gần Việt Nam nhất, latency thấp.
3. Đặt password mạnh cho database — **lưu lại**, sẽ cần nếu muốn dùng `psql`.
4. Đợi ~1-2 phút setup.

## Bước 2 — Lấy keys

Trong dashboard project:

1. **Settings (sidebar) → API**.
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (Show secret) → `SUPABASE_SERVICE_ROLE_KEY` — **SERVER ONLY**, không bao giờ commit hoặc lộ ra client.

## Bước 3 — Setup .env.local

```powershell
Copy-Item .env.example .env.local -Force
```

Mở `.env.local`, paste 3 keys vào:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## Bước 4 — Chạy SQL migration

1. Trong dashboard: **SQL Editor** (sidebar).
2. Click **+ New query**.
3. Mở [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql), copy toàn bộ.
4. Paste vào editor, click **Run** (góc dưới phải).
5. Verify: **Table Editor** sidebar → thấy 6 bảng:
   - `profiles`
   - `places`
   - `reviews`
   - `saved_places`
   - `trips`
   - `place_submissions`

Migration script bao gồm:
- `uuid-ossp` + `postgis` extensions
- 6 ENUMs (place_source, submission_status, review_status, user_role, price_range, companion)
- 6 tables + indexes (gist cho geography)
- Trigger auto-create `profiles` row khi user signup
- RPC `places_in_bbox` cho map source
- Row Level Security policies (public read places, user-owned trips/saves, mod-only admin)

## Bước 5 — Cài deps mới

```powershell
pnpm install
```

Sẽ cài thêm:
- `@supabase/supabase-js` — core client
- `@supabase/ssr` — Next.js SSR + cookie auth
- `tsx` (dev) — chạy TypeScript seed script

## Bước 6 — Seed places vào DB

```powershell
pnpm seed:places
```

Script ([scripts/seed-places.ts](scripts/seed-places.ts)) đọc 40 places từ `places-data.ts` rồi upsert vào Supabase qua service-role key. Idempotent — chạy lại nhiều lần OK.

Verify: dashboard **Table Editor** → `places` → thấy 40 rows.

## Bước 7 — Bật Auth providers

1. **Authentication (sidebar) → Sign In / Providers** (Supabase đã rename gần đây — trước đây là "Providers").
2. **Email** đã bật mặc định — OK cho dev. Không cần thay đổi.
3. **OAuth providers** (Google / GitHub / Apple…): scroll xuống thấy. Bật provider nào muốn → điền Client ID + Secret từ provider đó. Optional cho Phase 2 — Email đủ dùng.
4. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: thêm `http://localhost:3000/**` (cho phép callback về dev)

## Bước 8 — Restart dev server

```powershell
# Ctrl+C ở terminal đang chạy pnpm dev
pnpm dev
```

App khởi động lại với Supabase wired ở foundation level. Middleware refresh session cookies, server/client utilities sẵn sàng dùng.

---

## Verify foundation hoạt động

Mở browser DevTools console trên localhost:3000:

```js
// Trong Console
await fetch('https://<your-project>.supabase.co/rest/v1/places?limit=1', {
  headers: { apikey: '<your-anon-key>' }
}).then(r => r.json())
```

Phải trả về 1 place row.

---

## Files đã thêm trong codebase

```
src/lib/supabase/
  client.ts          # Browser Supabase client
  server.ts          # Server Supabase client (cookies-aware)
  middleware.ts      # Session refresh helper
  types.ts           # Database type stub (regen sau)
supabase/migrations/
  0001_init.sql      # Schema + RLS + RPC
scripts/
  seed-places.ts     # Seed runner
middleware.ts        # Next.js root middleware
PHASE_2_SETUP.md     # File này
```

---

## Bước tiếp theo (Milestone 2.2 — Read paths)

Sau khi foundation work, sẽ:

1. **Replace map data source** — `placesData` GeoJSON static → fetch từ `places_in_bbox` RPC.
2. **Place detail** — `getPlaceBySlug` → Supabase query.
3. **Province / Category / Search pages** — query DB.

Khi nào sẵn sàng (env vars setup + migration chạy xong + seed xong), báo tôi để tiếp.

---

## Trouble-shooting

**"Missing Supabase env vars"** khi load page → `.env.local` chưa có hoặc dev server chưa restart sau khi sửa env.

**Seed lỗi `relation places does not exist`** → migration chưa chạy. Quay lại Bước 4.

**Seed lỗi PostGIS** → extension chưa enable. Trong dashboard: **Database → Extensions → search "postgis" → Enable**. Rồi chạy lại migration.

**Row Level Security blocked** khi test query — đúng rồi! RLS bảo vệ data. Anon key chỉ read được `places` (public). Khác bảng cần sign-in. Seed script dùng service-role bypass RLS.

**Free tier limits**: 500MB DB, 1GB storage, 50k MAU. Đủ cho dev + early beta.
