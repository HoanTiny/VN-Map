"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Heart, Star, MapPin, Share2, X, Navigation, Briefcase } from "lucide-react";
import { cn } from "@/lib/cn";
import { floatingCard } from "@/lib/motion";
import { IconButton } from "@/ui/icon-button";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { categoryByKey } from "@/config/categories";
import { useMapStore } from "@/stores/map-store";
import { placesById } from "../lib/places-data";

export function MapPlaceCard() {
  const selectedId = useMapStore((s) => s.selectedPlaceId);
  const close = useMapStore((s) => s.select);
  const place = selectedId ? placesById[selectedId] : null;

  const [saved, setSaved] = useState(false);

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
            "pointer-events-auto w-full max-w-[420px] overflow-hidden rounded-2xl",
            "glass-strong shadow-xl ring-1 ring-black/5 dark:ring-white/5"
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
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute left-3 top-3">
              <CategoryChip category={place.category} />
            </div>

            <IconButton
              label="Đóng"
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
              <Badge variant="brand" className="bg-brand-50 text-brand-700">
                ✨ {place.highlight}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            <Button
              size="sm"
              variant={saved ? "tonal" : "primary"}
              onClick={() => setSaved((v) => !v)}
              className="flex-1"
            >
              <Heart
                size={14}
                className={cn("transition-all", saved && "fill-brand-700")}
              />
              {saved ? "Đã lưu" : "Lưu"}
            </Button>
            <Button size="sm" variant="secondary">
              <Briefcase size={14} />
              Thêm vào trip
            </Button>
            <IconButton label="Chia sẻ" variant="ghost" size="sm">
              <Share2 size={14} />
            </IconButton>
          </div>

          <div className="border-t border-border/60 px-4 py-3">
            <Link
              href={`/place/${place.slug}`}
              className="inline-flex items-center gap-1 text-body-sm font-medium text-brand-600 hover:underline"
            >
              <Navigation size={12} /> Xem trang chi tiết
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
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-caption font-medium shadow-sm"
      style={{ color: cat.color }}
    >
      <Icon size={12} />
      {cat.labelVi}
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
