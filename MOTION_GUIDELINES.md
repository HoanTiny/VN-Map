# Map-VN — Motion Guidelines

> Một hệ thống motion thống nhất, dựa trên Framer Motion + LazyMotion (`domMax`).
> Mọi animation trong app phải gọi token từ [src/lib/motion.ts](src/lib/motion.ts) —
> không hard-code duration/easing rời rạc trong component.

## Mục lục
1. [Triết lý motion](#1-triết-lý-motion)
2. [Tokens — durations · easings · springs](#2-tokens)
3. [Variants chuẩn](#3-variants-chuẩn)
4. [Primitive components](#4-primitive-components)
5. [Patterns theo loại UI](#5-patterns-theo-loại-ui)
6. [Reduced motion](#6-reduced-motion)
7. [Performance rules](#7-performance-rules)
8. [Anti-patterns](#8-anti-patterns)

---

## 1. Triết lý motion

- **Motion phục vụ context** — báo cho user biết "cái gì đang xảy ra", "đến từ đâu", "đi đâu". Không phải để giải trí.
- **Một motion focal point / màn hình** — nếu map đang fly-to thì chrome đứng yên; nếu modal đang spring in thì underlying content không animate.
- **Spring cho gesture, duration cho UI** — đụng tay/chuột → spring có physics. Reveal, transition, hover → duration + easing chuẩn.
- **Honour reduced-motion** — tôn trọng tuyệt đối. Có CSS override global trong [src/styles/globals.css](src/styles/globals.css) tắt mọi animation; ngoài ra component nên fallback opacity-only.
- **Map-VN motion DNA**:
  - Mượt — easing `cubic-bezier(.2, 0, 0, 1)` cho 95% UI.
  - Confident — spring `380/32` cho sheet, modal, marker.
  - Subtle — translate ≤ 16px, scale ≤ 1.05.

---

## 2. Tokens

Import từ [`@/lib/motion`](src/lib/motion.ts).

### Durations (giây)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `duration.instant` | 0.08 | Press feedback, tap response |
| `duration.fast` | 0.16 | Hover, color/colour changes |
| `duration.base` | 0.24 | Page crossfade, default UI |
| `duration.slow` | 0.36 | Reveal, list enter |
| `duration.slower` | 0.56 | Hero entrance, fly-to within-province |

### Easings (cubic-bezier)
| Token | Bezier | Dùng cho |
|---|---|---|
| `easing.standard` | `(.2, 0, 0, 1)` | **default** — gần như mọi UI |
| `easing.enter` | `(0, 0, 0, 1)` | Element ENTER màn hình |
| `easing.exit` | `(.4, 0, 1, 1)` | Element LEAVE màn hình |

### Springs
| Token | Stiffness/Damping | Dùng cho |
|---|---|---|
| `spring.default` | 380 / 32 | Sheet, modal, marker, layout shift |
| `spring.snappy` | 500 / 30 | Button press, toggle, hover lift |
| `spring.gentle` | 220 / 28 | Hero entrance, large card reveal |
| `spring.bouncy` | 360 / 18 | Save success, celebratory (dùng tiết kiệm) |

### Stagger
| Token | Giá trị | Dùng cho |
|---|---|---|
| `stagger.fast` | 0.03 | Long list (20+ items) |
| `stagger.base` | 0.04 | Card grid, default |
| `stagger.slow` | 0.06 | Hero rows, large sections |

---

## 3. Variants chuẩn

Sẵn dùng trên `m.div`:

```tsx
import { m } from "framer-motion";
import { fadeUp, spring, floatingCard } from "@/lib/motion";

<m.div variants={fadeUp} initial="initial" animate="animate" exit="exit" />
```

| Variant | Hiệu ứng | Use |
|---|---|---|
| `fade` | opacity 0 → 1 | crossfade element |
| `fadeUp` | y +16 → 0 + fade | scroll reveal default |
| `fadeDown` | y -16 → 0 + fade | toast, dropdown |
| `scaleIn` | scale 0.96 → 1 + fade | popover, tooltip |
| `slideUp` | y 100% → 0 | bottom sheet |
| `slideDown` | y -100% → 0 | top notification |
| `floatingCard` | y +24 → 0, scale 0.98 → 1 | selected place card, glass overlay |

---

## 4. Primitive components

Tất cả ở [`@/components/motion`](src/components/motion).

### `<Reveal>`
Scroll-into-view reveal. Default fade + 16px translate-up.

```tsx
import { Reveal } from "@/components/motion";

<Reveal>            {/* fade-up, once */}
  <Section />
</Reveal>

<Reveal direction="left" distance={24} delay={0.1} />
<Reveal repeat>      {/* trigger every time it enters viewport */}
  <Animated />
</Reveal>
```

**Props**: `direction` (up/down/left/right/none) · `distance` · `delay` · `repeat` · `durationS`.

### `<Stagger>` + `<StaggerItem>`
Stagger reveal for lists/grids.

```tsx
import { Stagger, StaggerItem } from "@/components/motion";

<Stagger className="grid grid-cols-3 gap-6">
  {places.map((p) => (
    <StaggerItem key={p.id}>
      <PlaceCard place={p} />
    </StaggerItem>
  ))}
</Stagger>
```

Gap default 0.04s — pass `gap={0.06}` cho row lớn.

### `<HoverLift>`
Standard hover micro-interaction cho cards/tiles không phải `<Button>`.

```tsx
import { HoverLift } from "@/components/motion";

<HoverLift>           {/* -2px translate + 0.97 press */}
  <Card>...</Card>
</HoverLift>

<HoverLift effect="scale" />     {/* 1.03 scale */}
<HoverLift effect="both" />      {/* lift + 1.02 scale */}
<HoverLift noPress />            {/* không có press feedback */}
```

### `<PageTransition>`
Quiet crossfade khi route đổi. Đặt trong layout của route group.

```tsx
// app/(marketing)/layout.tsx
import { PageTransition } from "@/components/motion";

<PageTransition>{children}</PageTransition>
```

**Không slide** giữa top-level routes. Crossfade 240ms ease-standard.

---

## 5. Patterns theo loại UI

### Buttons & links
- Hover: `transition-colors duration-fast`. **Không scale color flash đơn lẻ.**
- Press: `active:scale-[0.97]` (CSS) hoặc `whileTap={pressScale}`.
- Loading: replace icon với spinner; **không** thay đổi width.

### Cards (PlaceCard, CityCard)
- Hover: `y: -2`, shadow `sm → md`, image scale `1.04` (slow easing 500ms).
- Selected: outline + brand color, **không animate size**.

### Sheets / modals
- Entrance: `floatingCard` variant với `spring.default`.
- Overlay: fade 240ms ease-standard.
- Exit: 160ms ease-exit (nhanh hơn vào).
- Backdrop click → exit immediately, **không bounce out**.

### Map markers (Mapbox/MapLibre)
- Vẫn dùng Framer Motion ở DOM marker (vd. `user-location-marker__ring` CSS keyframe).
- Cho GeoJSON layers, dùng `feature-state` + paint expression — không phải Motion. Hover/selected radius transition là smooth do feature-state interpolation của tile renderer.

### Map fly-to
- Within-province (zoom > 10): `duration: 700ms`, easing `(t) => 1 - Math.pow(1-t, 3)` (cubic ease-out).
- Cross-country: `duration: 1200ms`.
- Reduced motion: `duration: 0`.

### Lists (search results, side panel)
- Enter: `<Stagger>` với `gap: 0.04`, mỗi item `fadeUp` 12px.
- Hover row: `bg-surface-2` transition fast.
- Infinite scroll batch: new batch fade-in **không stagger** (đỡ jarring).

### Page transitions
- Top-level routes: crossfade 240ms only.
- Modal route (intercepting): spring scale + fade.
- **Không slide** L↔R giữa pages.

### Skeletons
- CSS-only — `@keyframes shimmer` 1400ms linear infinite (đã có trong globals.css).
- Khi data load xong: **fade in real content** 160ms, **không** crossfade với skeleton.

### Toasts
- Entry: `slideDown` 360ms ease-emphasized (desktop top) hoặc `slideUp` (mobile bottom).
- Auto-dismiss: 4s default, pause on hover.
- Multiple toasts: stack với `space-y-2` + per-toast spring entry.

### Save heart toggle
- Heart fill: instant color swap (color cannot interpolate well).
- Scale pulse: `1 → 1.15 → 1` qua spring.bouncy.

---

## 6. Reduced motion

User OS setting `prefers-reduced-motion: reduce` PHẢI được tôn trọng.

**Global override** đã có trong [`globals.css`](src/styles/globals.css):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

**Component-level fallback** cho Framer Motion (CSS override không bắt được JS-driven motion):
```tsx
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const reduce = usePrefersReducedMotion();
<m.div animate={{ y: reduce ? 0 : -2 }} />
```

Cho map fly-to / pan, đã handle ở [MapCanvas](src/features/map/components/MapCanvas.tsx).

---

## 7. Performance rules

- **Animate transform/opacity** — chỉ. KHÔNG animate width/height/top/left.
- **`will-change`** chỉ đặt khi element đang active animate, gỡ ra sau.
- **`LazyMotion features={domMax} strict`** đang được set ở [AppProviders](src/providers/AppProviders.tsx) — phải dùng `m.div` (không `motion.div`) để tree-shake.
- **Reveal once** — `viewport={{ once: true }}` để tránh re-trigger khi scroll lại.
- **Stagger cap 8 items** — list dài hơn thì batch fade-in không stagger.
- **Avoid layout animations on critical paths** — chỉ dùng `layout` prop khi thực sự cần (vd: animated tab indicator). Layout animations expensive hơn transform.

---

## 8. Anti-patterns

| ❌ | ✅ |
|---|---|
| Slide trang trái-phải khi đổi route | Crossfade 240ms |
| Animate `width` để mở sheet | Animate `transform: translateY` hoặc `scale` |
| Spring cho hover button | Duration + easing-standard |
| Duration ad-hoc `0.42s` | `duration.slow` (0.36) |
| `motion.div` (kéo full features) | `m.div` (tree-shake) |
| 3 animations cùng lúc trên màn | Một focal point — phần còn lại đứng yên |
| Parallax mượt nhưng bỏ qua reduced-motion | Honour reduced-motion trước, parallax sau |
| Re-fire reveal mỗi lần scroll | `viewport={{ once: true }}` |
| Toast bounce out | Quiet ease-exit 160ms |
| Bouncy spring khắp nơi | Bouncy chỉ cho moment celebratory (save success) |

---

## Appendix — checklist khi thêm animation mới

1. Token nào trong [`@/lib/motion`](src/lib/motion.ts) đã match? Dùng cái đó.
2. Cần spring hay duration? Gesture-responsive → spring. Otherwise → duration.
3. Có thể dùng primitive sẵn (`Reveal`/`Stagger`/`HoverLift`) không? Ưu tiên.
4. Có ảnh hưởng layout (animate width/height)? Đổi sang transform.
5. Honour `prefers-reduced-motion`? Test trong DevTools.
6. Một focal point / màn hình? Animation khác đang chạy thì pause hoặc bỏ.
7. `viewport` once hay always? Default once.
8. Bundle ảnh hưởng? Dùng `m.*` không phải `motion.*`.
