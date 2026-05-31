"use client";
import { useCallback, useMemo, useState } from "react";
import { PencilLine, ArrowDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { spring } from "@/lib/motion";
import { ReviewCard } from "./ReviewCard";
import { RatingHistogram } from "./RatingHistogram";
import { ReviewForm } from "./ReviewForm";
import { useReviews } from "../hooks/useReviews";
import { useRealtimeReviews } from "@/features/realtime/hooks/useRealtimeReviews";
import type { ReviewSort } from "../lib/types";

export interface ReviewListProps {
  placeSlug: string;
  placeName: string;
  baseline?: { rating: number; count: number };
}

export function ReviewList({ placeSlug, placeName, baseline }: ReviewListProps) {
  const t = useTranslations("Review");
  const SORT_OPTIONS: Array<{ key: ReviewSort; label: string }> = [
    { key: "newest", label: t("sortNewest") },
    { key: "highest", label: t("sortHighest") },
    { key: "lowest", label: t("sortLowest") },
    { key: "photos", label: t("sortPhotos") },
  ];
  const { reviews, hydrated, remove } = useReviews(placeSlug);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [formOpen, setFormOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);

  useRealtimeReviews(
    placeSlug,
    useCallback(() => {
      setNewCount((n) => n + 1);
      // Optimistically prepend so the review appears without refetch
      // (useReviews will deduplicate on next load)
    }, [])
  );

  const sorted = useMemo(() => {
    const arr = reviews.slice();
    switch (sort) {
      case "newest":
        return arr.sort((a, b) => b.createdAt - a.createdAt);
      case "highest":
        return arr.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt);
      case "lowest":
        return arr.sort((a, b) => a.rating - b.rating || b.createdAt - a.createdAt);
      case "photos":
        return arr
          .filter((r) => r.photos && r.photos.length > 0)
          .sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [reviews, sort]);

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-overline text-brand-600">{t("communityOverline")}</p>
          <h2 className="mt-1 font-display text-h2 text-text">{t("title")}</h2>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PencilLine size={16} /> {t("writeReview")}
        </Button>
      </div>

      <RatingHistogram reviews={reviews} baseline={baseline} />

      {/* Realtime new-review nudge */}
      <AnimatePresence>
        {newCount > 0 && (
          <m.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={spring.default}
            onClick={() => { setNewCount(0); window.location.reload(); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 py-2 text-body-sm font-medium text-brand-600 hover:bg-brand-500/15"
          >
            <ArrowDown size={14} />
            {t("newReviewsNotice", { count: newCount })}
          </m.button>
        )}
      </AnimatePresence>

      {/* Sort tabs */}
      {hydrated && reviews.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {SORT_OPTIONS.map((opt) => {
            const active = sort === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSort(opt.key)}
                aria-pressed={active}
                className={
                  active
                    ? "inline-flex h-9 items-center rounded-full bg-text px-3 text-body-sm font-medium text-bg"
                    : "inline-flex h-9 items-center rounded-full border border-border bg-surface px-3 text-body-sm font-medium text-text hover:bg-surface-2"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {!hydrated ? (
          <p className="text-body-sm text-text-muted">{t("loading")}</p>
        ) : reviews.length === 0 ? (
          <EmptyState onWrite={() => setFormOpen(true)} />
        ) : sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-body-sm text-text-muted">
            {t("noMatchFilter")}
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {sorted.map((r) => (
              <m.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={spring.default}
              >
                <ReviewCard review={r} onDelete={remove} />
              </m.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <ReviewForm
        placeSlug={placeSlug}
        placeName={placeName}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </section>
  );
}

function EmptyState({ onWrite }: { onWrite: () => void }) {
  const t = useTranslations("Review");
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Badge variant="brand" className="mb-3">{t("firstBadge")}</Badge>
      <h3 className="font-display text-h3 text-text">{t("emptyTitle")}</h3>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        {t("emptyBody")}
      </p>
      <Button className="mt-4" onClick={onWrite}>
        <PencilLine size={16} /> {t("writeFirst")}
      </Button>
    </div>
  );
}
