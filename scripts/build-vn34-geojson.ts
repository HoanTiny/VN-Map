/**
 * Merge VN63.geojson → VN34.geojson per Nghị quyết 01/07/2025.
 *
 * Reads public/json/VN63.geojson (63 old provinces, properties.ten_tinh),
 * groups by legacyProvinceMap → 34 new admin units, unions polygons within
 * each group (removes internal borders), simplifies geometry, and writes
 * public/json/VN34.geojson.
 *
 * Run: npx tsx scripts/build-vn34-geojson.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import union from "@turf/union";
import simplify from "@turf/simplify";
import { featureCollection, feature } from "@turf/helpers";
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from "geojson";
import { legacyProvinceMap, provinces } from "../src/config/regions";

const IN = resolve(process.cwd(), "public/json/VN63.geojson");
const OUT = resolve(process.cwd(), "public/json/VN34.geojson");
const SIMPLIFY_TOLERANCE = 0.003; // ~330m at equator — visually identical, much smaller file

interface Vn63Props {
  ma_tinh: string;
  ten_tinh: string;
  loai?: string;
  cap?: number;
  stt?: number;
}

const raw = JSON.parse(readFileSync(IN, "utf-8")) as FeatureCollection<
  Polygon | MultiPolygon,
  Vn63Props
>;

console.log(`Read ${raw.features.length} features from VN63.geojson`);

// Normalize an old province name so we can match it to legacyProvinceMap.
// VN63 uses names like "Thừa Thiên Huế", "Bà Rịa - Vũng Tàu", "TP. Hồ Chí Minh".
function normalizeOldName(s: string): string {
  return s
    .replace(/^TP\.\s*/i, "")
    .replace(/^Thành phố\s*/i, "")
    .replace(/^Tỉnh\s*/i, "")
    .trim();
}

// Build name-variant lookup for legacyProvinceMap so common spellings match.
const lookup = new Map<string, string>();
for (const [oldName, newSlug] of Object.entries(legacyProvinceMap)) {
  lookup.set(oldName, newSlug);
  lookup.set(normalizeOldName(oldName), newSlug);
}
// Manual extras for VN63 spelling variants
const manualAliases: Record<string, string> = {
  "Hồ Chí Minh": "tp-hcm",
  "TP Hồ Chí Minh": "tp-hcm",
  "Thành phố Hồ Chí Minh": "tp-hcm",
  "Bà Rịa - Vũng Tàu": "tp-hcm",
  "Bà Rịa-Vũng Tàu": "tp-hcm",
  "Khánh Hòa": "khanh-hoa",
  "Đăk Lăk": "dak-lak",
  "Đắc Lắc": "dak-lak",
};
for (const [k, v] of Object.entries(manualAliases)) lookup.set(k, v);

// Group features by new slug.
const groups = new Map<string, Feature<Polygon | MultiPolygon>[]>();
const unmatched = new Set<string>();

for (const f of raw.features) {
  const name = f.properties.ten_tinh;
  const slug = lookup.get(name) ?? lookup.get(normalizeOldName(name));
  if (!slug) {
    unmatched.add(name);
    continue;
  }
  const arr = groups.get(slug) ?? [];
  arr.push(f);
  groups.set(slug, arr);
}

if (unmatched.size > 0) {
  console.warn("⚠️  Unmatched provinces (skipped):", [...unmatched]);
}

console.log(`Grouped into ${groups.size} new admin units`);

// Union and simplify each group.
const out: Feature<Polygon | MultiPolygon>[] = [];
for (const prov of provinces) {
  const fs = groups.get(prov.slug);
  if (!fs || fs.length === 0) {
    console.warn(`⚠️  No source features for ${prov.slug} (${prov.name})`);
    continue;
  }

  let merged: Feature<Polygon | MultiPolygon> = fs[0]!;
  for (let i = 1; i < fs.length; i++) {
    try {
      const u = union(featureCollection([merged, fs[i]!] as never));
      if (u) merged = u as Feature<Polygon | MultiPolygon>;
    } catch (err) {
      console.warn(`  union failed for ${prov.slug} part ${i}:`, (err as Error).message);
    }
  }

  const simplified = simplify(merged, {
    tolerance: SIMPLIFY_TOLERANCE,
    highQuality: false,
  }) as Feature<Polygon | MultiPolygon>;

  const result = feature(simplified.geometry, {
    slug: prov.slug,
    name: prov.name,
    region: prov.region,
    isCity: !!prov.isCity,
    merged: prov.merged ?? [],
  }) as Feature<Polygon | MultiPolygon>;
  result.id = prov.slug;
  out.push(result);
  console.log(`  ✓ ${prov.slug.padEnd(14)} ${prov.name.padEnd(14)} (${fs.length} part${fs.length > 1 ? "s" : ""})`);
}

const fc: FeatureCollection = {
  type: "FeatureCollection",
  features: out,
};

writeFileSync(OUT, JSON.stringify(fc));
console.log(`\nWrote ${out.length} features → ${OUT}`);
console.log(`Size: ${(JSON.stringify(fc).length / 1024 / 1024).toFixed(2)} MB`);
