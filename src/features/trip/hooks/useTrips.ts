"use client";
import { useEffect, useState } from "react";
import {
  addDay as addDayInStore,
  addPlaceToTrip as addPlaceToTripInStore,
  createTrip as createTripInStore,
  deleteTrip as deleteTripInStore,
  getTrip,
  listTrips,
  removeDay as removeDayInStore,
  removePlaceFromTrip as removePlaceFromTripInStore,
  subscribe,
  updateTrip as updateTripInStore,
} from "../lib/storage";
import type { Trip } from "../lib/types";

export interface UseTripsResult {
  trips: Trip[];
  hydrated: boolean;
  create: typeof createTripInStore;
  remove: (id: string) => void;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTrips(listTrips());
    setHydrated(true);
    return subscribe(() => setTrips(listTrips()));
  }, []);

  return { trips, hydrated, create: createTripInStore, remove: deleteTripInStore };
}

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
  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTrip(getTrip(id));
    setHydrated(true);
    return subscribe(() => setTrip(getTrip(id)));
  }, [id]);

  return {
    trip,
    hydrated,
    addPlace: (dayIndex, slug) => addPlaceToTripInStore(id, dayIndex, slug),
    removePlace: (dayIndex, slug) => removePlaceFromTripInStore(id, dayIndex, slug),
    addDay: () => addDayInStore(id),
    removeDay: (dayIndex) => removeDayInStore(id, dayIndex),
    update: (patch) => updateTripInStore(id, patch),
    remove: () => deleteTripInStore(id),
  };
}
