"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Plus, X, Briefcase, Check } from "lucide-react";
import { MapCanvas } from "./MapCanvas";
import { MapSearchBar } from "./MapSearchBar";
import type { CategoryKey } from "@/config/categories";
import { provinceBySlug } from "@/config/regions";
import { getTrip } from "@/features/trip/lib/storage";
import { MapFilterChips } from "./MapFilterChips";
import { MapControls } from "./MapControls";
import { MapPlaceCard } from "./MapPlaceCard";
import { MapSidePanel } from "./MapSidePanel";
import { useMapStore } from "@/stores/map-store";
import { useUIStore } from "@/stores/ui-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { VN_CENTER } from "@/lib/constants";
import { transition, spring } from "@/lib/motion";
import { Button } from "@/ui/button";
import { SuggestPlaceForm } from "@/features/submit/components/SuggestPlaceForm";
import { AISuggestPanel } from "@/features/ai/components/AISuggestPanel";

/**
 * MapExperience is the full /explore composition. It owns DOM refs and
 * exposes control handlers (zoom in/out, locate) by reaching into the
 * mapbox instance via a window-level hook (set by MapCanvas via the store).
 *
 * Approach: we keep the Map instance internal to MapCanvas and trigger
 * its actions through a tiny ref-bridge stored on `window.__mapVN`.
 */


import { placesData as mockPlacesData, type PlacesFC } from "../lib/places-data";
import { MapDataProvider } from "../context/MapDataContext";

export interface MapExperienceProps {
  data?: PlacesFC;
}

export function MapExperience({ data }: MapExperienceProps = {}) {
  // Resolve dataset once at top — used by URL state effects + map source +
  // passed to MapDataProvider for chrome consumers.
  const effectiveData = data ?? mockPlacesData;
  const ready = useMapStore((s) => s.ready);
  const reduceMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const searchOpen = useUIStore((s) => s.searchOpen);
  const pickMode = useUIStore((s) => s.pickMode);
  const pickedCoords = useUIStore((s) => s.pickedCoords);
  const setPickMode = useUIStore((s) => s.setPickMode);
  const setPickedCoords = useUIStore((s) => s.setPickedCoords);
  const tripPickContext = useUIStore((s) => s.tripPickContext);
  const setTripPickContext = useUIStore((s) => s.setTripPickContext);
  const router = useRouter();
  const [submitOpen, setSubmitOpen] = useState(false);

  // When user clicks the map in pick mode, MapCanvas writes to pickedCoords.
  // Open the SuggestPlaceForm with those coords.
  useEffect(() => {
    if (pickedCoords) setSubmitOpen(true);
  }, [pickedCoords]);

  // Apply URL state (?place=slug, ?cat=key) once map is ready.
  // Re-runs if URL changes (e.g. user clicks a different deep-link).
  useEffect(() => {
    if (!ready) return;
    const store = useMapStore.getState();

    const placeSlug = searchParams.get("place");
    if (placeSlug) {
      const feature = effectiveData.features.find(
        (f) => f.properties.slug === placeSlug
      );
      if (feature && store.selectedPlaceId !== feature.properties.id) {
        store.select(feature.properties.id);
      }
    }

    const cat = searchParams.get("cat") as CategoryKey | null;
    if (cat && !store.filter.has(cat)) {
      // Replace filter with just this category for deep-link clarity.
      store.clearFilter();
      store.toggleCategory(cat);
    }
  }, [ready, searchParams]);

  // Sync ?pickTrip=<id>&pickDay=<n> → tripPickContext
  useEffect(() => {
    const tripId = searchParams.get("pickTrip");
    const dayStr = searchParams.get("pickDay");
    if (tripId && dayStr) {
      const dayIndex = parseInt(dayStr, 10);
      if (Number.isFinite(dayIndex)) {
        setTripPickContext({ tripId, dayIndex });
        return;
      }
    }
    setTripPickContext(null);
  }, [searchParams, setTripPickContext]);

  const exitTripPick = useCallback(() => {
    const ctx = useUIStore.getState().tripPickContext;
    setTripPickContext(null);
    if (ctx) router.push(`/trip/${ctx.tripId}`);
  }, [router, setTripPickContext]);

  // When entering trip-pick mode, auto-focus the map on the trip's destinations.
  // - Single destination → flyTo province center
  // - Multi destinations → fitBounds covering all province centers (with padding)
  // - No destinations → leave viewport as-is
  useEffect(() => {
    if (!ready || !tripPickContext) return;
    const trip = getTrip(tripPickContext.tripId);
    if (!trip || trip.destinations.length === 0) return;
    const provs = trip.destinations
      .map((slug) => provinceBySlug[slug])
      .filter(Boolean) as Array<{ center: [number, number] }>;
    if (provs.length === 0) return;

    if (provs.length === 1) {
      const c = provs[0]!.center;
      window.__mapVN?.flyTo(c[0], c[1], 11);
    } else {
      const lngs = provs.map((p) => p.center[0]);
      const lats = provs.map((p) => p.center[1]);
      window.__mapVN?.fitBounds({
        west: Math.min(...lngs) - 0.3,
        east: Math.max(...lngs) + 0.3,
        south: Math.min(...lats) - 0.3,
        north: Math.max(...lats) + 0.3,
      });
    }
  }, [ready, tripPickContext]);

  // We attach control hooks once map is ready. Because MapCanvas owns the
  // instance, we bridge via a controlled custom event. Simpler: place the
  // mapbox global on window. Done inside MapCanvas would be more direct,
  // but we keep MapCanvas presentation-only and use mapbox's gl-js's
  // built-in zoom via DOM events keyed off the controls.
  const zoomIn = useCallback(() => window.__mapVN?.zoomIn(), []);
  const zoomOut = useCallback(() => window.__mapVN?.zoomOut(), []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        useMapStore.getState().setUserLocation({ lng: longitude, lat: latitude, accuracy });
        window.__mapVN?.flyTo(longitude, latitude, 13);
      },
      () => {
        useMapStore.getState().setUserLocation(null);
        window.__mapVN?.flyTo(VN_CENTER.lng, VN_CENTER.lat, VN_CENTER.zoom);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Keyboard shortcuts: + / - zoom, Esc deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "Escape") useMapStore.getState().select(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut]);

  return (
    <MapDataProvider data={effectiveData}>
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-bg">
      {/* Loading shimmer underlay until ready */}
      {!ready && (
        <div
          className="absolute inset-0 skeleton"
          style={{
            animationDuration: reduceMotion ? "0ms" : undefined,
          }}
        />
      )}

      <MapCanvas data={effectiveData} />

      {/* Chrome */}
      <div className="pointer-events-none absolute inset-0 z-[20]">
        {/* Top: search + filter chips + trip-pick banner */}
        <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-3 px-4">
          <div className="pointer-events-auto relative w-full max-w-xl">
            <MapSearchBar />
          </div>

          <AnimatePresence>
            {tripPickContext && (
              <TripPickBanner
                key="trip-pick-banner"
                context={tripPickContext}
                onExit={exitTripPick}
              />
            )}
          </AnimatePresence>

          {!searchOpen && !tripPickContext && (
            <div className="pointer-events-auto w-full max-w-3xl">
              <div className="rounded-full glass shadow-sm px-2 py-1.5">
                <MapFilterChips />
              </div>
            </div>
          )}
        </div>

        {/* Right side: desktop list panel */}
        <div className="absolute right-4 top-32 bottom-32 hidden lg:flex">
          <MapSidePanel />
        </div>

        {/* Bottom right: controls */}
        <div className="pointer-events-auto absolute bottom-6 right-4">
          <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onLocate={locate} />
        </div>

        {/* Bottom left/center: selected place card */}
        <div className="pointer-events-none absolute inset-x-4 bottom-6 flex justify-center md:left-6 md:right-auto md:justify-start">
          <MapPlaceCard />
        </div>

        {/* Left: AI suggest — below filter chips, never overlaps place card */}
        <div className="pointer-events-auto absolute top-32 left-4">
          <AISuggestPanel />
        </div>


        {/* Pick-mode contribute button + banner */}
        <AnimatePresence>
          {!pickMode && !submitOpen && !tripPickContext && (
            <m.div
              key="pick-fab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={transition.fast}
              className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:bottom-[unset] md:top-44 md:translate-x-0"
            >
              <Button
                size="sm"
                variant="primary"
                onClick={() => setPickMode(true)}
                className="shadow-lg"
              >
                <Plus size={14} /> Đóng góp ở đây
              </Button>
            </m.div>
          )}

          {pickMode && (
            <m.div
              key="pick-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={spring.default}
              className={cnFlex(
                "pointer-events-auto absolute left-1/2 top-[5.5rem] z-30 -translate-x-1/2",
                "flex items-center gap-3 rounded-full bg-brand-500 px-4 py-2 text-white shadow-xl ring-4 ring-brand-500/20"
              )}
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-body-sm font-medium">
                Nhấp vào bản đồ để chọn vị trí
              </span>
              <button
                type="button"
                onClick={() => setPickMode(false)}
                aria-label="Huỷ chọn vị trí"
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <X size={12} />
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community submit form (driven by pickedCoords) */}
      <SuggestPlaceForm
        open={submitOpen}
        onOpenChange={(o) => {
          setSubmitOpen(o);
          if (!o) setPickedCoords(null);
        }}
        initialCoords={pickedCoords ?? undefined}
      />
    </div>
    </MapDataProvider>
  );
}

// inline tiny class-joiner so we don't need to import cn just for this file
function cnFlex(...c: string[]) {
  return c.join(" ");
}

/* --------------------------------------------------------------------------- */
/*                            Trip-pick banner                                 */
/* --------------------------------------------------------------------------- */

interface TripPickBannerProps {
  context: { tripId: string; dayIndex: number };
  onExit: () => void;
}

function TripPickBanner({ context, onExit }: TripPickBannerProps) {
  const trip = getTrip(context.tripId);
  const [activeKey, setActiveKey] = useState<string | "all">("all");

  const destinations = trip?.destinations ?? [];
  const provs = destinations
    .map((slug) => ({ slug, prov: provinceBySlug[slug] }))
    .filter((d) => d.prov);
  const multi = provs.length > 1;

  const focusAll = () => {
    if (provs.length === 0) return;
    if (provs.length === 1) {
      const c = provs[0]!.prov!.center;
      window.__mapVN?.flyTo(c[0], c[1], 11);
    } else {
      const lngs = provs.map((p) => p.prov!.center[0]);
      const lats = provs.map((p) => p.prov!.center[1]);
      window.__mapVN?.fitBounds({
        west: Math.min(...lngs) - 0.3,
        east: Math.max(...lngs) + 0.3,
        south: Math.min(...lats) - 0.3,
        north: Math.max(...lats) + 0.3,
      });
    }
    setActiveKey("all");
  };

  const focusOne = (slug: string) => {
    const prov = provinceBySlug[slug];
    if (!prov) return;
    window.__mapVN?.flyTo(prov.center[0], prov.center[1], 11);
    setActiveKey(slug);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={spring.default}
      className={cnFlex(
        "pointer-events-auto w-full max-w-2xl rounded-2xl bg-brand-500 px-4 py-3 text-white",
        "shadow-xl ring-4 ring-brand-500/20"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Briefcase size={16} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-body-sm font-medium">
            {trip?.name ?? "Đang chọn"} · Ngày {context.dayIndex + 1}
          </p>
          <p className="text-caption text-white/80">Click marker để thêm</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 text-body-sm font-medium hover:bg-white/30"
        >
          <Check size={14} /> Xong
        </button>
      </div>

      {multi && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-white/15 pt-2.5">
          <span className="text-caption text-white/75">Tập trung:</span>
          <button
            type="button"
            onClick={focusAll}
            aria-pressed={activeKey === "all"}
            className={cnFlex(
              "h-7 rounded-full px-3 text-caption font-medium transition-colors",
              activeKey === "all"
                ? "bg-white text-brand-700"
                : "bg-white/15 text-white hover:bg-white/25"
            )}
          >
            Toàn bộ
          </button>
          {provs.map(({ slug, prov }) => (
            <button
              key={slug}
              type="button"
              onClick={() => focusOne(slug)}
              aria-pressed={activeKey === slug}
              className={cnFlex(
                "h-7 rounded-full px-3 text-caption font-medium transition-colors",
                activeKey === slug
                  ? "bg-white text-brand-700"
                  : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              {prov!.name}
            </button>
          ))}
        </div>
      )}
    </m.div>
  );
}
