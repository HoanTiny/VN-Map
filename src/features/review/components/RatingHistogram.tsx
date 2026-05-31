"use client";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Review } from "../lib/types";

export interface RatingHistogramProps {
  reviews: Review[];
  /** Optional baseline (rating from seed data) merged in if no reviews yet. */
  baseline?: { rating: number; count: number };
}

export function RatingHistogram({ reviews, baseline }: RatingHistogramProps) {
  const t = useTranslations("Review");
  const total = reviews.length;
  const avg =
    total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : baseline?.rating ?? 0;
  const displayCount = total > 0 ? total : baseline?.count ?? 0;

  const buckets: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => (buckets[r.rating] += 1));
  const max = Math.max(...Object.values(buckets), 1);

  return (
    <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-surface p-5 md:grid-cols-[180px_1fr] md:p-6">
      {/* Summary */}
      <div className="flex flex-col items-center justify-center text-center md:items-start md:text-left">
        <div className="font-display text-display-lg leading-none text-text">
          {avg > 0 ? avg.toFixed(1) : "—"}
        </div>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={16}
              strokeWidth={1.5}
              className={n <= Math.round(avg) ? "fill-warning text-warning" : "text-text-subtle"}
            />
          ))}
        </div>
        <div className="mt-1 text-body-sm text-text-muted">
          {t("ratingCount", { count: displayCount })}
        </div>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-2">
        {([5, 4, 3, 2, 1] as const).map((n) => {
          const count = buckets[n];
          const pct = total > 0 ? (count / max) * 100 : 0;
          return (
            <div key={n} className="flex items-center gap-3 text-body-sm">
              <span className="inline-flex w-8 shrink-0 items-center gap-1 text-text-muted">
                {n} <Star size={11} className="fill-warning text-warning" />
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-warning transition-all duration-base ease-standard"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-text-muted tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
