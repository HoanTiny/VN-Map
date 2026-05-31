"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { allPlaces } from "@/features/map/lib/places-data";
import type { Trip } from "../lib/types";

export function TripCard({ trip }: { trip: Trip }) {
  const t = useTranslations("TripCard");
  const locale = useLocale();
  const totalPlaces = trip.days.reduce((sum, d) => sum + d.placeSlugs.length, 0);
  const cover =
    trip.cover ??
    trip.days
      .flatMap((d) => d.placeSlugs)
      .map((slug) => allPlaces.find((p) => p.slug === slug)?.cover)
      .find(Boolean);

  return (
    <Link
      href={`/trip/${trip.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {cover ? (
          <Image
            src={cover}
            alt={trip.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-slow group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-muted">
            <Calendar size={36} strokeWidth={1.4} />
          </div>
        )}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-caption text-white backdrop-blur">
            <Calendar size={11} /> {t("days", { count: trip.days.length })}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-caption text-white backdrop-blur">
            <MapPin size={11} /> {t("placesCount", { count: totalPlaces })}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-1 font-display text-h3 text-text">{trip.name}</h3>
        {trip.description && (
          <p className="mt-1 line-clamp-2 text-body-sm text-text-muted">{trip.description}</p>
        )}
        <p className="mt-3 text-caption text-text-subtle">
          {t("updatedAt", { when: formatRelative(trip.updatedAt, locale, t) })}
        </p>
      </div>
    </Link>
  );
}

function formatRelative(
  ms: number,
  locale: string,
  t: (k: "justNow" | "minutesAgo" | "hoursAgo" | "daysAgo", v?: Record<string, number>) => string,
): string {
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return t("justNow");
  if (diff < 3600) return t("minutesAgo", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("hoursAgo", { n: Math.floor(diff / 3600) });
  if (diff < 86400 * 7) return t("daysAgo", { n: Math.floor(diff / 86400) });
  return new Date(ms).toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
