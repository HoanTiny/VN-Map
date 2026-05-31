import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PlaceCard, type PlaceCardData } from "./PlaceCard";
import { type PlaceItem } from "@/features/map/lib/places-data";

export interface NearbyPlacesProps {
  places: PlaceItem[];
}

function toCard(p: PlaceItem): PlaceCardData {
  return {
    slug: p.slug,
    name: p.name,
    province: p.province,
    category: p.category,
    cover: p.cover,
    rating: p.rating,
    reviewCount: p.reviewCount,
    highlight: p.highlight,
    price: p.priceRange,
  };
}

export async function NearbyPlaces({ places }: NearbyPlacesProps) {
  if (places.length === 0) return null;
  const [t, tc] = await Promise.all([
    getTranslations("PlaceDetail"),
    getTranslations("Common"),
  ]);

  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-overline text-brand-600">{t("nearbySectionOverline")}</p>
          <h2 className="mt-1 font-display text-h2 text-text">{t("nearbySectionTitle")}</h2>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-body-sm text-brand-600 hover:underline"
        >
          {tc("viewOnMap")} <ArrowRight size={14} />
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((p) => (
          <PlaceCard key={p.slug} place={toCard(p)} className="h-full" />
        ))}
      </div>
    </section>
  );
}
