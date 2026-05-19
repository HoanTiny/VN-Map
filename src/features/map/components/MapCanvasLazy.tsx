"use client";
import dynamic from "next/dynamic";

export const MapExperienceLazy = dynamic(
  () => import("./MapExperience").then((m) => m.MapExperience),
  {
    ssr: false,
    loading: () => <div className="h-full w-full skeleton" />,
  }
);
