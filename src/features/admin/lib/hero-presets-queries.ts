import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { PRESETS } from "@/config/hero-presets";

export interface HeroImage {
  src: string;
  alt: string;
}

export interface HeroTimeOfDayPreset {
  images: HeroImage[];
  overlay: string;
}

export interface HeroRegionPresets {
  day: HeroTimeOfDayPreset;
  sunset: HeroTimeOfDayPreset;
  night: HeroTimeOfDayPreset;
}

export interface HeroPresetRow {
  id: string;
  region: string;
  label: string;
  match_keywords: string[];
  presets: HeroRegionPresets;
  is_default: boolean;
  enabled: boolean;
  display_order: number;
  updated_at: string;
}

/** All enabled presets — used at runtime by landing hero. */
export async function getHeroPresets(): Promise<HeroPresetRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("hero_presets")
      .select("*")
      .eq("enabled", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as HeroPresetRow[];
  } catch (err) {
    console.error("getHeroPresets failed:", (err as Error).message);
    return [];
  }
}

function normalizeMatch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

/**
 * Resolve which preset.region a given (city, region) tuple maps to,
 * by checking match_keywords. Returns null if no non-default preset matches.
 */
export function resolveRegionKey(
  presets: HeroPresetRow[],
  city: string,
  region: string
): string | null {
  const c = normalizeMatch(city);
  const r = normalizeMatch(region);
  if (!c && !r) return null;
  for (const p of presets) {
    if (p.is_default) continue;
    const hit = p.match_keywords.some((kw) => {
      const nk = normalizeMatch(kw);
      return nk && (c.includes(nk) || r.includes(nk));
    });
    if (hit) return p.region;
  }
  return null;
}

/**
 * Returns the proxied URL for the first day-image of the resolved region preset.
 * Used server-side to emit a <link rel="preload"> so the browser starts fetching
 * the hero image before JS hydrates.
 */
export function getInitialHeroImageUrl(
  presets: HeroPresetRow[],
  initialRegion: string | null
): string | null {
  let rawSrc: string | null = null;

  if (presets.length > 0) {
    const preset =
      (initialRegion && presets.find((p) => p.region === initialRegion)) ||
      presets.find((p) => p.is_default) ||
      presets[0];
    rawSrc = preset?.presets?.day?.images?.[0]?.src ?? null;
  } else {
    // No DB presets — mirror DynamicHeroBackground fallback to hardcoded PRESETS
    const region = initialRegion && PRESETS[initialRegion] ? initialRegion : "default";
    rawSrc = PRESETS[region]?.day?.images?.[0]?.src ?? null;
  }

  if (!rawSrc) return null;
  if (rawSrc.includes("images.unsplash.com")) {
    const base = rawSrc.split("?")[0] ?? rawSrc;
    return `https://wsrv.nl/?url=${encodeURIComponent(base)}&w=1920&q=82&output=webp`;
  }
  return rawSrc;
}

/** All presets (enabled + disabled) — admin only. */
export async function getAllHeroPresetsAdmin(): Promise<HeroPresetRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("hero_presets")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as HeroPresetRow[];
  } catch (err) {
    console.error("getAllHeroPresetsAdmin failed:", (err as Error).message);
    return [];
  }
}
