"use client";
import { MapPin, Clock, Tag, Star, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/ui/badge";
import type { PlaceItem } from "@/features/map/lib/places-data";

export interface PlaceMetaProps {
  place: PlaceItem;
}

export function PlaceMeta({ place }: PlaceMetaProps) {
  const t = useTranslations("Place");
  const priceLabel: Record<NonNullable<PlaceItem["priceRange"]>, string> = {
    $: t("priceCheap"),
    $$: t("priceMid"),
    $$$: t("priceHigh"),
    $$$$: t("priceLux"),
  };

  const rows: Array<{ icon: typeof MapPin; label: string; value: React.ReactNode }> = [];

  if (place.address) {
    rows.push({ icon: MapPin, label: t("address"), value: place.address });
  }
  if (place.openingHours) {
    rows.push({ icon: Clock, label: t("hours"), value: place.openingHours });
  }
  if (place.priceRange) {
    rows.push({
      icon: Wallet,
      label: t("priceRange"),
      value: (
        <span className="inline-flex items-center gap-2">
          <span className="font-mono text-text">{place.priceRange}</span>
          <span className="text-text-muted">{priceLabel[place.priceRange]}</span>
        </span>
      ),
    });
  }
  rows.push({
    icon: Star,
    label: t("rating"),
    value: (
      <span className="inline-flex items-center gap-1.5">
        <Star size={14} className="fill-warning text-warning" />
        <span className="font-medium text-text">{place.rating.toFixed(1)}</span>
        <span className="text-text-muted">({t("reviewSuffix", { count: place.reviewCount })})</span>
      </span>
    ),
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <h2 className="font-display text-h3 text-text">{t("infoTitle")}</h2>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted">
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <dt className="text-overline text-text-subtle">{label}</dt>
              <dd className="text-body text-text">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {place.tags && place.tags.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <div className="mb-2 flex items-center gap-1.5 text-overline text-text-subtle">
            <Tag size={12} /> {t("tagsLabel")}
          </div>
          <div className="flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {place.highlight && (
        <div className="mt-5 rounded-xl bg-brand-50 p-4">
          <p className="text-body text-brand-700">✨ {place.highlight}</p>
        </div>
      )}
    </div>
  );
}
