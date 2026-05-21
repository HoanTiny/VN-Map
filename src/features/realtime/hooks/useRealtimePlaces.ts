"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface NewPlacePayload {
  id: string;
  slug: string;
  name: string;
  lng: number;
  lat: number;
  province: string;
  category: string;
}

export function useRealtimePlaces(onNew: (place: NewPlacePayload) => void) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const channel = supabase
      .channel("places:new")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "places" },
        (payload) => onNew(payload.new as NewPlacePayload)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [onNew]);
}
