import type { PlaceCardData } from "./components/PlaceCard";
import { listAllPlaces } from "./lib/queries";
import type { PlaceItem } from "@/features/map/lib/places-data";

/**
 * Editorial list of place slugs to feature on the landing rail.
 * Order = display order. Update to curate the homepage.
 *
 * Mix lifestyle + travel — represents the platform's vision.
 */
const FEATURED_SLUGS = [
  "cafe-giang",
  "twilight-sky-bar",
  "snuffbox-saigon",
  "hoi-an",
  "ne-cocktail-bar",
  "hoi-an-lantern-alley",
  "ha-long-bay",
  "pho-bat-dan",
];

function toCard(p: PlaceItem): PlaceCardData {
  return {
    slug: p.slug,
    name: p.name,
    province: p.province,
    category: p.category,
    cover: p.cover,
    rating: p.rating,
    reviewCount: p.reviewCount,
    price: p.priceRange,
    highlight: p.highlight,
  };
}

/** Fetch the 8 editorially-curated featured places for the landing rail. */
export async function getFeaturedPlaces(): Promise<PlaceCardData[]> {
  const all = await listAllPlaces();
  // Preserve the FEATURED_SLUGS order, drop any not found.
  return FEATURED_SLUGS.map((slug) => all.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((p) => toCard(p as PlaceItem));
}
