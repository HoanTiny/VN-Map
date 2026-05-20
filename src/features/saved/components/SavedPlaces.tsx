"use client";
import Link from "next/link";
import { Heart, Map } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { PlaceGrid } from "@/features/place/components/PlaceGrid";
import { useSaved } from "../hooks/useSaved";
import { allPlaces } from "@/features/map/lib/places-data";

export function SavedPlaces() {
  const { saved, hydrated } = useSaved();

  // Preserve insertion order (saved[] is newest-first).
  const savedPlaces = saved
    .map((slug) => allPlaces.find((p) => p.slug === slug))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof allPlaces.find>>>;

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <Reveal>
          <p className="text-overline text-brand-600">CỦA BẠN</p>
          <h1 className="mt-2 font-display text-display-lg text-text">Đã lưu</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            {hydrated
              ? savedPlaces.length === 0
                ? "Chưa có địa điểm nào được lưu."
                : `${savedPlaces.length} địa điểm đã lưu.`
              : "Đang tải…"}
          </p>
        </Reveal>

        <div className="mt-8">
          {hydrated && savedPlaces.length === 0 ? (
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
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Heart size={20} />
      </div>
      <p className="font-display text-h3 text-text">Trống trải quá</p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        Lưu địa điểm yêu thích bằng cách bấm trái tim ♡ trên bất kỳ thẻ nào.
      </p>
      <Button className="mt-4" asChild>
        <Link href="/explore">
          <Map size={16} /> Khám phá bản đồ
        </Link>
      </Button>
    </div>
  );
}
