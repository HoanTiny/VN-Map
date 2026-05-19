import { allPlaces, type PlaceItem } from "@/features/map/lib/places-data";
import type { CategoryKey } from "@/config/categories";

/** Strip Vietnamese diacritics for case/accent-insensitive matching. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

export interface SearchFilters {
  q?: string;
  cat?: CategoryKey;
  province?: string; // province slug (slugified name)
  sort?: "rating" | "reviews" | "name";
}

export interface SearchResult {
  items: PlaceItem[];
  total: number;
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function searchPlaces(filters: SearchFilters): SearchResult {
  let items = allPlaces.slice();
  const q = filters.q ? normalize(filters.q) : "";

  if (q) {
    items = items.filter((p) => {
      const haystack = normalize(
        `${p.name} ${p.province} ${p.district ?? ""} ${p.address ?? ""} ${
          (p.tags ?? []).join(" ")
        } ${p.highlight ?? ""}`
      );
      return haystack.includes(q);
    });
  }

  if (filters.cat) {
    items = items.filter((p) => p.category === filters.cat);
  }

  if (filters.province) {
    items = items.filter((p) => slugify(p.province) === filters.province);
  }

  switch (filters.sort ?? "rating") {
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "reviews":
      items.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "name":
      items.sort((a, b) => a.name.localeCompare(b.name, "vi"));
      break;
  }

  return { items, total: items.length };
}
