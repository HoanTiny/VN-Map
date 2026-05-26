import { getTranslations } from "next-intl/server";
import { MapExperienceLazy } from "@/features/map/components/MapCanvasLazy";
import { getPlacesGeoJSON } from "@/features/place/lib/queries";

export async function generateMetadata() {
  const t = await getTranslations("Explore");
  return { title: t("metaTitle") };
}

export default async function ExplorePage() {
  // Fetch place GeoJSON server-side (Supabase when configured, mock fallback).
  // Map source receives it as prop — no client-side initial fetch needed.
  const data = await getPlacesGeoJSON();

  return (
    <div className="relative h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-4rem)]">
      <MapExperienceLazy data={data} />
    </div>
  );
}
