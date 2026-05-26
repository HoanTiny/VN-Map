"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Badge } from "@/ui/badge";
import { categoryByKey } from "@/config/categories";
import { useRealtimePlaces, type NewPlacePayload } from "@/features/realtime/hooks/useRealtimePlaces";
import type { ActivityItem } from "../lib/queries";
import type { CategoryKey } from "@/config/categories";

interface ActivityFeedProps {
  initial: ActivityItem[];
  /** Max items kept in feed. */
  cap?: number;
}

function timeAgo(iso: string, locale: string, justNow: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "vi", { numeric: "auto" });
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return justNow;
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 604800) return rtf.format(-Math.floor(diff / 86400), "day");
  return rtf.format(-Math.floor(diff / 604800), "week");
}

export function ActivityFeed({ initial, cap = 12 }: ActivityFeedProps) {
  const t = useTranslations("Activity");
  const [items, setItems] = useState<ActivityItem[]>(initial);
  // Force timeAgo re-render every minute so labels stay fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useRealtimePlaces((place: NewPlacePayload) => {
    setItems((prev) => {
      const id = `place-${place.id}`;
      if (prev.some((p) => p.id === id)) return prev;
      const next: ActivityItem = {
        id,
        kind: "place",
        createdAt: new Date().toISOString(),
        placeSlug: place.slug,
        placeName: place.name,
        province: place.province,
        category: place.category,
      };
      return [next, ...prev].slice(0, cap);
    });
  });

  const empty = items.length === 0;

  return (
    <div className="rounded-3xl bg-surface-1 ring-1 ring-border p-5 md:p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-overline text-success">{t("live")}</span>
        </div>
        <span className="text-caption text-text-subtle">{t("count", { count: items.length })}</span>
      </div>

      {empty ? (
        <p className="py-8 text-center text-body-sm text-text-muted">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <m.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <ActivityCard item={item} />
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const t = useTranslations("Activity");
  const locale = useLocale();
  const cat = useMemo(() => {
    if (!item.category) return null;
    const c = categoryByKey[item.category as CategoryKey];
    if (!c) return null;
    return { ...c, label: locale === "en" ? c.label : c.labelVi };
  }, [item.category, locale]);

  return (
    <Link
      href={`/place/${item.placeSlug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-2/60 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-brand-500/50 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
        {item.placeCover ? (
          <Image
            src={item.placeCover}
            alt={item.placeName}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-subtle">
            <MapPin size={32} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-2.5 top-2.5">
          {item.kind === "place" ? (
            <Badge variant="brand" className="text-[10px] shadow-sm">{t("newlyApproved")}</Badge>
          ) : (
            <Badge variant="warning" className="gap-1 text-[10px] shadow-sm">
              <Star size={10} className="fill-warning text-warning" />
              {item.rating?.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="absolute right-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-caption text-white backdrop-blur-sm">
          {timeAgo(item.createdAt, locale, t("justNow"))}
        </div>
        <div className="absolute inset-x-3 bottom-2.5">
          <p className="truncate font-display text-body-lg font-semibold text-white drop-shadow">
            {item.placeName}
          </p>
        </div>
      </div>

      <div className="flex-1 px-3.5 py-3">
        {item.kind === "place" ? (
          <p className="text-body-sm text-text-muted">
            {cat?.label ?? t("fallbackCategory")}
            {item.province ? ` · ${item.province}` : ""}
          </p>
        ) : (
          <p className="line-clamp-2 text-body-sm text-text-muted">
            <span className="font-medium text-text">{item.author ?? t("guestAuthor")}</span>
            {item.body ? `: "${item.body}"` : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
