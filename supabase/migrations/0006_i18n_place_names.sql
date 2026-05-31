-- ────────────────────────────────────────────────────────────────────────────
-- Phase C: bilingual place names
--
-- Adds nullable `name_en`, `description_en`, `highlight_en` columns to both
-- `places` (approved content) and `place_submissions` (pending community
-- contributions). Vietnamese remains the canonical source; English is layered
-- on top via fallback in the query layer (`name_en ?? name`).
--
-- No data backfill — existing rows keep VI only. Editors fill EN over time.
-- Idempotent (uses IF NOT EXISTS) so safe to re-run.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE places
  ADD COLUMN IF NOT EXISTS name_en        TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS highlight_en   TEXT;

ALTER TABLE place_submissions
  ADD COLUMN IF NOT EXISTS name_en        TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Comments for self-documentation in Supabase studio
COMMENT ON COLUMN places.name_en        IS 'English place name (falls back to name when null).';
COMMENT ON COLUMN places.description_en IS 'English long description (falls back to description when null).';
COMMENT ON COLUMN places.highlight_en   IS 'English short highlight excerpt (falls back to highlight when null).';

COMMENT ON COLUMN place_submissions.name_en        IS 'Optional English name supplied by the contributor.';
COMMENT ON COLUMN place_submissions.description_en IS 'Optional English description supplied by the contributor.';
