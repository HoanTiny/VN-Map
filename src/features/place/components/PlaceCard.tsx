"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { Heart, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring, hoverLift, easing, duration } from "@/lib/motion";
import { categoryByKey, type CategoryKey } from "@/config/categories";

export interface PlaceCardData {
  slug: string;
  name: string;
  province: string;
  category: CategoryKey;
  cover: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  highlight?: string;
  saved?: boolean;
}

export interface PlaceCardProps {
  place: PlaceCardData;
  priority?: boolean;
  onToggleSave?: (slug: string, saved: boolean) => void;
  className?: string;
}

export function PlaceCard({ place, priority, onToggleSave, className }: PlaceCardProps) {
  const [saved, setSaved] = useState(!!place.saved);
  const cat = categoryByKey[place.category];
  const CatIcon = cat.icon;

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    onToggleSave?.(place.slug, next);
  };

  return (
    <m.article
      whileHover={hoverLift}
      transition={spring.snappy}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-surface shadow-sm transition-shadow duration-base",
        "border border-border hover:shadow-md dark:border-transparent",
        className
      )}
    >
      <Link href={`/place/${place.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <m.div
            className="absolute inset-0"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: duration.slower, ease: easing.standard }}
          >
            <Image
              src={place.cover}
              alt={place.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          </m.div>

          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

          <button
            onClick={toggle}
            aria-pressed={saved}
            aria-label={saved ? "Bỏ lưu" : "Lưu địa điểm"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full glass shadow-sm transition-transform active:scale-90"
          >
            <m.span
              animate={{ scale: saved ? 1.1 : 1 }}
              transition={spring.bouncy}
            >
              <Heart
                size={18}
                className={cn(
                  "transition-colors",
                  saved ? "fill-brand-500 text-brand-500" : "text-white"
                )}
              />
            </m.span>
          </button>

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full glass-subtle px-2.5 py-1 text-caption text-white">
            <CatIcon size={12} style={{ color: cat.color }} />
            <span>{cat.labelVi}</span>
          </div>

          {place.highlight && (
            <div className="absolute bottom-3 left-3 right-3 rounded-lg glass px-3 py-2 text-body-sm text-text shadow-sm">
              {place.highlight}
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 font-display text-h3 text-text">{place.name}</h3>
            {typeof place.rating === "number" && (
              <div className="flex shrink-0 items-center gap-1 text-body-sm text-text">
                <Star size={14} className="fill-warning text-warning" />
                <span className="font-medium">{place.rating.toFixed(1)}</span>
                {place.reviewCount && (
                  <span className="text-text-muted">({formatCount(place.reviewCount)})</span>
                )}
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-body-sm text-text-muted">
            <MapPin size={12} />
            <span className="line-clamp-1">{place.province}</span>
          </div>
          {place.price && (
            <div className="mt-3 text-body text-text">
              <span className="font-semibold">{place.price}</span>
              <span className="text-text-muted"> / người</span>
            </div>
          )}
        </div>
      </Link>
    </m.article>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
