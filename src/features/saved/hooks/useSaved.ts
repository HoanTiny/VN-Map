"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { createClient } from "@/lib/supabase/client";
import { listSaved, subscribe, toggleSaved as toggleInStore } from "../lib/storage";

export interface UseSavedResult {
  saved: string[];
  hydrated: boolean;
  has: (slug: string) => boolean;
  /** Optimistic toggle — returns next state synchronously, fires Supabase in bg. */
  toggle: (slug: string) => boolean;
}

export function useSaved(): UseSavedResult {
  const { user, hydrated: authHydrated, disabled } = useSession();
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;

    if (disabled || !user) {
      // No Supabase or signed-out guest → localStorage path.
      setSaved(listSaved());
      setHydrated(true);
      return subscribe(() => setSaved(listSaved()));
    }

    // Signed-in → load from Supabase.
    const supabase = createClient();
    let cancelled = false;
    supabase
      .from("saved_places")
      .select("place_slug")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setSaved((data as { place_slug: string }[] | null)?.map((r) => r.place_slug) ?? []);
        setHydrated(true);
      });

    return () => { cancelled = true; };
  }, [user?.id, authHydrated, disabled]);

  const toggle = useCallback(
    (slug: string): boolean => {
      if (disabled || !user) {
        return toggleInStore(slug);
      }

      // Optimistic update.
      const exists = saved.includes(slug);
      const next = !exists;
      setSaved((prev) =>
        exists ? prev.filter((s) => s !== slug) : [slug, ...prev]
      );

      const supabase = createClient();
      if (exists) {
        supabase
          .from("saved_places")
          .delete()
          .eq("place_slug", slug)
          .then(({ error }) => {
            if (error) setSaved((prev) => [slug, ...prev]); // rollback
          });
      } else {
        supabase
          .from("saved_places")
          .insert({ user_id: user.id, place_slug: slug } as never)
          .then(({ error }) => {
            if (error) setSaved((prev) => prev.filter((s) => s !== slug)); // rollback
          });
      }

      return next;
    },
    [saved, user, disabled]
  );

  return {
    saved,
    hydrated,
    has: (slug: string) => saved.includes(slug),
    toggle,
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
