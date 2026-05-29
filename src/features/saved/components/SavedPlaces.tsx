"use client";
import Link from "next/link";
import { Heart, Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { PlaceGrid, PlaceGridSkeleton } from "@/features/place/components/PlaceGrid";
import { useSaved } from "../hooks/useSaved";
import { allPlaces } from "@/features/map/lib/places-data";

export function SavedPlaces() {
  const { saved, hydrated } = useSaved();
  const t = useTranslations("SavedPage");

  // Preserve insertion order (saved[] is newest-first).
  const savedPlaces = saved
    .map((slug) => allPlaces.find((p) => p.slug === slug))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof allPlaces.find>>>;

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <Reveal>
          <p className="text-overline text-brand-600">{t("overline")}</p>
          <h1 className="mt-2 font-display text-display-lg text-text">{t("title")}</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            {hydrated
              ? savedPlaces.length === 0
                ? t("empty")
                : t("count", { count: savedPlaces.length })
              : t("loading")}
          </p>
        </Reveal>

        <div className="mt-8">
          {!hydrated ? (
            <PlaceGridSkeleton count={6} />
          ) : savedPlaces.length === 0 ? (
            <EmptyState />
          ) : (
            <PlaceGrid places={savedPlaces} />
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  const t = useTranslations("SavedPage");
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Heart size={20} />
      </div>
      <p className="font-display text-h3 text-text">{t("emptyHeadline")}</p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">{t("emptyHint")}</p>
      <Button className="mt-4" asChild>
        <Link href="/explore">
          <Map size={16} /> {t("emptyCta")}
        </Link>
      </Button>
    </div>
  );
}
