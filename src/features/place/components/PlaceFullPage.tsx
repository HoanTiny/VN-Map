"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flag, MapPin, Navigation, Eye, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
  const t = useTranslations("PlaceDetail");
  const locale = useLocale();
  const catLabel = locale === "en" ? cat.label : cat.labelVi;

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
                <Navigation size={16} /> {t("directions")}
              </Button>
              <AddToTripButton slug={place.slug} variant="secondary" size="md" />
              <Link
                href={`/explore?place=${place.slug}`}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-body text-text hover:bg-surface-2"
              >
                <MapPin size={16} /> {t("viewOnMap")}
              </Link>
              <button
                type="button"
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg px-4 text-body-sm text-text-muted hover:bg-surface-2"
              >
                <Flag size={14} /> {t("report")}
              </button>

              {viewers > 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-caption text-text-muted">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  {t("viewersWatching", { count: viewers })}
                </span>
              )}
            </div>
          </Reveal>

          {/* Overview */}
          <Reveal>
            <section>
              <h2 className="font-display text-h2 text-text">{t("intro")}</h2>
              <p className="mt-4 text-body-lg leading-relaxed text-text-muted">
                {place.highlight ? `${place.highlight}. ` : ""}
                {t("introBody", {
                  place: place.name,
                  category: catLabel.toLowerCase(),
                  location: [place.district, place.province].filter(Boolean).join(", "),
                  description: cat.description,
                })}
              </p>
              {/* Editorial / contributor-supplied long description. Phase C added
                 `descriptionEn`; we pick it for EN viewers, else fall back to the
                 placeholder copy from messages. */}
              <p className="mt-3 text-body-lg leading-relaxed text-text-muted whitespace-pre-line">
                {locale === "en" && place.descriptionEn
                  ? place.descriptionEn
                  : t("placeholderDesc")}
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
                <h3 className="font-display text-h3 text-text">{t("location")}</h3>
                <p className="text-body-sm text-text-muted">
                  {[place.address, place.district, place.province].filter(Boolean).join(", ")}
                </p>
                <Link
                  href={`/explore?place=${place.slug}`}
                  className="inline-flex items-center gap-1 text-body-sm text-brand-600 hover:underline"
                >
                  {t("openInLargeMap")} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </Reveal>

          {place.source === "community" && (
            <Reveal>
              <div className="rounded-2xl border border-gold-500/40 bg-gold-50 p-5 text-gold-700">
                <p className="text-overline">{t("communityContrib")}</p>
                <p className="mt-1 text-body">
                  {t.rich("submittedBy", {
                    name: place.submittedBy ?? t("anonymous"),
                    b: (chunks) => <span className="font-medium">{chunks}</span>,
                  })}
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
  const t = useTranslations("PlaceDetail");
  let titleKey: "tipsHeading" | "tipsHeritage" | "tipsNightlife" | "tipsNature" | "tipsCafe" | "tipsFood" = "tipsHeading";
  let tipsKey: "heritageTips" | "nightlifeTips" | "natureTips" | "cafeTips" | "foodTips" | "defaultTips" = "defaultTips";

  switch (category) {
    case "heritage":
      titleKey = "tipsHeritage";
      tipsKey = "heritageTips";
      break;
    case "nightlife":
    case "rooftop":
      titleKey = "tipsNightlife";
      tipsKey = "nightlifeTips";
      break;
    case "nature":
    case "mountain":
      titleKey = "tipsNature";
      tipsKey = "natureTips";
      break;
    case "cafe":
      titleKey = "tipsCafe";
      tipsKey = "cafeTips";
      break;
    case "food":
      titleKey = "tipsFood";
      tipsKey = "foodTips";
      break;
  }

  // tipsKey points to a JSON array — read raw to keep array shape
  const tips = (t.raw(tipsKey) as string[]) ?? [];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
      <h3 className="font-display text-h3 text-text flex items-center gap-2">
        💡 {t(titleKey)}
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
  const t = useTranslations("PlaceDetail");
  const locale = useLocale();
  if (places.length === 0) return null;
  const sidebarPlaces = places.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
      <h3 className="font-display text-h3 text-text flex items-center gap-2">
        {t("nearbyTitle")}
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
                  <span>{locale === "en" ? cat.label : cat.labelVi}</span>
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
          {t("viewAllOnMap")} <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
