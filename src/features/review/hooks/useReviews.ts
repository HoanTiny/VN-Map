"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { createClient } from "@/lib/supabase/client";
import {
  addReview as addToStore,
  deleteReview as deleteFromStore,
  listReviewsBySlug,
  subscribe,
} from "../lib/storage";
import type { Review, Companion } from "../lib/types";

export interface UseReviewsResult {
  reviews: Review[];
  hydrated: boolean;
  add: (input: Omit<Review, "id" | "createdAt" | "status">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

interface ReviewRow {
  id: string;
  place_slug: string;
  author_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  photos: string[] | null;
  companion: string | null;
  visited_at: string | null;
  status: string;
  created_at: string;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    placeSlug: row.place_slug,
    rating: row.rating as 1 | 2 | 3 | 4 | 5,
    title: row.title ?? undefined,
    body: row.body,
    photos: row.photos ?? undefined,
    companion: (row.companion as Companion) ?? undefined,
    visitedAt: row.visited_at ?? undefined,
    authorName: row.author_name,
    createdAt: new Date(row.created_at).getTime(),
    status: row.status as Review["status"],
  };
}

export function useReviews(slug: string): UseReviewsResult {
  const { user, hydrated: authHydrated, disabled } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const fetchFromDB = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("place_slug", slug)
      .order("created_at", { ascending: false });
    setReviews((data as ReviewRow[] | null ?? []).map(rowToReview));
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!authHydrated) return;

    if (disabled || !user) {
      setReviews(listReviewsBySlug(slug));
      setHydrated(true);
      return subscribe(() => setReviews(listReviewsBySlug(slug)));
    }

    fetchFromDB();
  }, [slug, user?.id, authHydrated, disabled, fetchFromDB]);

  const add = useCallback(
    async (input: Omit<Review, "id" | "createdAt" | "status">) => {
      if (disabled || !user) {
        addToStore(input);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("reviews").insert({
        place_slug: input.placeSlug,
        author_id: user.id,
        author_name: input.authorName,
        rating: input.rating,
        title: input.title ?? null,
        body: input.body,
        photos: input.photos ?? null,
        companion: input.companion ?? null,
        visited_at: input.visitedAt ?? null,
      } as never);

      if (error) throw new Error("Không thể lưu review: " + error.message);
      await fetchFromDB();
    },
    [user, disabled, fetchFromDB]
  );

  const remove = useCallback(
    async (id: string) => {
      if (disabled || !user) {
        deleteFromStore(id);
        return;
      }

      const supabase = createClient();
      await supabase.from("reviews").delete().eq("id", id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    },
    [user, disabled]
  );

  return { reviews, hydrated, add, remove };
}
