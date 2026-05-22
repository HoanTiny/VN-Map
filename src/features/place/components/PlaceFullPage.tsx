"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flag, MapPin, Navigation, Eye, Star } from "lucide-react";
import { Button } from "@/ui/button";
import { Reveal } from "@/components/motion";
import { AddToTripButton } from "@/features/trip/components/AddToTripButton";
import { PlaceHero } from "./PlaceHero";
import { PlaceMeta } from "./PlaceMeta";
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

          {/* Localized Category Tips Card */}
          <Reveal>
            <CategoryTipsCard category={place.category} />
          </Reveal>

          {/* Sidebar Nearby Places Exploration */}
          <Reveal>
            <SidebarNearbyPlaces places={nearby} />
          </Reveal>
        </aside>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Helper Components                             */
/* -------------------------------------------------------------------------- */

function formatReviewCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function CategoryTipsCard({ category }: { category: string }) {
  let tips: string[] = [];
  let title = "Lưu ý hữu ích";
  switch (category) {
    case "heritage":
      title = "Lưu ý văn hóa";
      tips = [
        "Lựa chọn trang phục lịch sự, kín đáo khi tham quan di tích lịch sử.",
        "Nên đi nhẹ nói khẽ, giữ gìn trật tự và tôn trọng không gian tôn nghiêm.",
        "Chuẩn bị sẵn tiền mặt nhỏ để mua vé tham quan hoặc đóng góp.",
      ];
      break;
    case "nightlife":
    case "rooftop":
      title = "Mẹo trải nghiệm";
      tips = [
        "Nên liên hệ đặt bàn trước vào cuối tuần để có vị trí ngồi đẹp nhất.",
        "Mang theo giấy tờ tùy thân (CCCD/Hộ chiếu) để kiểm tra độ tuổi.",
        "Quy định trang phục (dress code) thường là lịch thiệp, tránh đi dép lê.",
      ];
      break;
    case "nature":
    case "mountain":
      title = "Mẹo an toàn & Chuẩn bị";
      tips = [
        "Chuẩn bị giày đi bộ dã ngoại chuyên dụng có độ bám tốt.",
        "Mang theo bình nước cá nhân, kem chống nắng và thuốc xịt côn trùng.",
        "Luôn chú ý theo dõi dự báo thời tiết trước khi khởi hành.",
      ];
      break;
    case "cafe":
      title = "Mẹo ghé quán";
      tips = [
        "Khung giờ hoàng hôn hoặc sáng sớm thường có ánh sáng đẹp nhất để chụp ảnh.",
        "Nên thử món đặc trưng (signature) được gợi ý bởi menu.",
        "Nhiều quán trong ngõ hẻm sẽ có chỗ gửi xe máy giới hạn, vui lòng hỏi nhân viên.",
      ];
      break;
    case "food":
      title = "Mẹo thưởng thức";
      tips = [
        "Nên ghé sớm trước giờ cao điểm để tránh phải xếp hàng chờ đợi lâu.",
        "Hầu hết các quán ăn địa phương ưu tiên thanh toán bằng tiền mặt hoặc chuyển khoản nhanh.",
        "Thử trải nghiệm hương vị nguyên bản trước khi thêm các gia vị ăn kèm.",
      ];
      break;
    default:
      tips = [
        "Nên chuẩn bị sẵn bản đồ offline hoặc định vị GPS khi di chuyển.",
        "Bảo vệ môi trường, không xả rác bừa bãi tại điểm đến.",
        "Tham khảo ý kiến người dân bản địa nếu bạn cần hỗ trợ tìm đường.",
      ];
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
      <h3 className="font-display text-h3 text-text flex items-center gap-2">
        💡 {title}
      </h3>
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <li key={idx} className="text-body-sm text-text-muted flex items-start gap-2 leading-relaxed">
            <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarNearbyPlaces({ places }: { places: PlaceItem[] }) {
  if (places.length === 0) return null;
  const sidebarPlaces = places.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
      <h3 className="font-display text-h3 text-text flex items-center gap-2">
        📍 Khám phá gần đây
      </h3>
      <div className="space-y-3">
        {sidebarPlaces.map((p) => {
          const cat = categoryByKey[p.category];
          const CatIcon = cat.icon;
          return (
            <Link
              key={p.slug}
              href={`/place/${p.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-surface hover:bg-surface-2 transition-colors duration-200 group"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-surface-2 shrink-0">
                <Image
                  src={p.cover}
                  alt={p.name}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-slow group-hover:scale-105"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-caption font-medium" style={{ color: cat.color }}>
                  <CatIcon size={10} />
                  <span>{cat.labelVi}</span>
                </div>
                <h4 className="font-display text-body-sm font-bold text-text truncate mt-0.5 group-hover:text-brand-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-[10px] text-text-muted truncate">
                  {p.province}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end pl-1">
                <div className="flex items-center gap-0.5 text-body-sm font-semibold text-text">
                  <Star size={12} className="fill-warning text-warning shrink-0" />
                  <span>{p.rating.toFixed(1)}</span>
                </div>
                <span className="text-[9px] text-text-subtle">({formatReviewCount(p.reviewCount)})</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="pt-1 text-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-body-sm font-semibold text-brand-600 hover:underline"
        >
          Xem tất cả trên bản đồ <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
