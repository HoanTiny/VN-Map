import { PlaceCard, type PlaceCardData } from "./PlaceCard";
import { Stagger, StaggerItem } from "@/components/motion";
import type { PlaceItem } from "@/features/map/lib/places-data";

export function toPlaceCard(p: PlaceItem): PlaceCardData {
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

export function PlaceGrid({ places }: { places: PlaceItem[] }) {
  if (places.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-h3 text-text">Chưa có địa điểm</p>
        <p className="mt-1 text-body-sm text-text-muted">
          Thử bỏ bớt filter hoặc đóng góp địa điểm đầu tiên.
        </p>
      </div>
    );
  }

  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {places.map((p) => (
        <StaggerItem key={p.slug}>
          <PlaceCard place={toPlaceCard(p)} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
