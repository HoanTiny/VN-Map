/**
 * Server-side place queries — unified data layer.
 *
 * Uses Supabase when configured (NEXT_PUBLIC_SUPABASE_URL + ANON_KEY env vars
 * present). Falls back to the in-memory mock dataset when not — this lets the
 * app run with zero backend during Phase 1 demo work.
 *
 * Each function shape-matches the mock equivalents in `places-data.ts` so
 * pages can swap without changing call sites.
 */

import { getLocale } from "next-intl/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  allPlaces as mockAllPlaces,
  getPlaceBySlug as mockGetPlaceBySlug,
  getNearbyPlaces as mockGetNearbyPlaces,
  placesData as mockPlacesData,
  type PlaceItem,
  type PlacesFC,
} from "@/features/map/lib/places-data";
import type { CategoryKey } from "@/config/categories";

/**
 * Resolve VI/EN columns based on caller-supplied locale. EN columns are
 * optional in the database (added in migration 0006); when null, we fall
 * back to the Vietnamese source. We pass `locale` explicitly through the
 * read path rather than calling `getLocale()` deep inside to keep these
 * functions usable from non-RSC contexts (e.g. server actions, seed scripts).
 */
type Locale = "vi" | "en";

async function currentLocale(): Promise<Locale> {
  try {
    const l = await getLocale();
    return l === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}

/* --------------------------------------------------------------------------- */
/*                              Row → PlaceItem map                            */
/* --------------------------------------------------------------------------- */

interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  province: string;
  province_slug: string;
  district: string | null;
  address: string | null;
  category: string;
  cover: string;
  rating: number;
  review_count: number;
  highlight: string | null;
  highlight_en: string | null;
  description_en: string | null;
  price_range: "$" | "$$" | "$$$" | "$$$$" | null;
  opening_hours: string | null;
  tags: string[] | null;
  source: "seed" | "community";
  submitted_by: string | null;
  lng: number;
  lat: number;
}

/**
 * Map a DB row to PlaceItem with locale-aware name/highlight. Falls back to VI
 * when the EN column is null. `descriptionEn` is preserved on the item so
 * detail page components can decide what to render.
 */
function rowToPlace(row: PlaceRow, locale: Locale = "vi"): PlaceItem {
  const useEn = locale === "en";
  return {
    id: row.id,
    slug: row.slug,
    name: useEn ? row.name_en ?? row.name : row.name,
    nameEn: row.name_en ?? undefined,
    province: row.province,
    district: row.district ?? undefined,
    address: row.address ?? undefined,
    category: row.category as CategoryKey,
    cover: row.cover,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    highlight: useEn
      ? row.highlight_en ?? row.highlight ?? undefined
      : row.highlight ?? undefined,
    highlightEn: row.highlight_en ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    priceRange: row.price_range ?? undefined,
    openingHours: row.opening_hours ?? undefined,
    tags: row.tags ?? undefined,
    source: row.source,
    submittedBy: row.submitted_by ?? undefined,
    lng: Number(row.lng),
    lat: Number(row.lat),
    coordinates: [Number(row.lng), Number(row.lat)] as [number, number],
  };
}

/* --------------------------------------------------------------------------- */
/*                                 Queries                                     */
/* --------------------------------------------------------------------------- */

/** All places — used by listings + map source. */
export async function listAllPlaces(): Promise<PlaceItem[]> {
  if (!isSupabaseConfigured()) return mockAllPlaces;
  const [supabase, locale] = await Promise.all([createServerClient(), currentLocale()]);
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("rating", { ascending: false });
  if (error) {
    console.error("listAllPlaces failed:", error.message);
    return mockAllPlaces;
  }
  return (data as PlaceRow[]).map((row) => rowToPlace(row, locale));
}

/** Single place by slug. */
export async function getPlaceBySlug(slug: string): Promise<PlaceItem | undefined> {
  if (!isSupabaseConfigured()) return mockGetPlaceBySlug(slug);
  const [supabase, locale] = await Promise.all([createServerClient(), currentLocale()]);
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("getPlaceBySlug failed:", error.message);
    return mockGetPlaceBySlug(slug);
  }
  return data ? rowToPlace(data as PlaceRow, locale) : undefined;
}

/** Places filtered by category. */
export async function listPlacesByCategory(
  category: CategoryKey
): Promise<PlaceItem[]> {
  if (!isSupabaseConfigured()) {
    return mockAllPlaces.filter((p) => p.category === category);
  }
  const [supabase, locale] = await Promise.all([createServerClient(), currentLocale()]);
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false });
  if (error) {
    console.error("listPlacesByCategory failed:", error.message);
    return mockAllPlaces.filter((p) => p.category === category);
  }
  return (data as PlaceRow[]).map((row) => rowToPlace(row, locale));
}

/** Places filtered by province display name. */
export async function listPlacesByProvince(provinceName: string): Promise<PlaceItem[]> {
  if (!isSupabaseConfigured()) {
    return mockAllPlaces.filter((p) => p.province === provinceName);
  }
  const [supabase, locale] = await Promise.all([createServerClient(), currentLocale()]);
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("province", provinceName)
    .order("rating", { ascending: false });
  if (error) {
    console.error("listPlacesByProvince failed:", error.message);
    return mockAllPlaces.filter((p) => p.province === provinceName);
  }
  return (data as PlaceRow[]).map((row) => rowToPlace(row, locale));
}

/** Nearby places (haversine) — keep mock impl, DB version can use ST_Distance later. */
export async function getNearbyPlaces(
  slug: string,
  opts?: { radiusKm?: number; limit?: number; sameCategoryFirst?: boolean }
): Promise<PlaceItem[]> {
  if (!isSupabaseConfigured()) return mockGetNearbyPlaces(slug, opts);
  // For now, hydrate all places then filter client-side (40 places is fine).
  // Switch to PostGIS ST_DWithin in a follow-up when dataset grows.
  const all = await listAllPlaces();
  const origin = all.find((p) => p.slug === slug);
  if (!origin) return [];
  const radiusKm = opts?.radiusKm ?? 50;
  const limit = opts?.limit ?? 6;
  const sameCatFirst = opts?.sameCategoryFirst ?? true;

  const scored = all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, d: haversineKm(origin.coordinates, p.coordinates) }))
    .filter(({ d }) => d <= radiusKm);

  if (sameCatFirst) {
    scored.sort((a, b) => {
      const aSame = a.p.category === origin.category ? 0 : 1;
      const bSame = b.p.category === origin.category ? 0 : 1;
      if (aSame !== bSame) return aSame - bSame;
      return a.d - b.d;
    });
  } else {
    scored.sort((a, b) => a.d - b.d);
  }
  return scored.slice(0, limit).map(({ p }) => p);
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Aggregated site stats for landing page hero / CTA. */
export interface SiteStats {
  placeCount: number;
  provinceCount: number;
  categoryCount: number;
  avgRating: number;
  reviewCount: number;
  userCount: number;
}

const FALLBACK_STATS: SiteStats = {
  placeCount: mockAllPlaces.length,
  provinceCount: new Set(mockAllPlaces.map((p) => p.province)).size,
  categoryCount: new Set(mockAllPlaces.map((p) => p.category)).size,
  avgRating:
    Math.round(
      (mockAllPlaces.reduce((s, p) => s + p.rating, 0) / mockAllPlaces.length) *
        10
    ) / 10,
  reviewCount: mockAllPlaces.reduce((s, p) => s + (p.reviewCount ?? 0), 0),
  userCount: 0,
};

export async function getSiteStats(): Promise<SiteStats> {
  if (!isSupabaseConfigured()) return FALLBACK_STATS;
  try {
    const supabase = await createServerClient();
    const [placesRes, profilesRes] = await Promise.all([
      supabase.from("places").select("province,category,rating,review_count"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    if (placesRes.error) throw placesRes.error;
    const rows = (placesRes.data ?? []) as Array<{
      province: string;
      category: string;
      rating: number | null;
      review_count: number | null;
    }>;
    if (rows.length === 0) return FALLBACK_STATS;
    const provinces = new Set(rows.map((r) => r.province));
    const cats = new Set(rows.map((r) => r.category));
    const ratings = rows.map((r) => Number(r.rating ?? 0)).filter((r) => r > 0);
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((s, x) => s + x, 0) / ratings.length) * 10) /
        10
      : 0;
    const reviewCount = rows.reduce(
      (s, r) => s + Number(r.review_count ?? 0),
      0
    );
    return {
      placeCount: rows.length,
      provinceCount: provinces.size,
      categoryCount: cats.size,
      avgRating,
      reviewCount,
      userCount: profilesRes.count ?? 0,
    };
  } catch (err) {
    console.error("getSiteStats failed:", (err as Error).message);
    return FALLBACK_STATS;
  }
}

/** GeoJSON for map source. */
export async function getPlacesGeoJSON(): Promise<PlacesFC> {
  if (!isSupabaseConfigured()) return mockPlacesData;
  const places = await listAllPlaces();
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        province: p.province,
        district: p.district,
        address: p.address,
        category: p.category,
        cover: p.cover,
        rating: p.rating,
        reviewCount: p.reviewCount,
        highlight: p.highlight,
        priceRange: p.priceRange,
        openingHours: p.openingHours,
        tags: p.tags,
        source: p.source,
        submittedBy: p.submittedBy,
      },
    })),
  };
}

// Client-side variants live in queries.client.ts to keep this file
// server-only (no "use client" module imports leaking into server modules).
