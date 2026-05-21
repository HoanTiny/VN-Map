"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { createClient } from "@/lib/supabase/client";
import {
  addSubmission as addSubmissionToStore,
  deleteSubmission as deleteSubmissionFromStore,
  listSubmissions,
  subscribe,
} from "../lib/storage";
import type { PlaceSubmission } from "../lib/types";

export interface UseSubmissionsResult {
  submissions: PlaceSubmission[];
  hydrated: boolean;
  add: (input: Omit<PlaceSubmission, "id" | "createdAt" | "status">) => Promise<void>;
  remove: (id: string) => void;
}

interface SubmissionRow {
  id: string;
  name: string;
  category: string;
  province: string;
  province_slug: string;
  district: string | null;
  address: string | null;
  description: string;
  lng: number;
  lat: number;
  price_range: string | null;
  opening_hours: string | null;
  tags: string[] | null;
  photos: string[] | null;
  submitted_by: string;
  submitter_id: string | null;
  status: string;
  created_at: string;
}

function rowToSubmission(row: SubmissionRow): PlaceSubmission {
  return {
    id: row.id,
    name: row.name,
    category: row.category as PlaceSubmission["category"],
    province: row.province,
    provinceSlug: row.province_slug,
    district: row.district ?? undefined,
    address: row.address ?? undefined,
    description: row.description,
    lng: Number(row.lng),
    lat: Number(row.lat),
    priceRange: (row.price_range as PlaceSubmission["priceRange"]) ?? undefined,
    openingHours: row.opening_hours ?? undefined,
    tags: row.tags ?? undefined,
    photos: row.photos ?? undefined,
    submittedBy: row.submitted_by,
    createdAt: new Date(row.created_at).getTime(),
    status: row.status as PlaceSubmission["status"],
  };
}

export function useSubmissions(): UseSubmissionsResult {
  const { user, hydrated: authHydrated, disabled } = useSession();
  const [submissions, setSubmissions] = useState<PlaceSubmission[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;

    if (disabled || !user) {
      setSubmissions(listSubmissions());
      setHydrated(true);
      return subscribe(() => setSubmissions(listSubmissions()));
    }

    const supabase = createClient();
    let cancelled = false;
    supabase
      .from("place_submissions")
      .select("*")
      .eq("submitter_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setSubmissions((data as SubmissionRow[] | null ?? []).map(rowToSubmission));
        setHydrated(true);
      });

    return () => { cancelled = true; };
  }, [user?.id, authHydrated, disabled]);

  const add = useCallback(
    async (input: Omit<PlaceSubmission, "id" | "createdAt" | "status">) => {
      if (disabled || !user) {
        addSubmissionToStore(input);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("place_submissions")
        .insert({
          name: input.name,
          category: input.category,
          province: input.province,
          province_slug: input.provinceSlug,
          district: input.district ?? null,
          address: input.address ?? null,
          description: input.description,
          location: `POINT(${input.lng} ${input.lat})`,
          price_range: input.priceRange ?? null,
          opening_hours: input.openingHours ?? null,
          tags: input.tags ?? null,
          photos: input.photos ?? null,
          submitted_by: input.submittedBy,
          submitter_id: user.id,
        } as never)
        .select()
        .single();

      if (error || !data) throw new Error("Không thể gửi đề xuất: " + (error?.message ?? ""));
      setSubmissions((prev) => [rowToSubmission(data as SubmissionRow), ...prev]);
    },
    [user, disabled]
  );

  const remove = useCallback(
    (id: string) => {
      if (disabled || !user) {
        deleteSubmissionFromStore(id);
        return;
      }
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      const supabase = createClient();
      supabase.from("place_submissions").delete().eq("id", id);
    },
    [user, disabled]
  );

  return { submissions, hydrated, add, remove };
}
