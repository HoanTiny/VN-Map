import { MapPin, Clock, Tag, Star, Wallet } from "lucide-react";
import { Badge } from "@/ui/badge";
import type { PlaceItem } from "@/features/map/lib/places-data";

export interface PlaceMetaProps {
  place: PlaceItem;
}

const priceLabel: Record<NonNullable<PlaceItem["priceRange"]>, string> = {
  $: "Giá bình dân",
  $$: "Giá trung bình",
  $$$: "Cao cấp",
  $$$$: "Sang trọng",
};

export function PlaceMeta({ place }: PlaceMetaProps) {
  const rows: Array<{ icon: typeof MapPin; label: string; value: React.ReactNode }> = [];

  if (place.address) {
    rows.push({ icon: MapPin, label: "Địa chỉ", value: place.address });
  }
  if (place.openingHours) {
    rows.push({ icon: Clock, label: "Giờ mở cửa", value: place.openingHours });
  }
  if (place.priceRange) {
    rows.push({
      icon: Wallet,
      label: "Khung giá",
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
    label: "Đánh giá",
    value: (
      <span className="inline-flex items-center gap-1.5">
        <Star size={14} className="fill-warning text-warning" />
        <span className="font-medium text-text">{place.rating.toFixed(1)}</span>
        <span className="text-text-muted">({place.reviewCount.toLocaleString("vi-VN")} review)</span>
      </span>
    ),
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <h2 className="font-display text-h3 text-text">Thông tin</h2>
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
            <Tag size={12} /> Đặc trưng
          </div>
          <div className="flex flex-wrap gap-2">
            {place.tags.map((t) => (
              <Badge key={t} variant="outline">
                {t}
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
