/**
 * Backfill English columns on Supabase `places` via Gemini batch translation.
 *
 * Translates the Vietnamese `name` → `name_en` and `highlight` → `highlight_en`.
 * (The `places` table has no VI long-description column, so `description_en`
 * is left untouched here.)
 *
 * Usage:
 *   pnpm translate:places            # only rows missing EN (name_en OR highlight_en null)
 *   pnpm translate:places --force    # re-translate every row (overwrite existing EN)
 *   pnpm translate:places --dry-run  # print proposed translations, write nothing
 *
 * Requirements (.env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS for the UPDATE)
 *   - GEMINI_API_KEY
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!url || !serviceKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!geminiKey) {
  console.error("Missing env: GEMINI_API_KEY");
  process.exit(1);
}

const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 10;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws as unknown as typeof WebSocket },
});

const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },
});

interface PlaceRow {
  slug: string;
  name: string;
  highlight: string | null;
}

interface Translation {
  slug: string;
  name_en: string;
  highlight_en: string | null;
}

const SYSTEM = `You translate Vietnamese travel-place metadata into natural, concise English for an English-speaking traveller browsing a Vietnam travel map.

Rules:
- Keep proper nouns / brand names intact (e.g. "Cafe Giảng" stays "Cafe Giảng"), but translate generic descriptors ("Chợ Bến Thành" → "Ben Thanh Market", "Hồ Hoàn Kiếm" → "Hoan Kiem Lake").
- "highlight" is a short marketing blurb — translate it naturally and idiomatically, not word-for-word. Keep it roughly the same length, no trailing period unless the source has one.
- If highlight is null/empty, return null for highlight_en.
- Return ONLY a JSON array, one object per input item, preserving slug:
[{ "slug": "...", "name_en": "...", "highlight_en": "..." | null }]`;

async function translateBatch(rows: PlaceRow[]): Promise<Translation[]> {
  const input = rows.map((r) => ({ slug: r.slug, name: r.name, highlight: r.highlight }));
  const prompt = `${SYSTEM}\n\nTranslate these ${rows.length} items:\n${JSON.stringify(input, null, 2)}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(text) as Translation[];
  if (!Array.isArray(parsed)) throw new Error("Gemini did not return an array");
  return parsed;
}

async function main() {
  let query = supabase.from("places").select("slug, name, highlight");
  if (!FORCE) {
    query = query.or("name_en.is.null,highlight_en.is.null");
  }
  const { data: rows, error } = await query.returns<PlaceRow[]>();

  if (error) {
    console.error("Fetch failed:", error);
    process.exit(1);
  }
  if (!rows || rows.length === 0) {
    console.log("✓ Nothing to translate — all places already have EN content.");
    return;
  }

  console.log(
    `Translating ${rows.length} place(s)${FORCE ? " [--force]" : ""}${DRY_RUN ? " [--dry-run]" : ""} in batches of ${BATCH_SIZE}...`
  );

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNo = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    try {
      const translations = await translateBatch(batch);
      const bySlug = new Map(translations.map((t) => [t.slug, t]));

      for (const row of batch) {
        const t = bySlug.get(row.slug);
        if (!t) {
          console.warn(`  ⚠ no translation returned for "${row.slug}"`);
          failed++;
          continue;
        }

        if (DRY_RUN) {
          console.log(`  ${row.slug}`);
          console.log(`    name:      ${row.name}  →  ${t.name_en}`);
          if (row.highlight) console.log(`    highlight: ${row.highlight}  →  ${t.highlight_en}`);
          updated++;
          continue;
        }

        const { error: upErr } = await supabase
          .from("places")
          .update({ name_en: t.name_en, highlight_en: t.highlight_en ?? null })
          .eq("slug", row.slug);

        if (upErr) {
          console.error(`  ✗ update failed for "${row.slug}":`, upErr.message);
          failed++;
        } else {
          updated++;
        }
      }

      console.log(`  batch ${batchNo}/${totalBatches} done (${batch.length} items)`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ✗ batch ${batchNo}/${totalBatches} failed:`, msg);
      failed += batch.length;
    }
  }

  console.log(
    `\n${DRY_RUN ? "Would update" : "✓ Updated"} ${updated} place(s).${failed ? ` ${failed} failed.` : ""}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
