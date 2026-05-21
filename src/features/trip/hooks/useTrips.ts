"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { createClient } from "@/lib/supabase/client";
import {
  addDay as addDayInStore,
  addPlaceToTrip as addPlaceToTripInStore,
  createTrip as createTripInStore,
  deleteTrip as deleteTripInStore,
  getTrip as getTripFromStore,
  listTrips,
  removeDay as removeDayInStore,
  removePlaceFromTrip as removePlaceFromTripInStore,
  subscribe,
  updateTrip as updateTripInStore,
} from "../lib/storage";
import type { Trip, TripDay } from "../lib/types";

interface TripRow {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cover: string | null;
  destinations: string[];
  days: TripDay[];
  created_at: string;
  updated_at: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    cover: row.cover ?? undefined,
    destinations: row.destinations ?? [],
    days: row.days ?? [],
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

// ─── useTrips ────────────────────────────────────────────────────────────────

export interface UseTripsResult {
  trips: Trip[];
  hydrated: boolean;
  create: (input: {
    name: string;
    description?: string;
    numDays: number;
    destinations?: string[];
  }) => Promise<Trip>;
  remove: (id: string) => void;
  /** Add a place to a specific trip day — used by AddToTripButton. */
  addPlaceToDay: (tripId: string, dayIndex: number, slug: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

export function useTrips(): UseTripsResult {
  const { user, hydrated: authHydrated, disabled } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("updated_at", { ascending: false });
    setTrips((data as TripRow[] | null ?? []).map(rowToTrip));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!authHydrated) return;

    if (disabled || !user) {
      setTrips(listTrips());
      setHydrated(true);
      return subscribe(() => setTrips(listTrips()));
    }

    fetchAll();
  }, [user?.id, authHydrated, disabled, fetchAll]);

  const create = useCallback(
    async (input: { name: string; description?: string; numDays: number; destinations?: string[] }): Promise<Trip> => {
      if (disabled || !user) {
        return createTripInStore(input);
      }

      const days: TripDay[] = Array.from({ length: Math.max(1, input.numDays) }, (_, i) => ({
        label: `Ngày ${i + 1}`,
        placeSlugs: [],
      }));

      const supabase = createClient();
      const { data, error } = await supabase
        .from("trips")
        .insert({
          owner_id: user.id,
          name: input.name.trim(),
          description: input.description?.trim() ?? null,
          destinations: input.destinations ?? [],
          days,
        } as never)
        .select()
        .single();

      if (error || !data) throw new Error("Không thể tạo chuyến đi: " + (error?.message ?? ""));
      const trip = rowToTrip(data as TripRow);
      setTrips((prev) => [trip, ...prev]);
      return trip;
    },
    [user, disabled]
  );

  const remove = useCallback(
    (id: string) => {
      if (disabled || !user) {
        deleteTripInStore(id);
        return;
      }
      setTrips((prev) => prev.filter((t) => t.id !== id));
      const supabase = createClient();
      supabase.from("trips").delete().eq("id", id);
    },
    [user, disabled]
  );

  const addPlaceToDay = useCallback(
    (tripId: string, dayIndex: number, slug: string) => {
      if (disabled || !user) {
        addPlaceToTripInStore(tripId, dayIndex, slug);
        return;
      }
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id !== tripId) return t;
          const days = t.days.map((d, i) =>
            i === dayIndex && !d.placeSlugs.includes(slug)
              ? { ...d, placeSlugs: [...d.placeSlugs, slug] }
              : d
          );
          const updated = { ...t, days, updatedAt: Date.now() };
          const supabase = createClient();
          supabase.from("trips").update({ days, updated_at: new Date().toISOString() } as never).eq("id", tripId);
          return updated;
        })
      );
    },
    [user, disabled]
  );

  const getTripById = useCallback(
    (id: string) => trips.find((t) => t.id === id),
    [trips]
  );

  return { trips, hydrated, create, remove, addPlaceToDay, getTripById };
}

// ─── useTrip ─────────────────────────────────────────────────────────────────

export interface UseTripResult {
  trip: Trip | undefined;
  hydrated: boolean;
  addPlace: (dayIndex: number, slug: string) => void;
  removePlace: (dayIndex: number, slug: string) => void;
  addDay: () => void;
  removeDay: (dayIndex: number) => void;
  update: (patch: Partial<Trip>) => void;
  remove: () => void;
}

export function useTrip(id: string): UseTripResult {
  const { user, hydrated: authHydrated, disabled } = useSession();
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  const fetchOne = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single();
    setTrip(data ? rowToTrip(data as TripRow) : undefined);
    setHydrated(true);
  }, [id]);

  useEffect(() => {
    if (!authHydrated) return;

    if (disabled || !user) {
      setTrip(getTripFromStore(id));
      setHydrated(true);
      return subscribe(() => setTrip(getTripFromStore(id)));
    }

    fetchOne();
  }, [id, user?.id, authHydrated, disabled, fetchOne]);

  // Helper: apply a days mutation optimistically + sync to DB.
  const mutateDays = useCallback(
    (computeDays: (current: TripDay[]) => TripDay[]) => {
      if (disabled || !user) return; // localStorage path uses store fns directly
      setTrip((prev) => {
        if (!prev) return prev;
        const days = computeDays(prev.days);
        const updated = { ...prev, days, updatedAt: Date.now() };
        const supabase = createClient();
        supabase
          .from("trips")
          .update({ days, updated_at: new Date().toISOString() } as never)
          .eq("id", id);
        return updated;
      });
    },
    [id, user, disabled]
  );

  const addPlace = useCallback(
    (dayIndex: number, slug: string) => {
      if (disabled || !user) { addPlaceToTripInStore(id, dayIndex, slug); return; }
      mutateDays((days) =>
        days.map((d, i) =>
          i === dayIndex && !d.placeSlugs.includes(slug)
            ? { ...d, placeSlugs: [...d.placeSlugs, slug] }
            : d
        )
      );
    },
    [id, mutateDays, user, disabled]
  );

  const removePlace = useCallback(
    (dayIndex: number, slug: string) => {
      if (disabled || !user) { removePlaceFromTripInStore(id, dayIndex, slug); return; }
      mutateDays((days) =>
        days.map((d, i) =>
          i === dayIndex ? { ...d, placeSlugs: d.placeSlugs.filter((s) => s !== slug) } : d
        )
      );
    },
    [id, mutateDays, user, disabled]
  );

  const addDay = useCallback(() => {
    if (disabled || !user) { addDayInStore(id); return; }
    mutateDays((days) => [
      ...days,
      { label: `Ngày ${days.length + 1}`, placeSlugs: [] },
    ]);
  }, [id, mutateDays, user, disabled]);

  const removeDay = useCallback(
    (dayIndex: number) => {
      if (disabled || !user) { removeDayInStore(id, dayIndex); return; }
      mutateDays((days) => {
        if (days.length <= 1) return days;
        return days
          .filter((_, i) => i !== dayIndex)
          .map((d, i) => ({ ...d, label: `Ngày ${i + 1}` }));
      });
    },
    [id, mutateDays, user, disabled]
  );

  const update = useCallback(
    (patch: Partial<Trip>) => {
      if (disabled || !user) { updateTripInStore(id, patch); return; }
      setTrip((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...patch, id, updatedAt: Date.now() };
        const supabase = createClient();
        supabase
          .from("trips")
          .update({
            name: updated.name,
            description: updated.description ?? null,
            destinations: updated.destinations,
            days: updated.days,
            updated_at: new Date().toISOString(),
          } as never)
          .eq("id", id);
        return updated;
      });
    },
    [id, user, disabled]
  );

  const remove = useCallback(() => {
    if (disabled || !user) { deleteTripInStore(id); return; }
    const supabase = createClient();
    supabase.from("trips").delete().eq("id", id);
    setTrip(undefined);
  }, [id, user, disabled]);

  return { trip, hydrated, addPlace, removePlace, addDay, removeDay, update, remove };
}
