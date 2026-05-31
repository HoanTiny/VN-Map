import { getLocale, getTranslations } from "next-intl/server";
import { MapExperienceLazy } from "@/features/map/components/MapCanvasLazy";
import { getPlacesGeoJSON } from "@/features/place/lib/queries";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("Explore"), getLocale()]);
  return { title: t("metaTitle"), alternates: localizedAlternates("/explore", locale) };
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
