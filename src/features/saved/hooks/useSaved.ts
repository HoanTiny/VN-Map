"use client";
import { useEffect, useState } from "react";
import { listSaved, subscribe, toggleSaved as toggleInStore } from "../lib/storage";

export interface UseSavedResult {
  saved: string[];
  hydrated: boolean;
  has: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
}

/** Whole list of saved slugs. Subscribes to changes (same- + cross-tab). */
export function useSaved(): UseSavedResult {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(listSaved());
    setHydrated(true);
    return subscribe(() => setSaved(listSaved()));
  }, []);

  return {
    saved,
    hydrated,
    has: (slug: string) => saved.includes(slug),
    toggle: toggleInStore,
  };
}

/** Single-slug optimized hook — for heart buttons that only care about one place. */
export function useIsSaved(slug: string): {
  saved: boolean;
  hydrated: boolean;
  toggle: () => boolean;
} {
  const { has, toggle, hydrated } = useSaved();
  return {
    saved: has(slug),
    hydrated,
    toggle: () => toggle(slug),
  };
}
