"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import { IconButton } from "@/ui/icon-button";
import { Badge } from "@/ui/badge";
import { categoryByKey } from "@/config/categories";
import { transition } from "@/lib/motion";
import { useIsSaved } from "@/features/saved/hooks/useSaved";
import type { PlaceItem } from "@/features/map/lib/places-data";

export interface PlaceHeroProps {
  place: PlaceItem;
}

export function PlaceHero({ place }: PlaceHeroProps) {
  const photos = place.photos && place.photos.length > 0 ? place.photos : [place.cover];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const cat = categoryByKey[place.category];
  const CatIcon = cat.icon;
  const { saved, toggle: toggleSaved } = useIsSaved(place.slug);

  const main = photos[0]!;
  const thumbs = photos.slice(1, 5);
  const extraCount = Math.max(0, photos.length - 5);

  return (
    <section className="relative">
      <div className="grid h-[44vh] min-h-[360px] grid-cols-1 gap-2 md:h-[64vh] md:grid-cols-4 md:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-1 row-span-2 overflow-hidden rounded-2xl md:col-span-2"
        >
          <Image
            src={main}
            alt={place.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-transform duration-slow hover:scale-[1.02]"
          />
        </button>
        {thumbs.length === 0 ? (
          // No thumbs — fill secondary tiles with the cover for visual rhythm
          Array.from({ length: 4 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(0)}
              className="relative hidden overflow-hidden rounded-xl md:block"
              aria-label="Phóng to ảnh"
            >
              <Image
                src={main}
                alt=""
                fill
                sizes="20vw"
                className="object-cover opacity-90 transition-transform duration-slow hover:scale-[1.04]"
              />
            </button>
          ))
        ) : (
          thumbs.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setLightboxIndex(i + 1)}
              className="relative hidden overflow-hidden rounded-xl md:block"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="20vw"
                className="object-cover transition-transform duration-slow hover:scale-[1.04]"
              />
              {i === thumbs.length - 1 && extraCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white">
                  <span className="font-display text-h2">+{extraCount}</span>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Header overlay (mobile) */}
      <div className="container relative -mt-20 md:mt-6">
        <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-lg md:flex-row md:items-center md:justify-between md:bg-transparent md:p-0 md:shadow-none">
          <div className="min-w-0">
            <Badge
              variant="neutral"
              className="mb-2 inline-flex items-center gap-1"
              style={{
                backgroundColor: `color-mix(in srgb, ${cat.color} 14%, transparent)`,
                color: cat.color,
              }}
            >
              <CatIcon size={12} />
              {cat.labelVi}
            </Badge>
            <h1 className="font-display text-h1 text-text md:text-display-lg">{place.name}</h1>
            <p className="mt-1 text-body-sm text-text-muted">
              {[place.district, place.province].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton
              label={saved ? "Bỏ lưu" : "Lưu địa điểm"}
              variant="solid"
              size="md"
              onClick={() => toggleSaved()}
            >
              <Heart size={18} className={saved ? "fill-brand-500 text-brand-500" : ""} />
            </IconButton>
            <IconButton label="Chia sẻ" variant="solid" size="md">
              <Share2 size={18} />
            </IconButton>
          </div>
        </div>
      </div>

      <Lightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndex={setLightboxIndex}
      />
    </section>
  );
}

interface LightboxProps {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

function Lightbox({ photos, index, onClose, onIndex }: LightboxProps) {
  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndex(Math.min(photos.length - 1, index + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, onClose, onIndex, photos.length]);

  return (
    <AnimatePresence>
      {index != null && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition.fast}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
          >
            <X size={20} />
          </button>
          {photos.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Ảnh trước"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex(Math.max(0, index - 1));
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                aria-label="Ảnh sau"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex(Math.min(photos.length - 1, index + 1));
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <m.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.fast}
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[index]!}
              alt=""
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </m.div>
          {photos.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-body-sm text-white backdrop-blur">
              {index + 1} / {photos.length}
            </div>
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}
