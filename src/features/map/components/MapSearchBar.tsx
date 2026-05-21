"use client";
import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/stores/ui-store";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  MapPin,
  Tag,
  ArrowRight,
  TrendingUp,
  Star,
  Compass,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMapStore } from "@/stores/map-store";
import { categories, type CategoryKey } from "@/config/categories";
import { provinces, type Province } from "@/config/regions";
import { type PlaceItem } from "@/features/map/lib/places-data";
import {
  useMapData,
  filterPlacesInBounds,
  placesNearCoord,
  haversineKm,
} from "../context/MapDataContext";
import { searchPlacesFromList, normalize } from "@/features/search/lib/search";

const TRENDING_SLUGS = [
  "cafe-giang",
  "twilight-sky-bar",
  "snuffbox-saigon",
  "hoi-an",
  "ne-cocktail-bar",
];

export function MapSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 150);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const select = useMapStore((s) => s.select);
  const clearFilter = useMapStore((s) => s.clearFilter);
  const toggleCategory = useMapStore((s) => s.toggleCategory);
  const activeFilter = useMapStore((s) => s.filter);
  const bounds = useMapStore((s) => s.bounds);
  const viewport = useMapStore((s) => s.viewport);
  const userLocation = useMapStore((s) => s.userLocation);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  /* ---------- Viewport / location awareness ---------- */

  // Pull current dataset from MapDataProvider (server-fetched, mock fallback).
  const { places: allPlaces } = useMapData();

  // Top places inside the current map viewport, sorted by rating.
  const inViewport = filterPlacesInBounds(allPlaces, bounds)
    .slice()
    .sort((a, b) => b.rating - a.rating);

  // Detect dominant province in viewport for a personalised section label.
  const dominantProvince = (() => {
    if (inViewport.length === 0) return null;
    const counts = new Map<string, number>();
    inViewport.forEach((p) => counts.set(p.province, (counts.get(p.province) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  })();

  // Places closest to user GPS location (only if user has used "Locate me").
  const nearMe = userLocation
    ? placesNearCoord(allPlaces, [userLocation.lng, userLocation.lat], 5)
    : [];

  // Sync local `open` to UI store so siblings (e.g. filter chip bar) can react.
  useEffect(() => {
    setSearchOpen(open);
    return () => setSearchOpen(false);
  }, [open, setSearchOpen]);

  // ESC + click outside + "/" focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  /* ---------- Suggestions ---------- */

  const q = debounced.trim();
  const inViewportSet = new Set(inViewport.map((p) => p.id));
  const viewCenter: [number, number] = [viewport.lng, viewport.lat];

  // When typing, fetch a wider list then re-rank so in-viewport places
  // surface first, then by ascending distance to viewport centre.
  // Each result carries its distance so the row can render it.
  const places: Array<PlaceItem & { distanceKm: number }> = q
    ? searchPlacesFromList(allPlaces, { q })
        .items.slice(0, 16)
        .map((p) => ({ ...p, distanceKm: haversineKm(viewCenter, p.coordinates) }))
        .sort((a, b) => {
          const aIn = inViewportSet.has(a.id) ? 0 : 1;
          const bIn = inViewportSet.has(b.id) ? 0 : 1;
          if (aIn !== bIn) return aIn - bIn;
          return a.distanceKm - b.distanceKm;
        })
        .slice(0, 6)
    : [];
  const provs: Province[] = q
    ? provinces.filter((p) => normalize(p.name).includes(normalize(q))).slice(0, 3)
    : [];
  const cats = q
    ? categories.filter((c) => normalize(c.labelVi).includes(normalize(q))).slice(0, 3)
    : [];
  const total = places.length + provs.length + cats.length;

  /* ---------- Handlers ---------- */

  const onSelectPlace = (place: PlaceItem) => {
    select(place.id);
    closeAndClear();
  };
  const onSelectCategory = (key: CategoryKey) => {
    clearFilter();
    toggleCategory(key);
    closeAndClear();
  };
  const onSelectProvince = (p: Province) => {
    window.__mapVN?.flyTo(p.center[0], p.center[1], 11);
    closeAndClear();
  };
  const closeAndClear = () => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="pointer-events-auto w-full max-w-xl">
      {/* Pill */}
      <div
        className={cn(
          "relative flex h-12 items-center gap-2 rounded-full glass shadow-md px-3 transition-shadow",
          open && "shadow-lg"
        )}
      >
        <Search size={16} className="text-text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Tìm địa điểm, tỉnh, danh mục…"
          className="flex-1 bg-transparent text-body outline-none placeholder:text-text-muted"
          enterKeyHint="search"
          aria-label="Tìm kiếm trên bản đồ"
        />
        {query && (
          <button
            type="button"
            aria-label="Xoá"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
          >
            <X size={14} />
          </button>
        )}
        <kbd className="hidden rounded border border-border/60 bg-bg/50 px-1.5 py-0.5 font-mono text-[10px] text-text-muted md:inline">
          /
        </kbd>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition.fast}
            className="absolute inset-x-0 z-50 origin-top overflow-hidden rounded-2xl border border-border bg-surface shadow-xl ring-1 ring-black/5 dark:ring-white/5"
          >
            {!q ? (
              <EmptyState
                onCategoryClick={onSelectCategory}
                activeFilter={activeFilter}
                onPlaceClick={onSelectPlace}
                onSelectProvince={onSelectProvince}
                inViewport={inViewport.slice(0, 5)}
                dominantProvince={dominantProvince}
                nearMe={nearMe}
              />
            ) : total === 0 ? (
              <NoResults q={q} />
            ) : (
              <div className="max-h-[68vh] overflow-y-auto p-2">
                {/* Places */}
                {places.length > 0 && (
                  <Group title="Địa điểm" icon={<MapPin size={12} />}>
                    {places.map((p) => (
                      <PlaceRow
                        key={p.id}
                        place={p}
                        onClick={() => onSelectPlace(p)}
                        distanceKm={p.distanceKm}
                      />
                    ))}
                  </Group>
                )}

                {/* Provinces */}
                {provs.length > 0 && (
                  <Group title="Tỉnh thành" icon={<Compass size={12} />}>
                    {provs.map((p) => (
                      <ActionRow
                        key={p.slug}
                        title={p.name}
                        subtitle={p.tagline}
                        icon={<MapPin size={16} className="text-text-muted" />}
                        onClick={() => onSelectProvince(p)}
                      />
                    ))}
                  </Group>
                )}

                {/* Categories */}
                {cats.length > 0 && (
                  <Group title="Danh mục" icon={<Tag size={12} />}>
                    {cats.map((c) => {
                      const Icon = c.icon;
                      return (
                        <ActionRow
                          key={c.key}
                          title={c.labelVi}
                          subtitle={`Lọc ${c.description.toLowerCase()}`}
                          icon={
                            <span
                              className="flex h-8 w-8 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${c.color} 14%, transparent)`,
                                color: c.color,
                              }}
                            >
                              <Icon size={14} />
                            </span>
                          }
                          onClick={() => onSelectCategory(c.key)}
                        />
                      );
                    })}
                  </Group>
                )}

                {/* See all results escape hatch */}
                <div className="mt-1 border-t border-border/40 pt-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}`}
                    onClick={closeAndClear}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-body-sm text-brand-600 hover:bg-surface-2"
                  >
                    <span>
                      Xem tất cả kết quả cho “<span className="font-medium">{q}</span>”
                    </span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- Empty state --------------------------------- */

function EmptyState({
  onCategoryClick,
  activeFilter,
  onPlaceClick,
  onSelectProvince,
  inViewport,
  dominantProvince,
  nearMe,
}: {
  onCategoryClick: (k: CategoryKey) => void;
  activeFilter: Set<CategoryKey>;
  onPlaceClick: (p: PlaceItem) => void;
  onSelectProvince: (p: Province) => void;
  inViewport: PlaceItem[];
  dominantProvince: string | null;
  nearMe: Array<PlaceItem & { distanceKm: number }>;
}) {
  const { placesBySlug } = useMapData();
  const trending = TRENDING_SLUGS.map((s) => placesBySlug[s]).filter(Boolean) as PlaceItem[];

  // Resolve the dominant province object (for the contextual fly-to action).
  const dominantProvinceObj = dominantProvince
    ? provinces.find((p) => p.name === dominantProvince) ?? null
    : null;

  // Show trending only when there's no contextual data yet.
  const showTrending = inViewport.length === 0 && nearMe.length === 0;

  return (
    <div className="p-4">
      {/* Quick category filters */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 px-1 text-overline text-text-subtle">
          <Sparkles size={12} /> Lọc nhanh
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = activeFilter.has(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => onCategoryClick(c.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-body-sm font-medium transition-colors",
                  active
                    ? "border-transparent text-white"
                    : "border-border bg-surface/60 text-text hover:bg-surface-2"
                )}
                style={active ? { backgroundColor: c.color } : undefined}
              >
                <Icon
                  size={13}
                  className={active ? "text-white" : ""}
                  style={!active ? { color: c.color } : undefined}
                />
                {c.labelVi}
              </button>
            );
          })}
        </div>
      </div>

      {/* Near user (GPS) */}
      {nearMe.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2 px-1 text-overline text-text-subtle">
            <MapPin size={12} className="text-info" /> Gần vị trí của bạn
          </div>
          <ul>
            {nearMe.map((p) => (
              <PlaceRow
                key={p.id}
                place={p}
                onClick={() => onPlaceClick(p)}
                distanceKm={p.distanceKm}
              />
            ))}
          </ul>
        </div>
      )}

      {/* In viewport */}
      {inViewport.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-overline text-text-subtle">
              <Compass size={12} />
              Trong khung nhìn
              {dominantProvince && (
                <span className="text-text-muted normal-case tracking-normal">— {dominantProvince}</span>
              )}
            </div>
            {dominantProvinceObj && (
              <button
                type="button"
                onClick={() => onSelectProvince(dominantProvinceObj)}
                className="text-body-sm text-brand-600 hover:underline"
              >
                Mở rộng {dominantProvinceObj.name}
              </button>
            )}
          </div>
          <ul>
            {inViewport.map((p) => (
              <PlaceRow key={p.id} place={p} onClick={() => onPlaceClick(p)} />
            ))}
          </ul>
        </div>
      )}

      {/* Fallback trending */}
      {showTrending && (
        <div>
          <div className="mb-2 flex items-center gap-2 px-1 text-overline text-text-subtle">
            <TrendingUp size={12} /> Đang được tìm nhiều
          </div>
          <ul>
            {trending.map((p) => (
              <PlaceRow key={p.id} place={p} onClick={() => onPlaceClick(p)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

function NoResults({ q }: { q: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-body text-text">Không tìm thấy “{q}”</p>
      <p className="mt-1 text-body-sm text-text-muted">Thử từ khoá khác hoặc lọc theo danh mục.</p>
    </div>
  );
}

/* --------------------------------- Row helpers --------------------------------- */

function Group({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-1 py-1">
      <div className="flex items-center gap-1.5 px-3 py-2 text-overline text-text-subtle">
        {icon}
        {title}
      </div>
      <ul>{children}</ul>
    </section>
  );
}

function PlaceRow({
  place,
  onClick,
  distanceKm,
}: {
  place: PlaceItem;
  onClick: () => void;
  distanceKm?: number;
}) {
  // categoryByKey not imported to keep this file self-contained — pull from categories list:
  const cat = categories.find((c) => c.key === place.category);
  const CatIcon = cat?.icon;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${cat?.color ?? "var(--brand-500)"} 14%, transparent)`,
            color: cat?.color,
          }}
        >
          {CatIcon ? <CatIcon size={15} /> : <MapPin size={15} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body text-text">{place.name}</div>
          <div className="flex items-center gap-1.5 text-body-sm text-text-muted">
            <span>{cat?.labelVi}</span>
            <span>·</span>
            <span className="truncate">{place.province}</span>
            <span className="inline-flex items-center gap-0.5">
              <span>·</span>
              <Star size={10} className="fill-warning text-warning" />
              {place.rating.toFixed(1)}
            </span>
            {distanceKm != null && (
              <>
                <span>·</span>
                <span className="text-info">{formatDistance(distanceKm)}</span>
              </>
            )}
          </div>
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}

function ActionRow({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body text-text">{title}</div>
          {subtitle && (
            <div className="truncate text-body-sm text-text-muted">{subtitle}</div>
          )}
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}
