"use client";
import { useMemo, useState } from "react";
import { PencilLine } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { spring } from "@/lib/motion";
import { ReviewCard } from "./ReviewCard";
import { RatingHistogram } from "./RatingHistogram";
import { ReviewForm } from "./ReviewForm";
import { useReviews } from "../hooks/useReviews";
import type { ReviewSort } from "../lib/types";

export interface ReviewListProps {
  placeSlug: string;
  placeName: string;
  baseline?: { rating: number; count: number };
}

const SORT_OPTIONS: Array<{ key: ReviewSort; label: string }> = [
  { key: "newest", label: "Mới nhất" },
  { key: "highest", label: "Đánh giá cao" },
  { key: "lowest", label: "Đánh giá thấp" },
  { key: "photos", label: "Có ảnh" },
];

export function ReviewList({ placeSlug, placeName, baseline }: ReviewListProps) {
  const { reviews, hydrated, remove } = useReviews(placeSlug);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [formOpen, setFormOpen] = useState(false);

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
          <p className="text-overline text-brand-600">CỘNG ĐỒNG</p>
          <h2 className="mt-1 font-display text-h2 text-text">Review thực tế</h2>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PencilLine size={16} /> Viết review
        </Button>
      </div>

      <RatingHistogram reviews={reviews} baseline={baseline} />

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
          <p className="text-body-sm text-text-muted">Đang tải…</p>
        ) : reviews.length === 0 ? (
          <EmptyState onWrite={() => setFormOpen(true)} />
        ) : sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-body-sm text-text-muted">
            Chưa có review nào khớp bộ lọc này.
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
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <Badge variant="brand" className="mb-3">Đầu tiên</Badge>
      <h3 className="font-display text-h3 text-text">Chưa có review nào</h3>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        Hãy là người đầu tiên chia sẻ trải nghiệm — giúp cộng đồng biết nên đến hay không.
      </p>
      <Button className="mt-4" onClick={onWrite}>
        <PencilLine size={16} /> Viết review đầu tiên
      </Button>
    </div>
  );
}
