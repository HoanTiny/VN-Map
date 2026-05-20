import type { Trip, TripDay } from "./types";

const KEY = "mapvn:trips";
const EVENT = "mapvn:trips:changed";

function readAll(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Backwards compat: trips created before `destinations` was added.
    return parsed.map((t: Trip) =>
      Array.isArray(t.destinations) ? t : { ...t, destinations: [] }
    );
  } catch {
    return [];
  }
}

function writeAll(trips: Trip[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event(EVENT));
}

export function listTrips(): Trip[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getTrip(id: string): Trip | undefined {
  return readAll().find((t) => t.id === id);
}

export function createTrip(input: {
  name: string;
  description?: string;
  numDays: number;
  destinations?: string[];
}): Trip {
  const now = Date.now();
  const days: TripDay[] = Array.from({ length: Math.max(1, input.numDays) }, (_, i) => ({
    label: `Ngày ${i + 1}`,
    placeSlugs: [],
  }));
  const trip: Trip = {
    id: cryptoId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    destinations: input.destinations ?? [],
    days,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([trip, ...readAll()]);
  return trip;
}

export function updateTrip(id: string, patch: Partial<Trip>): Trip | undefined {
  const all = readAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const updated: Trip = { ...all[idx]!, ...patch, id, updatedAt: Date.now() };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export function deleteTrip(id: string) {
  writeAll(readAll().filter((t) => t.id !== id));
}

export function addPlaceToTrip(tripId: string, dayIndex: number, slug: string): Trip | undefined {
  const trip = getTrip(tripId);
  if (!trip) return undefined;
  const days = trip.days.map((d, i) =>
    i === dayIndex && !d.placeSlugs.includes(slug)
      ? { ...d, placeSlugs: [...d.placeSlugs, slug] }
      : d
  );
  return updateTrip(tripId, { days });
}

export function removePlaceFromTrip(
  tripId: string,
  dayIndex: number,
  slug: string
): Trip | undefined {
  const trip = getTrip(tripId);
  if (!trip) return undefined;
  const days = trip.days.map((d, i) =>
    i === dayIndex ? { ...d, placeSlugs: d.placeSlugs.filter((s) => s !== slug) } : d
  );
  return updateTrip(tripId, { days });
}

export function addDay(tripId: string): Trip | undefined {
  const trip = getTrip(tripId);
  if (!trip) return undefined;
  const newDay: TripDay = { label: `Ngày ${trip.days.length + 1}`, placeSlugs: [] };
  return updateTrip(tripId, { days: [...trip.days, newDay] });
}

export function removeDay(tripId: string, dayIndex: number): Trip | undefined {
  const trip = getTrip(tripId);
  if (!trip) return undefined;
  if (trip.days.length <= 1) return trip; // keep at least 1 day
  const days = trip.days
    .filter((_, i) => i !== dayIndex)
    .map((d, i) => ({ ...d, label: `Ngày ${i + 1}` }));
  return updateTrip(tripId, { days });
}

export function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === KEY) onChange();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
