import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlaceCard, type PlaceCardData } from "./PlaceCard";
import { getNearbyPlaces, type PlaceItem } from "@/features/map/lib/places-data";

export interface NearbyPlacesProps {
  slug: string;
  radiusKm?: number;
  limit?: number;
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

export function NearbyPlaces({ slug, radiusKm = 50, limit = 6 }: NearbyPlacesProps) {
  const nearby = getNearbyPlaces(slug, { radiusKm, limit });
  if (nearby.length === 0) return null;

  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-overline text-brand-600">XUNG QUANH</p>
          <h2 className="mt-1 font-display text-h2 text-text">Địa điểm gần đây</h2>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-body-sm text-brand-600 hover:underline"
        >
          Xem trên bản đồ <ArrowRight size={14} />
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {nearby.map((p) => (
          <PlaceCard key={p.slug} place={toCard(p)} />
        ))}
      </div>
    </section>
  );
}
