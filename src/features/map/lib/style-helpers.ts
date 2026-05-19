import { MAP_STYLE_URL } from "@/lib/constants";
import type { MapStyleKey } from "@/stores/map-store";

export function resolveStyleUrl(
  styleKey: MapStyleKey | null,
  resolved: "light" | "dark"
): string {
  // OpenFreeMap doesn't have a satellite layer — fall back to "bright" (vivid colors)
  if (styleKey === "satellite") return MAP_STYLE_URL.bright;
  if (styleKey === "dark") return MAP_STYLE_URL.dark;
  if (styleKey === "light") return MAP_STYLE_URL.light;
  return resolved === "dark" ? MAP_STYLE_URL.dark : MAP_STYLE_URL.light;
}

// Category colour expression for MapLibre match.
// Travel categories keep their hues; lifestyle adds 6 more for nightlife / cafe / etc.
// Default fallback = flag red (brand).
export const categoryColorExpression = [
  "match",
  ["get", "category"],
  // Travel
  "beach", "#23B5C7",
  "mountain", "#5E8F5A",
  "heritage", "#B8862F",
  "food", "#FF5A3C",
  "city", "#7C6CF0",
  "nature", "#2E9E6B",
  // Lifestyle
  "cafe", "#A47551",
  "nightlife", "#7C3AED",
  "rooftop", "#F59E0B",
  "checkin", "#EC4899",
  "hidden", "#14B8A6",
  "experience", "#6366F1",
  // Fallback (community / unknown)
  "#DA251D",
] as const;
