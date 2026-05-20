"use client";
import { useEffect, useState } from "react";
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
  add: (input: Omit<PlaceSubmission, "id" | "createdAt" | "status">) => PlaceSubmission;
  remove: (id: string) => void;
}

export function useSubmissions(): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<PlaceSubmission[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSubmissions(listSubmissions());
    setHydrated(true);
    return subscribe(() => setSubmissions(listSubmissions()));
  }, []);

  return {
    submissions,
    hydrated,
    add: addSubmissionToStore,
    remove: deleteSubmissionFromStore,
  };
}
