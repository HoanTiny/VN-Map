# Map-VN — Product & Design System

> Interactive map for exploring Vietnam — a modern travel platform.
> Reference language: **Airbnb** (warm, content-first cards) + **Apple Maps** (clean cartography, glass overlays) + **Spotify** (confident dark mode, bold accent) + **Notion** (typographic clarity, restraint).

---

## Part 1 — Product

### 1.1 Vision
Map-VN giúp người dùng **khám phá Việt Nam** qua một bản đồ tương tác đẹp, nhanh và đáng tin: từ bãi biển, núi rừng, di sản, ẩm thực đến thành phố. Mục tiêu là trở thành "Airbnb-grade" của bản đồ du lịch Việt Nam — cảm giác premium, ấm áp, và có chất riêng Việt Nam (lotus-coral, kiểu chữ editorial).

### 1.2 Target Users
| Persona | Nhu cầu chính | Hành vi quan trọng |
|---|---|---|
| **Traveler (local)** | Tìm điểm đến cuối tuần, lưu danh sách yêu thích | Search → filter → save trip |
| **Traveler (inbound)** | Khám phá theo vùng / chủ đề, lên lộ trình nhiều ngày | Map browse → cluster zoom → multi-day plan |
| **Content creator / editor** | Đăng địa điểm, chỉnh sửa metadata, đính ảnh | Auth → CMS → publish |
| **Casual viewer** | Xem & cảm nhận, không mục tiêu rõ | Hero map → fly-to highlight reel |

### 1.3 Core Features (MVP)
1. **Map Explorer** — bản đồ toàn quốc, tile light/dark, smooth fly-to, cluster.
2. **Place Detail** — bottom sheet / side panel với ảnh, mô tả, danh mục, giờ mở cửa, link.
3. **Search & Filter** — search theo tên/tỉnh, filter theo category (beach/mountain/heritage/food/city/nature).
4. **Save & Trip** — heart 1 địa điểm, gom thành "trip", chia sẻ link.
5. **Region View** — chọn tỉnh/thành để xem danh sách POI nổi bật.
6. **Dark Mode** — toggle thủ công + theo system.
7. **Locale** — VI mặc định, EN fallback; số liệu/đơn vị metric.

### 1.4 Out of Scope (MVP)
- Booking / thanh toán.
- Reviews & rating người dùng.
- Realtime chat / cộng đồng.
- Native app (web-first, responsive).

### 1.5 Success Metrics
- TTI < 2.5s trên 4G mid-range mobile.
- Lighthouse a11y ≥ 95, performance ≥ 90.
- 30-day retention ≥ 25% cho user đã lưu ≥ 1 place.
- ≥ 60% session có ít nhất 1 marker click.

### 1.6 Tech Stack (đề xuất)
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion.
- **Map**: MapLibre GL JS (hoặc Mapbox GL) với custom style JSON.
- **State**: Zustand cho UI state, TanStack Query cho data.
- **Backend**: Supabase / Postgres + PostGIS (geo queries) + Edge Functions.
- **CDN/Hosting**: Vercel + Cloudflare R2 cho ảnh.
- **Analytics**: Plausible (privacy-first).

### 1.7 Information Architecture
```
/                       Home (hero map + featured)
/explore                Full-screen map explorer
/place/[slug]           Place detail page (SEO route)
/region/[slug]          Region listing
/trip/[id]              Saved trip view
/design                 Internal: design system showcase
/(auth)/sign-in         Auth (editor/admin only in MVP)
/admin                  Place CMS (editor role)
```

---

## Part 2 — Design System

### 2.1 Brand Direction
- **Personality**: warm · premium · calm · exploratory.
- **Identity cues**: flag-red brand + gold star accent, soft serif editorial, generous whitespace — *Vietnamese identity rõ ràng nhưng không sến*.
- **Density**: low-to-medium. Map is the hero; chrome is quiet.
- **Mode dual-citizenship**: light = daytime explorer; dark = "night map" (Apple Dark + Spotify chrome).

### 2.2 Color Palette

**Brand — Cờ Việt Nam (flag red)**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand-50`  | `#FDEBEA` | `#2A0E0C` | tint background |
| `--brand-100` | `#F9D0CD` | `#3A1612` | hover tint |
| `--brand-500` | `#DA251D` | `#E63B33` | **primary CTA** (đỏ cờ) |
| `--brand-600` | `#B81E18` | `#DA251D` | pressed |
| `--brand-700` | `#8E1712` | `#B81E18` | text-on-tint |

**Gold — Sao vàng (flag yellow accent)**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--gold-50`  | `#FFF8E0` | `#2C2410` | tint background |
| `--gold-100` | `#FFEFB0` | `#3D3219` | hover tint |
| `--gold-500` | `#FFCD00` | `#FFD83D` | star accent, badges |
| `--gold-600` | `#E0B500` | `#FFCD00` | pressed |
| `--gold-700` | `#B89200` | `#E0B500` | text-on-tint |

Use gold sparingly: featured badges, decorative stars, premium highlights. **Không** dùng làm CTA chính — brand red giữ vai trò đó.

**Neutrals (Notion-warm gray)**

| Token | Light | Dark |
|---|---|---|
| `--bg`           | `#FBFAF8` | `#0E0F11` |
| `--surface`      | `#FFFFFF` | `#17181B` |
| `--surface-2`    | `#F4F2EE` | `#1F2024` |
| `--border`       | `#E8E4DE` | `#2A2C31` |
| `--text`         | `#1A1A1A` | `#F5F4F1` |
| `--text-muted`   | `#6B6960` | `#A2A09A` |
| `--text-subtle`  | `#9A9890` | `#6E6C67` |

**Semantic**

- `--success` `#2BA672` / dark `#3DD598`
- `--warning` `#F3A847` / dark `#FFB958`
- `--danger`  `#E5484D` / dark `#FF6369`
- `--info`    `#3A8DFF` / dark `#5AA0FF`

**Map category accents**

| Category | Hex |
|---|---|
| beach     | `#23B5C7` |
| mountain  | `#5E8F5A` |
| heritage  | `#B8862F` |
| food      | `#FF5A3C` (coral — phân biệt với brand đỏ cờ) |
| city      | `#7C6CF0` |
| nature    | `#2E9E6B` |

> All pairings pass **WCAG AA** on `--surface` in both modes.

### 2.3 Typography

- **UI / Display**: `Inter` variable (covers Vietnamese diacritics).
- **Editorial**: `Fraunces` variable — Airbnb-magazine soft serif, dùng cho hero + tên địa điểm lớn.
- **Mono**: `JetBrains Mono` — toạ độ, mã.

**Scale (1.200 minor third)**

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `display-xl` | 56 / 64 | 500 Fraunces | hero |
| `display-lg` | 40 / 48 | 500 Fraunces | section hero |
| `h1`         | 32 / 40 | 600 | page title |
| `h2`         | 24 / 32 | 600 | card title |
| `h3`         | 20 / 28 | 600 | subhead |
| `body-lg`    | 17 / 26 | 400 | long-form |
| `body`       | 15 / 22 | 400 | default |
| `body-sm`    | 13 / 20 | 400 | meta |
| `caption`    | 12 / 16 | 500 | label, tag |
| `overline`   | 11 / 14 | 600 (tracking 0.08em, uppercase) | eyebrow |

Tracking: `-0.02em` display · `-0.01em` h1–h3 · `0` body.

### 2.4 Spacing

4-pt base, 8-pt layout grid.

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

- Card padding: 20 mobile / 24 desktop.
- Section vertical rhythm: 64 mobile / 96 desktop.
- Container widths: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440.

### 2.5 Border Radius

`xs 4 · sm 6 · md 10 · lg 14 · xl 20 · 2xl 28 · pill 9999`

- Buttons: pill (Primary/Tonal/Destructive) · `lg` (Secondary/Ghost).
- Cards: `xl` (20).
- Sheets / modals: `2xl` (28), top-corners only on bottom sheets.
- Inputs: `lg`.
- Map markers: pill.

### 2.6 Shadow / Elevation

Warm-tinted, low-spread, Apple-soft — never CSS-default gray.

| Token | Light | Dark |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(20,14,8,.06)` | `0 1px 2px rgba(0,0,0,.4)` |
| `shadow-sm` | `0 2px 6px rgba(20,14,8,.06), 0 1px 2px rgba(20,14,8,.04)` | `0 2px 6px rgba(0,0,0,.5)` |
| `shadow-md` | `0 6px 16px rgba(20,14,8,.08), 0 2px 4px rgba(20,14,8,.04)` | `0 8px 20px rgba(0,0,0,.55)` |
| `shadow-lg` | `0 16px 40px rgba(20,14,8,.10), 0 4px 12px rgba(20,14,8,.06)` | `0 16px 40px rgba(0,0,0,.6)` |
| `shadow-xl` | `0 32px 64px rgba(20,14,8,.14)` | `0 32px 64px rgba(0,0,0,.7)` |
| `shadow-glow-brand` | `0 0 0 6px rgba(218,37,29,.22)` | `0 0 0 6px rgba(230,59,51,.28)` |

> Rule: shadow > `md` không kết hợp với border hiện rõ — chọn một.

### 2.7 Dark Mode

- Trigger: `:root[data-theme="dark"]` + `prefers-color-scheme`, override lưu `localStorage`.
- Nền **không pure black** — `#0E0F11` (Spotify-warm).
- Surfaces tăng dần độ sáng: `bg → surface → surface-2 → glass`.
- Brand sáng hơn 1 bậc trong dark để giữ tương phản.
- Map tile dark style riêng: đất xanh navy mờ, đường coral dịu, nước cyan mềm.
- Ảnh hero dark: `filter: brightness(.92) contrast(1.02)`.

### 2.8 Button Variants

Sizes: `sm 32h · md 40h · lg 48h · xl 56h`. Horizontal padding ≥ height × 0.5.

| Variant | BG | Text | Border | Hover | Use |
|---|---|---|---|---|---|
| **Primary** | `--brand-500` | white | — | `--brand-600` + `shadow-md` | "Khám phá", "Lưu chuyến đi" |
| **Secondary** | `--surface` | `--text` | `1px --border` | `--surface-2` | "Lọc", "Chia sẻ" |
| **Ghost** | transparent | `--text` | — | `--surface-2` | toolbar |
| **Tonal** | `--brand-50` | `--brand-700` | — | `--brand-100` | secondary mềm |
| **Destructive** | `--danger` | white | — | bậc đậm hơn | xoá trip |
| **Glass** | glass token | `--text` | `1px rgba(255,255,255,.18)` | bg +6% | nổi trên map |
| **Icon** | transparent/glass | `--text` | optional | `--surface-2` | map controls |
| **Link** | — | `--brand-600` | — | underline | inline |

- Focus: 2px `--brand-500` ring, offset 2px, kèm `shadow-glow-brand`.
- Disabled: opacity 40%, không shadow/hover.
- Loading: spinner thay leading icon, label giữ nguyên, width khoá.

### 2.9 Card Style — 3 tiers

**Tier A — Place Card (Airbnb)**
- `radius-xl`, `shadow-sm` → `shadow-md` hover + `translateY(-2px)` 200ms.
- Ảnh hero 4:3 hoặc 5:4, `radius-lg` clip.
- Heart save top-right (Glass-icon variant).
- Title `h3`, meta row `body-sm` muted, highlight `body` semibold.
- Light: 1px inner `--border`; dark: chỉ shadow.

**Tier B — Info Panel (Notion)**
- Flat: `--surface`, `radius-lg`, **no shadow**, 1px `--border`.
- Dùng cho sidebar, filter group, settings.

**Tier C — Floating Map Card (Apple Maps)**
- Glassmorphism (xem 2.10), `radius-2xl`, `shadow-lg`.
- Selected-place bottom sheet (mobile) / side panel (desktop).

### 2.10 Glassmorphism

Chỉ dùng cho UI **nổi trên map** — không dùng trên page phẳng (quy tắc Apple).

```css
--glass-light: rgba(255, 255, 255, 0.62);
--glass-dark:  rgba(22, 23, 26, 0.58);
backdrop-filter: blur(24px) saturate(180%);
-webkit-backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255,255,255,.22); /* light */
border: 1px solid rgba(255,255,255,.08); /* dark  */
box-shadow: var(--shadow-lg);
```

Variants:
- **Glass-strong** — blur 32, opacity .72 — modal trên map.
- **Glass** — blur 24, opacity .60 — card nổi, search bar.
- **Glass-subtle** — blur 12, opacity .45 — toolbar pill.

Fallback khi không hỗ trợ `backdrop-filter`: `--surface` 96% opacity.
Không stack glass-on-glass. Không đặt body text < 15px trên glass.

### 2.11 Map Marker Style

**Tier 1 — Featured Place**
- Pill 40×40+, nền trắng, 2px brand border, `shadow-md`.
- Icon category (Lucide) màu accent ở giữa.
- Hover: scale 1.08, `shadow-lg`, `shadow-glow-brand`.
- Selected: fill brand, icon trắng, tail pointer 8px.

**Tier 2 — Standard POI**
- 28×28 circle, fill accent, 2px white stroke, `shadow-sm`. Icon 14px trắng.

**Tier 3 — Cluster**
- Glass-subtle pill, count `caption` 600.
- Scale theo số: 32 → 40 → 48 → 56 (cap).
- Expand: 320ms spring, marker xoè radial.

**User Location**
- 16px dot `--info`, 4px white stroke, 24px pulse ring (2s loop, opacity 0.4 → 0).

**Region Labels**
- Fraunces semibold, tracking 0.02em, two-tone shadow (1px tối + 1px sáng) để đọc rõ trên tile.

### 2.12 Animation Guideline

**Durations**: `instant 80 · fast 160 · base 240 · slow 360 · slower 560` (ms).

**Easings**
- `ease-standard` `cubic-bezier(.2,0,0,1)` — most UI.
- `ease-emphasized` spring với overshoot — entrance.
- `ease-spring` (Framer) `{ stiffness: 380, damping: 32 }` — marker, sheet, modal.
- `ease-exit` `cubic-bezier(.4,0,1,1)` — exit.

**Patterns**
- Hover: 160ms transform + shadow (không chỉ flash màu).
- Press: scale 0.97, 80ms in / 160ms out.
- Sheet/modal: spring in, overlay fade 240ms.
- Map fly-to: easeOut, 1200ms cross-country / 700ms in-province.
- List enter: stagger 40ms, fade + 8px translate-up.
- Skeleton: shimmer 1400ms linear infinite.
- Page transition: 240ms crossfade — không slide giữa top routes.

**Rules**
- Tôn trọng `prefers-reduced-motion` — chỉ opacity, tắt parallax & marker pulse.
- Không animate `width/height` — dùng `transform` / `clip-path`.
- Một motion focal point / màn hình — map đang động thì chrome đứng yên.

---

## Part 3 — Foundation Files (kế hoạch khi triển khai)

```
tailwind.config.ts                 # token wiring
src/styles/tokens.css              # CSS vars light + dark
src/styles/globals.css             # base + font imports
src/components/ui/                 # Button, Card, Sheet, Input, Badge, IconButton, Tooltip
src/components/map/
  Marker.tsx
  MarkerCluster.tsx
  MapOverlayCard.tsx
src/lib/theme.ts                   # toggle + persistence
src/styles/map-style-light.json    # MapLibre style
src/styles/map-style-dark.json
app/design/page.tsx                # design system showcase
```

## Part 4 — Verification Checklist

- [ ] `/design` showcase: color tokens · type scale · button matrix (variant × size × state) · 3 card tiers · glass-on-map · marker hierarchy.
- [ ] Contrast WCAG AA: body ≥ 4.5:1, large text ≥ 3:1 — cả 2 mode.
- [ ] Toggle `data-theme` — không có hex hard-code rò rỉ.
- [ ] `prefers-reduced-motion` ON — marker pulse / parallax / spring overshoot tắt.
- [ ] Lighthouse a11y ≥ 95; backdrop-filter fallback test bằng cách disable trong DevTools.
- [ ] Vietnamese diacritics render đúng trong Inter & Fraunces ở mọi size.
