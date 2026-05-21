"use client";
import Link from "next/link";
import { ArrowRight, Flag, MapPin, Navigation, Eye } from "lucide-react";
import { Button } from "@/ui/button";
import { Reveal } from "@/components/motion";
import { AddToTripButton } from "@/features/trip/components/AddToTripButton";
import { PlaceHero } from "./PlaceHero";
import { PlaceMeta } from "./PlaceMeta";
import { NearbyPlaces } from "./NearbyPlaces";
import { ReviewList } from "@/features/review/components/ReviewList";
import { categoryByKey } from "@/config/categories";
import { usePresence } from "@/features/realtime/hooks/usePresence";
import type { PlaceItem } from "@/features/map/lib/places-data";

export interface PlaceFullPageProps {
  place: PlaceItem;
  nearby: PlaceItem[];
}

export function PlaceFullPage({ place, nearby }: PlaceFullPageProps) {
  const cat = categoryByKey[place.category];
  const viewers = usePresence(`place:${place.slug}`);

  return (
    <article className="pb-24">
      <PlaceHero place={place} />

      <div className="container mt-8 grid grid-cols-1 gap-10 md:mt-12 lg:grid-cols-12">
        {/* Left column: meta + description + reviews placeholder */}
        <div className="space-y-10 lg:col-span-8">
          {/* Quick actions sticky on desktop */}
          <Reveal>
            <div className="flex flex-wrap gap-2">
              <Button size="md">
                <Navigation size={16} /> Chỉ đường
              </Button>
              <AddToTripButton slug={place.slug} variant="secondary" size="md" />
              <Link
                href={`/explore?place=${place.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-body text-text hover:bg-surface-2"
              >
                <MapPin size={16} /> Xem trên bản đồ
              </Link>
              <button
                type="button"
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-4 text-body-sm text-text-muted hover:bg-surface-2"
              >
                <Flag size={14} /> Báo cáo
              </button>

              {viewers > 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-caption text-text-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {viewers} người đang xem
                </span>
              )}
            </div>
          </Reveal>

          {/* Overview */}
          <Reveal>
            <section>
              <h2 className="font-display text-h2 text-text">Giới thiệu</h2>
              <p className="mt-4 text-body-lg leading-relaxed text-text-muted">
                {place.highlight ? `${place.highlight}. ` : ""}
                {place.name} là một địa điểm {cat.labelVi.toLowerCase()} nổi bật tại{" "}
                {place.district ? `${place.district}, ` : ""}
                {place.province}. {cat.description}.
              </p>
              <p className="mt-3 text-body-lg leading-relaxed text-text-muted">
                Đây là phần mô tả mẫu — sẽ thay bằng nội dung do biên tập viên / cộng đồng
                đóng góp ở phase tiếp theo. Nội dung có thể bao gồm lịch sử, mẹo ghé thăm,
                lưu ý mùa vụ, gợi ý món đặc trưng (với food/cafe), thời điểm đẹp nhất để
                chụp ảnh (với check-in), và những trải nghiệm liên quan.
              </p>
            </section>
          </Reveal>

          {/* Meta info */}
          <Reveal>
            <PlaceMeta place={place} />
          </Reveal>

          {/* Reviews — localStorage-backed Phase 1 */}
          <Reveal>
            <ReviewList
              placeSlug={place.slug}
              placeName={place.name}
              baseline={{ rating: place.rating, count: place.reviewCount }}
            />
          </Reveal>
        </div>

        {/* Right column: location + mini info */}
        <aside className="space-y-6 lg:col-span-4">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[4/3] bg-surface-2">
                {/* Mini map placeholder — open full explore */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md"
                      style={{ backgroundColor: cat.color }}
                    >
                      <MapPin size={20} />
                    </div>
                    <p className="text-body-sm text-text-muted">
                      {place.coordinates[1].toFixed(4)}°, {place.coordinates[0].toFixed(4)}°
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-display text-h3 text-text">Vị trí</h3>
                <p className="text-body-sm text-text-muted">
                  {[place.address, place.district, place.province].filter(Boolean).join(", ")}
                </p>
                <Link
                  href={`/explore?place=${place.slug}`}
                  className="inline-flex items-center gap-1 text-body-sm text-brand-600 hover:underline"
                >
                  Mở trong bản đồ lớn <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Reveal>

          {place.source === "community" && (
            <Reveal>
              <div className="rounded-2xl border border-gold-500/40 bg-gold-50 p-5 text-gold-700">
                <p className="text-overline">CỘNG ĐỒNG ĐÓNG GÓP</p>
                <p className="mt-1 text-body">
                  Được đề xuất bởi{" "}
                  <span className="font-medium">{place.submittedBy ?? "ẩn danh"}</span>
                </p>
              </div>
            </Reveal>
          )}
        </aside>
      </div>

      {/* Nearby */}
      <div className="container mt-16">
        <Reveal>
          <NearbyPlaces places={nearby} />
        </Reveal>
      </div>
    </article>
  );
}
