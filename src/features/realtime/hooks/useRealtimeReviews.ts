"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface ReviewRow {
  id: string;
  place_slug: string;
  rating: number;
  body: string;
  author: string;
  visited_at: string | null;
  photos: string[] | null;
  created_at: string;
}

export function useRealtimeReviews(
  placeSlug: string,
  onNew: (review: ReviewRow) => void
) {
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`reviews:${placeSlug}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `place_slug=eq.${placeSlug}`,
        },
        (payload) => onNewRef.current(payload.new as ReviewRow)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [placeSlug]);
}
