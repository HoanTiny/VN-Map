"use client";
import { createContext, useContext, useMemo } from "react";
import type {
  PlaceFeatureProps,
  PlaceItem,
  PlacesFC,
} from "../lib/places-data";

interface MapDataValue {
  /** Raw GeoJSON used by the MapLibre source. */
  geoJSON: PlacesFC;
  /** Flat array — sort by rating desc. */
  places: PlaceItem[];
  /** Lookup by id (Mapbox feature id). */
  placesById: Record<string, PlaceItem>;
  /** Lookup by slug. */
  placesBySlug: Record<string, PlaceItem>;
}

const MapDataContext = createContext<MapDataValue | null>(null);

export interface MapDataProviderProps {
  data: PlacesFC;
  children: React.ReactNode;
}

/**
 * Provides the current map dataset to all client components inside
 * MapExperience. Source of truth comes from the server (Supabase or mock
 * fallback) and is passed through props — no client-side fetches needed.
 */
export function MapDataProvider({ data, children }: MapDataProviderProps) {
  const value = useMemo<MapDataValue>(() => {
    const places: PlaceItem[] = data.features.map((f) => featureToPlace(f.properties, f));
    return {
      geoJSON: data,
      places,
      placesById: Object.fromEntries(places.map((p) => [p.id, p])),
      placesBySlug: Object.fromEntries(places.map((p) => [p.slug, p])),
    };
  }, [data]);

  return <MapDataContext.Provider value={value}>{children}</MapDataContext.Provider>;
}

export function useMapData(): MapDataValue {
  const ctx = useContext(MapDataContext);
  if (!ctx) throw new Error("useMapData must be used inside <MapDataProvider>");
  return ctx;
}

/* --------------------------- Geometry helpers --------------------------- */

/** Places inside the given geographic bounds. */
export function filterPlacesInBounds(
  places: PlaceItem[],
  b: { west: number; south: number; east: number; north: number } | null
): PlaceItem[] {
  if (!b) return [];
  return places.filter(
    (p) => p.lng >= b.west && p.lng <= b.east && p.lat >= b.south && p.lat <= b.north
  );
}

/** N closest places to a coord, sorted by haversine distance. */
export function placesNearCoord(
  places: PlaceItem[],
  coord: [number, number],
  limit = 5
): Array<PlaceItem & { distanceKm: number }> {
  return places
    .map((p) => ({ ...p, distanceKm: haversineKm(coord, p.coordinates) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/* --------------------------- Internal helpers --------------------------- */

function featureToPlace(
  props: PlaceFeatureProps,
  feature: PlacesFC["features"][number]
): PlaceItem {
  const [lng, lat] = feature.geometry.coordinates;
  return {
    ...props,
    lng,
    lat,
    coordinates: [lng, lat],
  };
}
