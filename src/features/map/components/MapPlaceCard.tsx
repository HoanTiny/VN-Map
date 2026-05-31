"use client";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Heart, Star, MapPin, Share2, X, Navigation } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { floatingCard } from "@/lib/motion";
import { IconButton } from "@/ui/icon-button";
import { Button } from "@/ui/button";
import { categoryByKey } from "@/config/categories";
import { useMapStore } from "@/stores/map-store";
import { useUIStore } from "@/stores/ui-store";
import { useIsSaved } from "@/features/saved/hooks/useSaved";
import { AddToTripButton } from "@/features/trip/components/AddToTripButton";
import { TripPickAddButton } from "@/features/trip/components/TripPickAddButton";
import { useMapData } from "../context/MapDataContext";

export function MapPlaceCard() {
  const t = useTranslations("Map");
  const selectedId = useMapStore((s) => s.selectedPlaceId);
  const close = useMapStore((s) => s.select);
  const { placesById } = useMapData();
  const place = selectedId ? placesById[selectedId] : null;

  const { saved, toggle: toggleSaved } = useIsSaved(place?.slug ?? "");
  const tripPickContext = useUIStore((s) => s.tripPickContext);

  return (
    <AnimatePresence mode="wait">
      {place && (
        <m.div
          key={place.id}
          variants={floatingCard}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            "group pointer-events-auto w-full max-w-[420px] overflow-hidden rounded-2xl",
            "glass-strong shadow-2xl ring-1 ring-black/10 dark:ring-white/10",
            "hover:ring-brand-500/20 dark:hover:ring-brand-500/30 transition-all duration-500 ease-out"
          )}
          role="dialog"
          aria-label={place.name}
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={place.cover}
              alt={place.name}
              fill
              sizes="420px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

            <div className="absolute left-3 top-3">
              <CategoryChip category={place.category} />
            </div>

            <IconButton
              label={t("close")}
              variant="glass"
              size="sm"
              className="absolute right-3 top-3"
              onClick={() => close(null)}
            >
              <X size={16} />
            </IconButton>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h2 className="font-display text-h2 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {place.name}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-body-sm">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {place.province}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={12} className="fill-warning text-warning" />
                  {place.rating.toFixed(1)}
                  <span className="text-white/70">({formatCount(place.reviewCount)})</span>
                </span>
              </div>
            </div>
          </div>

          {place.highlight && (
            <div className="px-4 pt-3">
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3 text-caption font-medium shadow-sm transition-all duration-300",
                  "bg-gradient-to-r from-brand-500/[0.04] to-gold-500/[0.04] border-brand-500/10 text-brand-800",
                  "dark:from-brand-500/[0.12] dark:to-gold-500/[0.08] dark:border-brand-500/25 dark:text-brand-200"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-gold-500/5 opacity-40 pointer-events-none" />
                <div className="relative flex items-start gap-2 leading-relaxed">
                  <span className="shrink-0 text-body-sm animate-pulse">✨</span>
                  <span className="font-sans text-body-sm select-text font-normal">{place.highlight}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            {tripPickContext ? (
              <TripPickAddButton
                slug={place.slug}
                tripId={tripPickContext.tripId}
                dayIndex={tripPickContext.dayIndex}
                className="flex-1"
              />
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => toggleSaved()}
                  className={cn(
                    "flex-1 font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                    saved
                      ? "bg-brand-50/90 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-200/50 dark:border-brand-500/25 hover:bg-brand-100/90 dark:hover:bg-brand-500/25"
                      : "bg-gradient-to-r from-brand-500 to-rose-500 hover:from-brand-600 hover:to-rose-600 text-white border-none shadow-md shadow-brand-500/15 hover:shadow-lg hover:shadow-brand-500/20"
                  )}
                >
                  <Heart
                    size={14}
                    className={cn(
                      "transition-all duration-300",
                      saved ? "fill-brand-500 text-brand-500 dark:fill-brand-400 dark:text-brand-400" : "text-white"
                    )}
                  />
                  {saved ? t("saved") : t("save")}
                </Button>
                <AddToTripButton
                  slug={place.slug}
                  variant="secondary"
                  size="sm"
                  className="bg-surface-2 dark:bg-white/5 border border-border/80 dark:border-white/10 text-text hover:bg-surface-3 dark:hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
                />
              </>
            )}
            <IconButton
              label={t("share")}
              variant="glass"
              size="sm"
              className="rounded-full bg-surface-2 dark:bg-white/5 border border-border/80 dark:border-white/10 text-text hover:bg-surface-3 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Share2 size={14} />
            </IconButton>
          </div>

          <div className="p-4 pt-1">
            <Link
              href={`/place/${place.slug}`}
              className={cn(
                "group/footer flex items-center justify-between w-full rounded-xl p-3 text-body-sm font-medium transition-all duration-300",
                "bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]",
                "hover:bg-brand-500/[0.04] dark:hover:bg-brand-500/[0.08] hover:border-brand-500/20 dark:hover:border-brand-500/30",
                "text-brand-600 dark:text-brand-300 shadow-sm"
              )}
            >
              <span className="flex items-center gap-2">
                <Navigation
                  size={14}
                  className="text-brand-500 dark:text-brand-400 transition-transform duration-500 ease-out group-hover/footer:rotate-45 group-hover/footer:scale-110"
                />
                <span className="font-sans select-none tracking-wide text-text/80 dark:text-text/90 group-hover/footer:text-brand-600 dark:group-hover/footer:text-brand-300 transition-colors duration-300">
                  {t("viewDetails")}
                </span>
              </span>
              <span className="flex items-center gap-0.5 text-brand-500 dark:text-brand-400 group-hover/footer:translate-x-1 transition-transform duration-300">
                <span className="text-caption font-semibold">{t("explore")}</span>
                <span className="text-[14px]">→</span>
              </span>
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

function CategoryChip({ category }: { category: keyof typeof categoryByKey }) {
  const cat = categoryByKey[category];
  const Icon = cat.icon;
  const locale = useLocale();
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 px-3 py-1 text-caption font-semibold shadow-sm transition-colors duration-300"
      style={{ color: cat.color }}
    >
      <Icon size={12} className="shrink-0" />
      <span>{locale === "en" ? cat.label : cat.labelVi}</span>
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
