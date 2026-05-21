import { listAllPlaces } from "@/features/place/lib/queries";
import { searchPlacesFromList, type SearchFilters, type SearchResult } from "./search";

/**
 * Async version — fetches the full place list from Supabase (or mock fallback)
 * then applies the same filters. Use this in server components / pages.
 */
export async function searchPlacesAsync(filters: SearchFilters): Promise<SearchResult> {
  const all = await listAllPlaces();
  return searchPlacesFromList(all, filters);
}
