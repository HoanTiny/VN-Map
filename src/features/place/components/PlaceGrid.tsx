"use client";
import { useTranslations } from "next-intl";
import { PlaceCard, type PlaceCardData } from "./PlaceCard";
import { Stagger, StaggerItem } from "@/components/motion";
import { Skeleton } from "@/ui/skeleton";
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
  const t = useTranslations("Place");
  if (places.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-display text-h3 text-text">{t("gridEmptyTitle")}</p>
        <p className="mt-1 text-body-sm text-text-muted">{t("gridEmptyHint")}</p>
      </div>
    );
  }

  return (
    <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {places.map((p) => (
        <StaggerItem key={p.slug} className="h-full">
          <PlaceCard place={toPlaceCard(p)} className="h-full" />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function PlaceGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
