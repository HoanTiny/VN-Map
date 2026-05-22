import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { TripDay } from "@/features/trip/lib/types";

export type TripSeason =
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "tet"
  | "national_day"
  | "any";

export interface TripTemplate {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover: string;
  duration_days: number;
  season: TripSeason;
  destinations: string[];
  tags: string[];
  days: TripDay[];
  display_order: number;
  created_at: string;
}

export const SEASON_LABEL: Record<TripSeason, string> = {
  spring: "Xuân",
  summer: "Hè",
  autumn: "Thu",
  winter: "Đông",
  tet: "Tết",
  national_day: "Lễ 2/9",
  any: "Quanh năm",
};

export async function listCuratedTrips(limit = 12): Promise<TripTemplate[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("trip_templates")
      .select("*")
      .eq("enabled", true)
      .order("display_order", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as TripTemplate[];
  } catch (err) {
    console.error("listCuratedTrips failed:", (err as Error).message);
    return [];
  }
}

export interface AdminTripTemplateRow extends TripTemplate {
  enabled: boolean;
  updated_at: string;
}

export async function listAllTripTemplatesAdmin(): Promise<AdminTripTemplateRow[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("trip_templates")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as AdminTripTemplateRow[];
  } catch (err) {
    console.error("listAllTripTemplatesAdmin failed:", (err as Error).message);
    return [];
  }
}

export async function getCuratedTrip(slug: string): Promise<TripTemplate | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("trip_templates")
      .select("*")
      .eq("slug", slug)
      .eq("enabled", true)
      .maybeSingle();
    if (error) throw error;
    return (data as TripTemplate | null) ?? null;
  } catch (err) {
    console.error("getCuratedTrip failed:", (err as Error).message);
    return null;
  }
}
