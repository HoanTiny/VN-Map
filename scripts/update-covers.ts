/**
 * update-covers.ts
 *
 * Searches Unsplash for a cover photo for each place and updates the DB.
 * Searches by English name (name_en) for best accuracy, falls back to slug words.
 * Requires: UNSPLASH_ACCESS_KEY and Supabase env vars.
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/update-covers.ts
 *   pnpm tsx --env-file=.env.local scripts/update-covers.ts --slug buu-dien-sai-gon
 *   pnpm tsx --env-file=.env.local scripts/update-covers.ts --dry-run
 *   pnpm tsx --env-file=.env.local scripts/update-covers.ts --batch 20  (process N places)
 */

import { createClient } from "@supabase/supabase-js";

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!UNSPLASH_KEY) {
  console.error("❌ Missing UNSPLASH_ACCESS_KEY. Get one at https://unsplash.com/developers");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase env vars.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slugFilter = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const batchSize = args.includes("--batch") ? Number(args[args.indexOf("--batch") + 1]) : null;

// Delay between requests (ms) — Unsplash demo: 50 req/hr = 72 sec/req max,
// but in practice burst is fine. 800ms gives safe headroom.
const REQUEST_DELAY_MS = 800;

// Map category → Unsplash context to improve relevance
const categoryHints: Record<string, string> = {
  cafe: "cafe coffee Vietnam",
  restaurant: "Vietnamese food restaurant",
  bar: "cocktail bar Vietnam nightlife",
  hotel: "boutique hotel Vietnam",
  attraction: "landmark Vietnam tourism",
  market: "local market Vietnam",
  park: "national park Vietnam",
  beach: "tropical beach Vietnam",
  museum: "museum Vietnam",
  mountain: "mountain landscape Vietnam",
  temple: "Buddhist temple pagoda Vietnam",
  waterfall: "waterfall jungle Vietnam",
};

// Slug → curated English search override for places where name_en is missing
// or generic search doesn't work well. Add more as needed.
const slugOverrides: Record<string, string> = {
  "sa-pa": "Sapa rice terraces Vietnam",
  "ha-long-bay": "Ha Long Bay Vietnam karst",
  "hoi-an": "Hoi An ancient town lanterns Vietnam",
  "nha-trang": "Nha Trang bay beach Vietnam",
  "da-lat": "Da Lat highland Vietnam flower",
  "mu-cang-chai": "Mu Cang Chai terraced rice fields Vietnam",
  "phong-nha": "Phong Nha cave stalactite Vietnam",
  "sai-gon": "Ho Chi Minh City skyline Vietnam",
  "ho-hoan-kiem": "Hoan Kiem Lake Hanoi Vietnam",
  "buu-dien-sai-gon": "Saigon Central Post Office interior Vietnam",
  "saigon-central-post-office": "Saigon Central Post Office Notre Dame Vietnam",
  "thien-mu-pagoda": "Thien Mu Pagoda Hue Vietnam",
  "hue-imperial": "Hue Imperial City Citadel Vietnam",
  "ba-na-hills": "Ba Na Hills Golden Bridge Vietnam Da Nang",
  "ba-na-golden-bridge": "Golden Bridge hands Ba Na Hills Vietnam",
  "fansipan-peak": "Fansipan peak summit Vietnam",
  "independence-palace": "Reunification Palace Saigon Vietnam",
  "west-lake": "West Lake Tay Ho Hanoi sunset",
  "mekong-delta": "Mekong Delta floating market boat Vietnam",
  "con-dao": "Con Dao island clear water Vietnam",
  "phu-quoc": "Phu Quoc island beach Vietnam",
  "ninh-binh": "Tam Coc Ninh Binh limestone boat Vietnam",
  "mai-chau-valley": "Mai Chau valley rice paddy Vietnam",
  "ha-giang": "Ha Giang mountain road loop Vietnam",
  "mui-ne-sand-dunes": "Mui Ne white sand dunes Vietnam",
  "cat-ba": "Cat Ba island bay Vietnam",
  "ly-son-island": "Ly Son island volcanic Vietnam",
  "danang-my-khe": "My Khe beach Da Nang Vietnam",
  "danang-city": "Da Nang dragon bridge Han River Vietnam",
  "long-bien-bridge": "Long Bien Bridge Hanoi sunset train",
  "hanoi-old-quarter": "Hanoi Old Quarter street Vietnam",
  "hanoi-opera-house": "Hanoi Opera House colonial architecture",
  "nha-tho-duc-ba": "Notre Dame Cathedral Saigon red brick",
  "my-son": "My Son Hindu temple ancient Vietnam",
  "vinh-moc-tunnels": "Vinh Moc tunnels Vietnam war underground",
  "dien-bien-phu-battlefield": "Dien Bien Phu battlefield Vietnam history",
  "cao-dai-holy-see": "Cao Dai temple colorful Tay Ninh Vietnam",
  "trang-an-complex": "Trang An boat river limestone Vietnam",
  "mua-cave": "Mua Cave viewpoint Ninh Binh Vietnam",
  "ganh-da-dia": "Ganh Da Dia basalt column Vietnam",
  "bien-ho-t-nuong": "Bien Ho lake Pleiku crater Vietnam",
};

function slugToEnglishHint(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function searchUnsplash(
  placeNameEn: string | null,
  placeName: string,
  slug: string,
  province: string,
  category: string
): Promise<string | null> {
  const hint = categoryHints[category] ?? "Vietnam travel landmark";

  // Priority: 1) slug override, 2) English name, 3) slug words, 4) Vietnamese name
  const queries = [
    slugOverrides[slug],
    placeNameEn ? `${placeNameEn} Vietnam ${hint}` : null,
    `${slugToEnglishHint(slug)} Vietnam`,
    `${placeName} ${province} Vietnam`,
  ].filter(Boolean) as string[];

  for (const query of queries) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "5");
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
    });

    if (res.status === 403 || res.status === 429) {
      const retryAfter = res.headers.get("X-Ratelimit-Reset");
      console.error(`\n⚠️  Rate limit hit (${res.status}). ` +
        (retryAfter ? `Resets at: ${new Date(Number(retryAfter) * 1000).toLocaleTimeString()}` : "") +
        `\nRerun the script later — remaining places were not updated.`
      );
      process.exit(1);
    }

    if (!res.ok) continue;

    const data = await res.json() as {
      results: Array<{ urls: { regular: string }; alt_description: string | null }>;
    };

    if (data.results?.length > 0) {
      return data.results[0].urls.regular + "&w=900&q=80";
    }
  }

  return null;
}

async function main() {
  let query = supabase
    .from("places")
    .select("id, slug, name, name_en, province, category, cover")
    .order("name");

  if (slugFilter) {
    query = query.eq("slug", slugFilter) as typeof query;
  }
  if (batchSize) {
    query = query.limit(batchSize) as typeof query;
  }

  const { data: places, error } = await query;
  if (error) { console.error("DB error:", error.message); process.exit(1); }
  if (!places?.length) { console.log("No places found."); return; }

  const total = places.length;
  console.log(`\n🗺  Updating covers for ${total} place(s)${dryRun ? " [DRY RUN]" : ""}...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const nameEn = (place as { name_en?: string | null }).name_en ?? null;
    const searchLabel = nameEn ?? place.name;

    process.stdout.write(`[${i + 1}/${total}] ${place.slug} — "${searchLabel}"... `);

    const newCover = await searchUnsplash(
      nameEn,
      place.name,
      place.slug,
      place.province,
      place.category
    );

    if (!newCover) {
      console.log("✗ no result");
      skipped++;
    } else {
      console.log("✓ found");
      if (!dryRun) console.log(`   ↳ ${newCover.slice(0, 90)}...`);

      if (!dryRun) {
        const { error: updateErr } = await supabase
          .from("places")
          .update({ cover: newCover })
          .eq("id", place.id);

        if (updateErr) {
          console.log(`  ✗ DB error: ${updateErr.message}`);
          failed++;
        } else {
          updated++;
        }
      } else {
        console.log(`   ↳ ${newCover.slice(0, 90)}...`);
        updated++;
      }
    }

    if (i < places.length - 1) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
    }
  }

  console.log(`\n── Done ──`);
  console.log(`✓ Updated: ${updated} | ✗ Skipped: ${skipped} | ! Failed: ${failed}`);
  if (dryRun) console.log("(Dry run — no DB changes were made)");
}

main().catch(console.error);
