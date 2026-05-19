# Map-VN

Nền tảng bản đồ trải nghiệm Việt Nam — Next.js 15 · React 19 · Tailwind · Mapbox GL.

## Tài liệu nền

- [Product & Design System](PRODUCT_AND_DESIGN_SYSTEM.md)
- [Information Architecture](INFORMATION_ARCHITECTURE.md)
- [Frontend Architecture](FRONTEND_ARCHITECTURE.md)

## Cài đặt

```bash
pnpm install        # hoặc: npm install / yarn
cp .env.example .env.local
# điền NEXT_PUBLIC_MAPBOX_TOKEN (lấy từ https://account.mapbox.com)
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Scripts

| Lệnh | Mục đích |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build production |
| `pnpm start` | Start production |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm format` | Prettier |

## Cấu trúc

```
app/                 Next.js App Router (routing only)
  (app)/             Top-level user-facing routes (TopBar + BottomTabBar)
src/
  ui/                Design-system primitives
  components/        Cross-feature composites (nav, theme)
  features/          Domain-sliced (map, place, search, trip, review…)
  lib/               Framework-agnostic utilities
  stores/            Zustand slices
  hooks/             Cross-feature hooks
  config/            Site, categories, nav definitions
  styles/            tokens.css + globals.css + mapbox.css
  providers/         AppProviders (QueryClient + Theme + LazyMotion)
```

## Routes hiện có (scaffold)

- `/` — Home (hero + category grid)
- `/explore` — Map explorer (Mapbox, lazy-loaded)
- `/place/[slug]` — Place detail (placeholder)
- `/sitemap.xml`, `/robots.txt`

Các route khác (`/search`, `/region`, `/category`, `/collection`, `/trip`, `/saved`, `/me`, `/admin`, `/(auth)`) chưa scaffold — tham khảo [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §2.

## Design tokens

Tất cả color/shadow là CSS variables ở [src/styles/tokens.css](src/styles/tokens.css), wired vào Tailwind tại [tailwind.config.ts](tailwind.config.ts). Dark mode bật bằng `data-theme="dark"` trên `<html>`, có no-flash script ở root layout.

## Mapbox

- Token lấy ở [account.mapbox.com](https://account.mapbox.com), set vào `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Style tạm thời dùng Mapbox light/dark mặc định (`MAP_STYLE_URL` trong [src/lib/constants.ts](src/lib/constants.ts)). Custom brand-coherent style sẽ thêm sau.
- Component map ở [src/features/map/components/MapCanvas.tsx](src/features/map/components/MapCanvas.tsx), lazy-loaded qua `dynamic(..., { ssr: false })`.

## Bước tiếp theo

1. `pnpm install` để cài deps.
2. Thêm Mapbox token vào `.env.local`.
3. `pnpm dev` và mở `/explore` để kiểm tra map render.
4. Scaffold thêm: Sheet primitive (Radix Dialog) · Supabase client · Place data model · Search overlay.
