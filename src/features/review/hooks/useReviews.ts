"use client";
import { useEffect, useState } from "react";
import {
  addReview as addReviewToStore,
  deleteReview as deleteReviewFromStore,
  listReviewsBySlug,
  subscribe,
} from "../lib/storage";
import type { Review } from "../lib/types";

export interface UseReviewsResult {
  reviews: Review[];
  hydrated: boolean;
  add: (input: Omit<Review, "id" | "createdAt" | "status">) => Review;
  remove: (id: string) => void;
}

/**
 * Subscribe to all reviews for a given place slug. Reads from localStorage
 * after hydration to avoid SSR mismatch. Auto re-fetches on store events
 * (same-tab) and cross-tab `storage` events.
 */
export function useReviews(slug: string): UseReviewsResult {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReviews(listReviewsBySlug(slug));
    setHydrated(true);
    const unsub = subscribe(() => setReviews(listReviewsBySlug(slug)));
    return unsub;
  }, [slug]);

  const add = (input: Omit<Review, "id" | "createdAt" | "status">) => {
    return addReviewToStore(input);
  };
  const remove = (id: string) => deleteReviewFromStore(id);

  return { reviews, hydrated, add, remove };
}
