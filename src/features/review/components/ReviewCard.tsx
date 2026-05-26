"use client";
import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { RatingStars } from "./RatingStars";
import { companionLabels, type Review } from "../lib/types";
import { Badge } from "@/ui/badge";
import { IconButton } from "@/ui/icon-button";

export interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
}

export function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const t = useTranslations("Review");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const longBody = review.body.length > 280;
  const visibleBody = !longBody || expanded ? review.body : review.body.slice(0, 280) + "…";

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 font-display text-h3">
            {initial(review.authorName)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-body font-medium text-text">{review.authorName}</div>
            <div className="text-body-sm text-text-muted">
              {formatDate(review.createdAt, locale, t)}
              {review.visitedAt && (
                <>
                  <span> · {t("visitedOn")} </span>
                  <span>{formatMonth(review.visitedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {onDelete && (
          <IconButton
            label={t("deleteAria")}
            variant="ghost"
            size="sm"
            onClick={() => onDelete(review.id)}
          >
            <Trash2 size={14} />
          </IconButton>
        )}
      </header>

      <div className="mt-3 flex items-center gap-2">
        <RatingStars value={review.rating} size={16} readOnly />
        {review.companion && (
          <Badge variant="neutral">{companionLabels[review.companion]}</Badge>
        )}
      </div>

      {review.title && (
        <h4 className="mt-3 font-display text-h3 text-text">{review.title}</h4>
      )}

      <p className="mt-2 whitespace-pre-line text-body text-text">{visibleBody}</p>

      {longBody && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-body-sm font-medium text-brand-600 hover:underline"
        >
          {expanded ? t("collapse") : t("readMore")}
        </button>
      )}

      {review.photos && review.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {review.photos.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={src}
                alt={t("photoAlt", { n: i + 1 })}
                fill
                sizes="160px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatDate(
  ms: number,
  locale: string,
  t: (k: "justNow" | "minutesAgo" | "hoursAgo" | "daysAgo", v?: Record<string, number>) => string,
): string {
  const now = Date.now();
  const diff = (now - ms) / 1000;
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

function formatMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  if (!y || !m) return yearMonth;
  return `${m}/${y}`;
}
