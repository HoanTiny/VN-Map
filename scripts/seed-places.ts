/**
 * Seed Supabase `places` table from src/features/map/lib/places-data.ts.
 *
 * Usage:
 *   pnpm tsx scripts/seed-places.ts
 *
 * Requirements:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (NOT the anon key — service-role
 *     bypasses RLS and can insert seed data)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - Schema migration 0001_init.sql already applied
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { allPlaces } from "../src/features/map/lib/places-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  // Node < 22 has no built-in WebSocket — pass the `ws` lib for Realtime init.
  realtime: { transport: ws as unknown as typeof WebSocket },
});

function slugifyProvince(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

async function main() {
  console.log(`Seeding ${allPlaces.length} places...`);

  // Upsert by slug. Using PostGIS POINT via raw SQL — Supabase JS doesn't
  // natively support geography type inserts so we use the .rpc + raw query
  // pattern OR just store lng/lat columns and have a trigger build location.
  // Simpler: send WKT via PostgREST `Prefer: params=single-object` — but PG
  // accepts ST_Point(lng, lat) via expression in insert too. We'll insert
  // location as a WKT string and let PG cast.
  const rows = allPlaces.map((p) => ({
    slug: p.slug,
    name: p.name,
    province: p.province,
    province_slug: slugifyProvince(p.province),
    district: p.district ?? null,
    address: p.address ?? null,
    category: p.category,
    cover: p.cover,
    rating: p.rating,
    review_count: p.reviewCount,
    highlight: p.highlight ?? null,
    price_range: p.priceRange ?? null,
    opening_hours: p.openingHours ?? null,
    tags: p.tags ?? null,
    source: p.source,
    submitted_by: p.submittedBy ?? null,
    location: `POINT(${p.lng} ${p.lat})`,
  }));

  // Batch upsert. PostgREST accepts WKT for geography columns.
  const { error } = await supabase
    .from("places")
    .upsert(rows, { onConflict: "slug" });

  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log(`✓ Seeded ${rows.length} places.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
