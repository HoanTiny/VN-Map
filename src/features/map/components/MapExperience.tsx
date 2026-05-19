"use client";
import { useCallback, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { MapCanvas } from "./MapCanvas";
import { MapFilterChips } from "./MapFilterChips";
import { MapControls } from "./MapControls";
import { MapPlaceCard } from "./MapPlaceCard";
import { MapSidePanel } from "./MapSidePanel";
import { useMapStore } from "@/stores/map-store";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { VN_CENTER } from "@/lib/constants";

/**
 * MapExperience is the full /explore composition. It owns DOM refs and
 * exposes control handlers (zoom in/out, locate) by reaching into the
 * mapbox instance via a window-level hook (set by MapCanvas via the store).
 *
 * Approach: we keep the Map instance internal to MapCanvas and trigger
 * its actions through a tiny ref-bridge stored on `window.__mapVN`.
 */

declare global {
  interface Window {
    __mapVN?: {
      zoomIn: () => void;
      zoomOut: () => void;
      flyTo: (lng: number, lat: number, zoom?: number) => void;
    };
  }
}


export function MapExperience() {
  const ready = useMapStore((s) => s.ready);
  const reduceMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

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

      <MapCanvas />

      {/* Chrome */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top: search + filter chips */}
        <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-3 px-4">
          <Link
            href="/search"
            className="pointer-events-auto group flex h-12 w-full max-w-md items-center gap-3 rounded-full glass shadow-md px-4"
          >
            <Search size={16} className="text-text-muted group-hover:text-brand-500" />
            <span className="flex-1 text-body text-text-muted">Tìm địa điểm, vùng…</span>
            <kbd className="hidden rounded border border-border bg-bg/60 px-1.5 py-0.5 font-mono text-[10px] text-text-muted md:inline">
              /
            </kbd>
          </Link>

          <div className="pointer-events-auto w-full max-w-3xl">
            <div className="rounded-full glass shadow-sm px-2 py-1.5">
              <MapFilterChips />
            </div>
          </div>
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
      </div>
    </div>
  );
}
