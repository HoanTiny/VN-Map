export interface TripDay {
  /** ISO date string (YYYY-MM-DD) — optional, can be just a label. */
  date?: string;
  label: string;             // "Ngày 1", "Ngày 2"…
  placeSlugs: string[];
  note?: string;
  /** Per-place notes keyed by slug. */
  placeNotes?: Record<string, string>;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  cover?: string;            // data URL or external — optional
  /**
   * Primary destinations — province slugs (e.g. ["ha-noi", "quang-ninh"]).
   * When non-empty, per-day place suggestions are filtered/boosted by these.
   */
  destinations: string[];
  days: TripDay[];
  createdAt: number;
  updatedAt: number;
}
