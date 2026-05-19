# Map-VN — Frontend Architecture

> Next.js 15 (App Router, RSC, Turbopack) · TypeScript · Tailwind CSS · Mapbox GL JS · React 19.
> Liên kết: [PRODUCT_AND_DESIGN_SYSTEM.md](PRODUCT_AND_DESIGN_SYSTEM.md) · [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md).

## Mục lục
1. [Nguyên tắc kiến trúc](#1-nguyên-tắc-kiến-trúc)
2. [Folder structure](#2-folder-structure)
3. [App Router structure](#3-app-router-structure)
4. [Component architecture](#4-component-architecture)
5. [Reusable UI layer](#5-reusable-ui-layer)
6. [State management](#6-state-management)
7. [API layer](#7-api-layer)
8. [Hooks](#8-hooks)
9. [Mapbox integration](#9-mapbox-integration)
10. [Scalability & performance](#10-scalability--performance)
11. [Testing, lint, build](#11-testing-lint-build)

---

## 1. Nguyên tắc kiến trúc

- **Server-first** — RSC mặc định; `"use client"` chỉ khi cần interactivity, browser API, hoặc state. Map, sheet, search overlay là client; place body, listing, hero là server.
- **Feature-sliced** — code chia theo *miền nghiệp vụ* (place, trip, search, review…) chứ không theo *loại file* (components, utils, types) ở top-level.
- **3 layer rõ ràng** — `app/` (routing & composition) → `features/` (business logic) → `ui/` + `lib/` (primitives).
- **URL là source of truth** cho discoverable state (bbox, filter, selected place). UI state ephemeral (sheet snap, hover) ở client store.
- **Single source per concern** — Mapbox khởi tạo 1 lần; auth state 1 nguồn; theme 1 provider.
- **Boundary discipline** — `features/*` không import lẫn nhau ngang hàng; muốn dùng, lift lên `app/` hoặc tạo `shared/`.
- **Bundle-conscious** — Mapbox lazy-load; framer-motion chỉ import `m` + `LazyMotion`; icon tree-shake từ `lucide-react`.

---

## 2. Folder structure

```
map-vn/
├── app/                          # Next.js App Router (routing only)
│   ├── (marketing)/              # group: home, about
│   ├── (app)/                    # group: explore, search, place, region…
│   ├── (auth)/                   # sign-in, sign-up
│   ├── (account)/                # me, trip, saved (auth-gated layout)
│   ├── admin/                    # role-gated layout
│   ├── api/                      # Route Handlers (BFF — chỉ proxy/edge)
│   ├── layout.tsx                # root shell · fonts · providers
│   ├── error.tsx · not-found.tsx
│   ├── sitemap.ts · robots.ts · opengraph-image.tsx
│   └── global-error.tsx
│
├── src/
│   ├── features/                 # domain logic — feature-sliced
│   │   ├── map/
│   │   │   ├── components/       # MapCanvas, MarkerLayer, ClusterLayer…
│   │   │   ├── hooks/            # useMap, useFlyTo, useViewportSync
│   │   │   ├── lib/              # style-light.ts · style-dark.ts · clustering.ts
│   │   │   ├── store/            # mapStore (zustand slice)
│   │   │   └── types.ts
│   │   ├── place/
│   │   │   ├── components/       # PlaceSheet · PlaceFullPage · PlaceCard · PlaceMeta
│   │   │   ├── hooks/            # usePlace · useNearby · useSavePlace
│   │   │   ├── api/              # server fns: getPlace, listPlaces
│   │   │   └── types.ts
│   │   ├── search/
│   │   │   ├── components/       # SearchOverlay · Typeahead · ResultGroup
│   │   │   ├── hooks/            # useTypeahead · useRecentSearches
│   │   │   ├── api/              # searchPlaces, suggest
│   │   │   └── lib/              # diacritics.ts · query-parser.ts
│   │   ├── trip/
│   │   │   ├── components/       # TripPlanner · DayColumn · ItineraryItem
│   │   │   ├── hooks/            # useTrip · useTripMutations
│   │   │   └── api/
│   │   ├── review/
│   │   │   ├── components/       # ReviewForm · ReviewList · ReviewCard · RatingHistogram
│   │   │   ├── hooks/            # useReviews · useSubmitReview
│   │   │   └── api/
│   │   ├── region/               # region/province hubs
│   │   ├── collection/
│   │   ├── auth/                 # sign-in/up forms · session hooks
│   │   └── admin/                # CMS pieces (places, reviews queue)
│   │
│   ├── ui/                       # design-system primitives (RSC-safe khi có thể)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sheet.tsx             # client (Radix)
│   │   ├── dialog.tsx
│   │   ├── input.tsx · textarea.tsx
│   │   ├── badge.tsx · chip.tsx
│   │   ├── tooltip.tsx · popover.tsx
│   │   ├── tabs.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast/                # provider + useToast
│   │   ├── icon.tsx              # Lucide wrapper
│   │   ├── glass.tsx             # <Glass variant="..."> wrapper
│   │   └── index.ts              # barrel export
│   │
│   ├── components/               # cross-feature composites (không phải primitives, không thuộc feature đơn lẻ)
│   │   ├── nav/
│   │   │   ├── TopBar.tsx · MegaMenu.tsx · BottomTabBar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── theme/                # ThemeProvider · ThemeToggle
│   │   ├── locale/               # LocaleProvider · LocaleSwitch
│   │   ├── seo/                  # JsonLd, OgTags helpers
│   │   └── error/                # ErrorBoundary, FallbackUI
│   │
│   ├── lib/                      # framework-agnostic utilities
│   │   ├── api/                  # fetch client (server + client)
│   │   │   ├── client.ts         # createApiClient()
│   │   │   ├── errors.ts
│   │   │   └── schemas.ts        # zod schemas dùng chung
│   │   ├── supabase/             # server.ts · client.ts · types.ts (generated)
│   │   ├── mapbox/               # token.ts · style-loader.ts
│   │   ├── routing/              # url-state.ts (bbox, filters ⇄ URLSearchParams)
│   │   ├── i18n/                 # config · dictionaries · t.ts
│   │   ├── analytics/            # plausible.ts · events.ts
│   │   ├── format/               # date · number · price · distance
│   │   ├── slug.ts               # diacritics-safe
│   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   ├── env.ts                # zod-validated process.env
│   │   └── constants.ts
│   │
│   ├── stores/                   # cross-feature zustand stores
│   │   ├── ui-store.ts           # sheet snap, mobile nav state, toast queue
│   │   ├── map-store.ts          # viewport, selectedPlaceId, hoverId
│   │   ├── filter-store.ts       # active filters (mirror URL)
│   │   └── auth-store.ts         # session cache (hydrate từ server)
│   │
│   ├── hooks/                    # cross-feature hooks
│   │   ├── use-media-query.ts
│   │   ├── use-mounted.ts
│   │   ├── use-debounced-value.ts
│   │   ├── use-local-storage.ts
│   │   ├── use-intersection.ts
│   │   ├── use-keyboard.ts       # `/` shortcut, ESC handlers
│   │   ├── use-url-state.ts      # generic URLSearchParams ⇄ object
│   │   └── use-prefers-reduced-motion.ts
│   │
│   ├── styles/
│   │   ├── globals.css           # @tailwind · base layer · CSS vars
│   │   ├── tokens.css            # design-system tokens (light/dark)
│   │   └── mapbox.css            # Mapbox overrides (popup, ctrl)
│   │
│   ├── types/                    # global types (domain models, API responses)
│   │   ├── place.ts · region.ts · trip.ts · review.ts
│   │   └── index.ts
│   │
│   ├── config/
│   │   ├── nav.ts                # nav definitions (top bar, tabs)
│   │   ├── categories.ts         # 6 category metadata
│   │   ├── regions.ts
│   │   └── site.ts               # name, url, ogImage
│   │
│   └── providers/                # composed Provider tree
│       └── AppProviders.tsx      # QueryClient · Theme · Locale · Toast · Motion
│
├── public/
│   ├── fonts/                    # Inter, Fraunces (self-hosted, variable)
│   ├── icons/                    # category svg
│   └── og/                       # static OG fallbacks
│
├── tests/
│   ├── e2e/                      # Playwright
│   └── unit/                     # Vitest
│
├── .env.example
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json                 # path alias `@/*` → `src/*`
├── eslint.config.mjs
└── package.json
```

Key alias: `@/*` → `src/*`. App router import qua `@/features/*`, `@/ui`, `@/lib/*`.

---

## 3. App Router structure

### 3.1 Route groups & layouts

```
app/
├── layout.tsx                          # <html><body><AppProviders><Shell>{children}
│
├── (marketing)/
│   ├── layout.tsx                      # marketing shell (hero-friendly nav)
│   ├── page.tsx                        # /
│   └── about/page.tsx
│
├── (app)/
│   ├── layout.tsx                      # TopBar + BottomTabBar (mobile)
│   ├── explore/
│   │   ├── page.tsx                    # client island for map; server boundary for filter chips
│   │   └── @sheet/(.)place/[slug]/page.tsx   # parallel + intercepting route → sheet over map
│   ├── search/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── place/[slug]/
│   │   ├── page.tsx                    # full SEO page
│   │   ├── opengraph-image.tsx         # dynamic OG
│   │   └── loading.tsx
│   ├── region/[slug]/
│   │   ├── page.tsx
│   │   └── [province]/page.tsx
│   ├── category/[slug]/page.tsx
│   └── collection/[slug]/page.tsx
│
├── (account)/
│   ├── layout.tsx                      # auth-gated (redirect to /sign-in)
│   ├── trip/
│   │   ├── page.tsx · new/page.tsx · [id]/page.tsx
│   ├── saved/page.tsx
│   └── me/
│       ├── page.tsx · settings/page.tsx · language/page.tsx
│
├── (auth)/
│   ├── layout.tsx                      # centered card, no top nav
│   ├── sign-in/page.tsx · sign-up/page.tsx
│
├── admin/
│   ├── layout.tsx                      # role-gated
│   ├── places/page.tsx · places/[id]/page.tsx
│   ├── reviews/page.tsx
│   └── collections/page.tsx
│
├── api/
│   ├── og/[...slug]/route.ts           # OG image gen
│   ├── revalidate/route.ts             # ISR webhook
│   └── upload/route.ts                 # signed-url proxy cho ảnh review
│
├── sitemap.ts
├── robots.ts
├── opengraph-image.tsx
├── error.tsx · global-error.tsx · not-found.tsx
└── layout.tsx
```

### 3.2 Patterns được dùng

- **Parallel + intercepting routes** ở `/explore`: click marker → URL thành `/explore/place/[slug]`, modal-sheet hiển thị; hard reload cùng URL → full page `/place/[slug]`. Đạt được "share-able sheet" mà không cần state riêng.
- **Streaming + Suspense** ở Tier 2 detail: hero & header server-render ngay; reviews + nearby stream sau qua `<Suspense>`.
- **`generateMetadata`** cho mọi Tier 0–2; OG image dynamic ở `opengraph-image.tsx`.
- **Server Actions** cho mutation đơn giản (save place, submit review draft) — không cần `/api`.
- **Route Handlers** trong `app/api/` chỉ cho: OG gen, ISR revalidate webhook, signed-upload proxy. *Không* dùng làm API chính — gọi thẳng Supabase từ Server Component.
- **Loading & error UI** cho mỗi segment lớn; skeleton từ `@/ui/skeleton`.

### 3.3 Caching/revalidate

- Place detail: `revalidate = 3600`, `tags: ["place:" + slug]` → editor publish trigger `revalidateTag`.
- Listing (region/category): `revalidate = 600`.
- `/explore` page shell: static; data fetch client-side theo bbox.
- Search API: `cache: "no-store"` — luôn live.

---

## 4. Component architecture

3 lớp, từ trong ra ngoài:

```
┌─────────────────────────────────────────────────┐
│  app/  — Pages (RSC) compose features + ui     │
│   └── route segments only, no business logic   │
├─────────────────────────────────────────────────┤
│  features/<domain>/  — Business components     │
│   ├── components/   stateful, domain-aware     │
│   ├── hooks/        domain data + actions      │
│   └── api/          server fns + zod schemas   │
├─────────────────────────────────────────────────┤
│  ui/ + components/  — Primitives & composites  │
│   ├── ui/           dumb, domain-free          │
│   └── components/   cross-feature shells       │
└─────────────────────────────────────────────────┘
```

### 4.1 Rules

- **One file = one component**; sub-components private cùng file ok nếu nhỏ.
- **Component contract**: explicit `Props` type export. Tránh `React.FC`.
- **Default to RSC**. `"use client"` chỉ ở component cần state/effect/Mapbox/browser API. Component cha có thể là server và render con client.
- **Composition over props explosion**: > 7 props → cân nhắc tách hoặc dùng `children` slots (vd `Card.Header`, `Card.Body`).
- **No prop drilling > 2 levels** — lift lên server fetch, hoặc dùng store nếu cross-tree.
- **Naming**:
  - File: `kebab-case.tsx`.
  - Component: `PascalCase`.
  - Hook: `useThing`.
  - Domain hook: `usePlace`, `useTrip` (singular noun + action verb).
- **Feature components KHÔNG import từ feature khác**. Cần dùng chung → đẩy lên `components/` hoặc nhận via props.

### 4.2 Component categorization

| Loại | Vị trí | Đặc điểm |
|---|---|---|
| **Primitive** | `ui/` | Không biết về domain. `<Button>`, `<Card>`, `<Sheet>` |
| **Composite** | `components/` | Dùng nhiều primitive, cross-feature. `<TopBar>`, `<ThemeToggle>` |
| **Domain** | `features/<x>/components/` | Biết domain model. `<PlaceCard>`, `<ReviewForm>` |
| **Page** | `app/.../page.tsx` | Compose tất cả. Không chứa logic phức tạp |

---

## 5. Reusable UI layer (`src/ui/`)

Stack: **Radix Primitives** (headless) + Tailwind tokens + `cva` (class-variance-authority) cho variants. (Có thể dùng shadcn/ui làm starter rồi sửa theo token.)

### 5.1 Convention

```tsx
// ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
  "disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:     "bg-brand-500 text-white rounded-full hover:bg-brand-600 shadow-sm hover:shadow-md",
        secondary:   "bg-surface text-text border border-border rounded-lg hover:bg-surface-2",
        ghost:       "text-text rounded-lg hover:bg-surface-2",
        tonal:       "bg-brand-50 text-brand-700 rounded-full hover:bg-brand-100",
        destructive: "bg-danger text-white rounded-full hover:brightness-110",
        glass:       "glass text-text rounded-full hover:bg-white/10",
        link:        "text-brand-600 hover:underline underline-offset-2",
      },
      size: {
        sm: "h-8  px-4 text-[13px]",
        md: "h-10 px-5 text-[15px]",
        lg: "h-12 px-6 text-[15px]",
        xl: "h-14 px-7 text-[17px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
```

### 5.2 Mặt hàng cần có

`Button` · `IconButton` · `Card` (compound: Header/Media/Body/Footer) · `Sheet` (mobile bottom-sheet với snap points) · `Dialog` · `Popover` · `Tooltip` · `Tabs` · `Badge` · `Chip` · `Input` · `Textarea` · `Select` · `Switch` · `Checkbox` · `Radio` · `Slider` · `Skeleton` · `Avatar` · `Toast` · `Glass` · `Icon` · `Spinner`.

Tất cả: typed props · forwardRef · accessibility props passthrough · token-driven (không hex hard-code).

---

## 6. State management

Chia state theo **vị trí & vòng đời**:

| State type | Tool | Ví dụ |
|---|---|---|
| **Server data** (DB) | TanStack Query v5 + Server Components | place detail, list, reviews, trips |
| **URL state** (share-able) | `useSearchParams` + `useRouter` + helper `useUrlState` | `/explore` filters & bbox · `/search?q=` |
| **Global UI state** (client) | Zustand (slices) | sheet snap, theme override, toast queue, map selection |
| **Form state** | React Hook Form + Zod | review form, place CMS, sign-in |
| **Ephemeral local** | `useState` / `useReducer` | toggles, hover, expanded text |
| **Auth session** | Supabase auth helpers (server) + Zustand cache (client) | `useSession()` |

### 6.1 Zustand slices

```ts
// stores/map-store.ts
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

type Viewport = { lng: number; lat: number; zoom: number; bearing: number; pitch: number };

interface MapState {
  viewport: Viewport;
  selectedPlaceId: string | null;
  hoverId: string | null;
  setViewport: (v: Partial<Viewport>) => void;
  select: (id: string | null) => void;
}

export const useMapStore = create<MapState>()(
  devtools(subscribeWithSelector((set) => ({
    viewport: { lng: 107.5, lat: 16.0, zoom: 5.2, bearing: 0, pitch: 0 },
    selectedPlaceId: null,
    hoverId: null,
    setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
    select: (id) => set({ selectedPlaceId: id }),
  })), { name: "map" })
);
```

Một file = một slice. Không có "root store". Cross-slice effects qua `subscribeWithSelector`.

### 6.2 URL state helper

```ts
// hooks/use-url-state.ts
export function useUrlState<T>(parse: (sp: URLSearchParams) => T, serialize: (v: T) => URLSearchParams) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const value = useMemo(() => parse(new URLSearchParams(sp.toString())), [sp, parse]);
  const set = useCallback((next: T, opts?: { replace?: boolean }) => {
    const qs = serialize(next).toString();
    (opts?.replace ? router.replace : router.push).call(router, `${pathname}?${qs}`, { scroll: false });
  }, [pathname, router, serialize]);
  return [value, set] as const;
}
```

Dùng cho `/explore` (bbox, cat, q, place) và `/search`.

### 6.3 TanStack Query

```ts
// providers/AppProviders.tsx (client)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime:    5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

Query keys hierarchical: `["place", slug]`, `["places", "bbox", bbox]`, `["reviews", placeId, sort]`.
Server Component dùng `getQueryClient()` server-only + `dehydrate` cho hydration trên Tier 2.

---

## 7. API layer

### 7.1 Topology

```
React (RSC / client)
    │
    ├── Server Components ──► supabase.server.ts ──► Postgres/PostGIS
    │                                             ──► Storage (R2/Supabase)
    │
    ├── Server Actions    ──► same as above (mutations: save, submit review draft)
    │
    ├── Route Handlers    ──► api/og · api/revalidate · api/upload
    │
    └── Client Components ──► api-client.ts (TanStack Query) ──► Supabase REST / Edge Fn
```

**Quy tắc**: page data → Server Component fetch trực tiếp (không qua REST của chính mình). Client cần data động → TanStack Query → Supabase JS client. Tránh tự dựng "BFF" trừ khi có lý do (rate-limit token, transform nặng).

### 7.2 Cấu trúc

```
src/lib/api/
├── client.ts            # createApiClient() — fetch wrapper với zod parse + error normalize
├── errors.ts            # ApiError class
├── schemas.ts           # zod schemas chung (Pagination, ErrorEnvelope)
└── keys.ts              # query key factories

src/features/<domain>/api/
├── queries.ts           # useXQuery hooks (client) + getX (server)
├── mutations.ts         # useXMutation (client) + xAction (server action)
└── schemas.ts           # zod schemas cho input/output domain này
```

### 7.3 Pattern: server fetcher + client query cùng schema

```ts
// features/place/api/schemas.ts
export const PlaceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  // …
  coords: z.tuple([z.number(), z.number()]),
});
export type Place = z.infer<typeof PlaceSchema>;

// features/place/api/queries.ts
// — server —
export async function getPlace(slug: string): Promise<Place> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("places").select("*").eq("slug", slug).single();
  if (error) throw new ApiError("PLACE_NOT_FOUND", error.message);
  return PlaceSchema.parse(data);
}

// — client —
export function usePlace(slug: string) {
  return useQuery({
    queryKey: ["place", slug],
    queryFn: () => apiClient.get(`/api/places/${slug}`, PlaceSchema),
    enabled: !!slug,
  });
}
```

### 7.4 Mutation: Server Action

```ts
// features/place/api/mutations.ts
"use server";
export async function savePlace(slug: string) {
  const session = await requireSession();
  const supabase = createServerClient();
  await supabase.from("saves").upsert({ user_id: session.user.id, place_slug: slug });
  revalidateTag(`saved:${session.user.id}`);
}
```

Trên client: gọi qua `useTransition()` + optimistic update store.

### 7.5 Error handling

- API → throw `ApiError(code, message, status)`.
- Boundary: `error.tsx` ở segment + global toast cho client mutation.
- 404 từ data → `notFound()` trong Server Component.
- Zod parse fail → log + throw `ApiError("SCHEMA_MISMATCH")`.

---

## 8. Hooks

### 8.1 Generic (`src/hooks/`)

| Hook | Mục đích |
|---|---|
| `useMediaQuery(query)` | breakpoint, prefers-reduced-motion |
| `useDebouncedValue(v, ms)` | search input debounce |
| `useLocalStorage(key, def)` | recent searches, theme override |
| `useIntersection(ref, opts)` | infinite scroll, lazy reveal |
| `useKeyboard(map)` | shortcut `/` `Esc` `Cmd+K` |
| `useMounted()` | tránh hydration mismatch |
| `usePrefersReducedMotion()` | gate animation |
| `useUrlState(parse, serialize)` | URL ⇄ object |
| `useClickOutside(ref, cb)` | popover dismiss |
| `useEventListener(target, evt, h)` | typed listener |
| `usePrevious(v)` | so sánh prev/next |
| `useCopyToClipboard()` | share link |

### 8.2 Domain (trong `features/<x>/hooks/`)

| Hook | Trả về |
|---|---|
| `useMap()` | Mapbox instance + ready flag |
| `useFlyTo()` | fn fly + respect reduced-motion |
| `useViewportSync()` | sync map ⇄ URL bbox |
| `useMarkers(places)` | imperative marker layer mgmt |
| `usePlace(slug)` | TanStack Query wrapper |
| `useNearby(coords, radius)` | nearby places |
| `useSavePlace(slug)` | mutation + optimistic |
| `useTypeahead(q)` | search suggestions, debounced |
| `useRecentSearches()` | localStorage list |
| `useTrip(id)` / `useTripMutations()` | CRUD trip |
| `useReviews(placeId, sort)` | infinite list |
| `useSubmitReview()` | form mutation |
| `useSession()` | auth state + helpers |

### 8.3 Hook rules

- Một mục đích / hook. Hook compose hook khác ok.
- Trả về object có shape ổn định (cùng key mỗi render).
- Server-side helper (không phải hook): tên `getX`, `requireX`, không gọi từ Client Component.

---

## 9. Mapbox integration

Cần kỷ luật riêng vì map là phần đắt nhất của bundle & nặng nhất ở runtime.

### 9.1 Pattern

- **One instance**, life-cycled bởi `MapCanvas` (client). Không tạo lại khi route đổi trong group `(app)` — đặt ở `(app)/layout.tsx` nếu muốn persist; hoặc dùng route group + key.
- **Mapbox lazy**: `const mapboxgl = (await import("mapbox-gl")).default` trong `useEffect` đầu tiên. CSS import song song.
- **Token**: `NEXT_PUBLIC_MAPBOX_TOKEN`, restricted theo origin.
- **Imperative layers**, declarative props: `MapCanvas` nhận `places: Place[]`, bên trong dùng `map.addSource` / `addLayer` cho cluster + symbol; *không* mount React component cho từng marker (perf).
- **Custom style** light/dark: 2 JSON tự host (`src/features/map/lib/style-light.ts` / `-dark.ts`) — đảm bảo brand-coherent với design system.
- **Sync với store**: `map.on("moveend", …)` → `setViewport` (debounced). URL update qua `useViewportSync`.
- **Selected place**: store `selectedPlaceId` → effect highlight feature-state.
- **Reduced motion**: `useFlyTo` chuyển sang `jumpTo` khi `prefers-reduced-motion`.
- **SSR safe**: `MapCanvas` được `dynamic(() => …, { ssr: false })`.

### 9.2 Layers (Mapbox)

1. `places-source` (GeoJSON, cluster: true).
2. `clusters` (circle layer, glass).
3. `cluster-count` (symbol).
4. `unclustered-point` (circle, category-accent).
5. `place-label` (symbol, Fraunces).
6. `selected-place` (circle + halo, filter theo state).

### 9.3 Performance

- Source `data` cập nhật bằng `setData()` chứ không re-add.
- Featured places dùng `symbol` với custom icon (precomposed sprite).
- `maxZoom`/`minZoom` clamp cho VN bbox.
- Vector tiles theo demand: chỉ load tile khi viewport thay đổi đủ lớn (debounce 300ms).

---

## 10. Scalability & performance

### 10.1 Bundle

- Mapbox: dynamic import, không kéo vào `/place/[slug]` full page (chỉ `MiniMap` lazy).
- `framer-motion`: import `{ LazyMotion, domAnimation, m }` thay vì `motion`.
- Icons: từng icon import — `import { Heart } from "lucide-react"`.
- Tree-shake Tailwind: `content` chỉ trỏ `src/**/*.{ts,tsx}`.
- Polyfills: dùng `serverActions` & native APIs; tránh lodash full.

### 10.2 Image

- `next/image` với `remotePatterns` whitelist (R2/Supabase).
- Place hero: AVIF + WebP fallback, sizes responsive.
- Blur placeholder từ DB (`blur_data_url`).
- Avatar: `unoptimized` nếu < 80px.

### 10.3 Fonts

Self-host Inter + Fraunces variable qua `next/font/local`. Subset Vietnamese. `display: swap`.

### 10.4 Code-splitting & streaming

- Tier 1–2 page: hero/header eager, tail (reviews, nearby) qua `<Suspense>`.
- Sheet (intercepting route) bundle riêng — không cõng theo place full page.
- Admin tách subbundle (route group + `dynamic`).

### 10.5 Caching tầng

| Tầng | TTL | Invalidation |
|---|---|---|
| CDN (Vercel) — page | per `revalidate` | webhook → `/api/revalidate` |
| TanStack Query — client | `staleTime` 60s | invalidateQueries sau mutation |
| Supabase — PG cache | n/a | DB-level |
| localStorage — recent search, theme | ∞ | manual |
| Service Worker (sau v1) | offline shell | precache `/` & `/explore` |

### 10.6 Scalability rules

- **Mỗi feature đứng độc lập** → có thể nhổ thành package nếu cần (monorepo-ready).
- **Public surface** mỗi feature qua `index.ts` barrel; nội bộ giấu.
- **Schema-first**: zod schema là contract giữa server fn & client query.
- **One concept, one place**: token ở `tokens.css`, category metadata ở `config/categories.ts`, nav ở `config/nav.ts`.
- **Feature flag** (sau v1): `config/flags.ts` + helper `useFlag()` — kill-switch cho v.d. AI suggest.
- **i18n-ready từ ngày 1**: VI default, EN dictionary, không hard-code chuỗi UI trong component (lookup qua `t()`).

---

## 11. Testing, lint, build

| Tool | Phạm vi |
|---|---|
| **TypeScript strict** | `strict: true`, `noUncheckedIndexedAccess: true` |
| **ESLint flat config** | `next/core-web-vitals`, `@typescript-eslint`, `eslint-plugin-tailwindcss`, `eslint-plugin-import` (boundaries) |
| **Prettier** | format + plugin-tailwind |
| **Vitest** | unit (utils, hooks pure, zod schemas) |
| **Testing Library** | component (UI primitives) |
| **Playwright** | e2e key flows: A, B, C, E từ IA |
| **Chromatic / Storybook** (optional) | UI showcase + visual regression |
| **Lighthouse CI** | `/`, `/explore`, `/place/[slug]` mỗi PR |
| **Husky + lint-staged** | pre-commit lint + format + typecheck |
| **commitlint** | conventional commits |

Lint boundary rule: `features/a` *không* được import `features/b`. Enforce qua `eslint-plugin-import` `no-restricted-paths`.

---

## Appendix — Env vars

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server only
PLAUSIBLE_DOMAIN=
REVALIDATE_SECRET=
```

`src/lib/env.ts` parse bằng zod, fail-fast trên boot.

---

## Verification

- [ ] `pnpm typecheck` pass strict.
- [ ] `pnpm lint` không có cross-feature import.
- [ ] Lighthouse: perf ≥ 90, a11y ≥ 95 trên `/`, `/explore`, `/place/[slug]`.
- [ ] Bundle: home route ≤ 180kb gz; `/explore` ≤ 280kb gz (đã trừ Mapbox lazy).
- [ ] Mapbox không xuất hiện trong initial bundle của `/place/[slug]`.
- [ ] Toggle theme + reload: state persist; không FOUC.
- [ ] Deep-link `/explore?bbox=...&place=...` mở đúng map + sheet.
- [ ] Server Action `savePlace` chạy với cookie auth, không lộ service role key client.
