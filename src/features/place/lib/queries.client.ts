"use client";

/**
 * Client-side place queries. Use these from Client Components / hooks where
 * the server `createClient` (cookies-based) doesn't work.
 *
 * Keep separate from `queries.ts` so server-imports don't transitively pull
 * in the "use client" boundary.
 */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { allPlaces as mockAllPlaces, type PlaceItem } from "@/features/map/lib/places-data";
import type { CategoryKey } from "@/config/categories";

interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  province: string;
  province_slug: string;
  district: string | null;
  address: string | null;
  category: string;
  cover: string;
  rating: number;
  review_count: number;
  highlight: string | null;
  price_range: "$" | "$$" | "$$$" | "$$$$" | null;
  opening_hours: string | null;
  tags: string[] | null;
  source: "seed" | "community";
  submitted_by: string | null;
  lng: number;
  lat: number;
}

function rowToPlace(row: PlaceRow): PlaceItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    province: row.province,
    district: row.district ?? undefined,
    address: row.address ?? undefined,
    category: row.category as CategoryKey,
    cover: row.cover,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    highlight: row.highlight ?? undefined,
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

export async function clientListAllPlaces(): Promise<PlaceItem[]> {
  if (!isSupabaseConfigured()) return mockAllPlaces;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .order("rating", { ascending: false });
  if (error || !data) return mockAllPlaces;
  return (data as PlaceRow[]).map(rowToPlace);
}
