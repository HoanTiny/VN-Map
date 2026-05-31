"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface NewPlacePayload {
  id: string;
  slug: string;
  name: string;
  name_en: string | null;
  lng: number;
  lat: number;
  province: string;
  category: string;
}

export function useRealtimePlaces(onNew: (place: NewPlacePayload) => void) {
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const channel = supabase
      .channel("places:new")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "places" },
        (payload) => onNewRef.current(payload.new as NewPlacePayload)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
