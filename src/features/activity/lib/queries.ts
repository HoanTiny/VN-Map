import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type ActivityKind = "place" | "review";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  createdAt: string;
  placeSlug: string;
  placeName: string;
  placeCover?: string;
  province?: string;
  category?: string;
  // Review-only
  rating?: number;
  author?: string;
  body?: string;
}

interface PlaceRow {
  id: string;
  slug: string;
  name: string;
  cover: string;
  province: string;
  category: string;
  created_at: string;
}

interface ReviewRow {
  id: string;
  place_slug: string;
  rating: number;
  body: string;
  author: string;
  created_at: string;
  places?: { name: string; cover: string; province: string } | null;
}

/** Latest mixed activity: recent places + recent reviews, sorted by createdAt desc. */
export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerClient();
    const [placesRes, reviewsRes] = await Promise.all([
      supabase
        .from("places")
        .select("id,slug,name,cover,province,category,created_at")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("reviews")
        .select(
          "id,place_slug,rating,body,author,created_at,places:place_slug(name,cover,province)"
        )
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const items: ActivityItem[] = [];
    if (!placesRes.error && placesRes.data) {
      for (const p of placesRes.data as PlaceRow[]) {
        items.push({
          id: `place-${p.id}`,
          kind: "place",
          createdAt: p.created_at,
          placeSlug: p.slug,
          placeName: p.name,
          placeCover: p.cover,
          province: p.province,
          category: p.category,
        });
      }
    }
    if (!reviewsRes.error && reviewsRes.data) {
      for (const r of reviewsRes.data as unknown as ReviewRow[]) {
        items.push({
          id: `review-${r.id}`,
          kind: "review",
          createdAt: r.created_at,
          placeSlug: r.place_slug,
          placeName: r.places?.name ?? r.place_slug,
          placeCover: r.places?.cover,
          province: r.places?.province,
          rating: Number(r.rating),
          author: r.author,
          body: r.body,
        });
      }
    }

    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return items.slice(0, limit);
  } catch (err) {
    console.error("getRecentActivity failed:", (err as Error).message);
    return [];
  }
}
