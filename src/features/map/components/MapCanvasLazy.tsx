"use client";
import dynamic from "next/dynamic";
import type { PlacesFC } from "../lib/places-data";

export interface MapExperienceLazyProps {
  /** GeoJSON for the map source. Server pages should fetch + pass via prop. */
  data?: PlacesFC;
}

export const MapExperienceLazy = dynamic<MapExperienceLazyProps>(
  () => import("./MapExperience").then((m) => m.MapExperience),
  {
    ssr: false,
    loading: () => <div className="h-full w-full skeleton" />,
  }
);
