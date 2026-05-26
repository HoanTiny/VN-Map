"use client";
import Image from "next/image";
import Link from "next/link";
import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { spring, duration, easing } from "@/lib/motion";

export interface CityCardData {
  slug: string;
  name: string;
  region: string;
  cover: string;
  placeCount: number;
  tagline?: string;
  /** Optional explicit href — defaults to `/region/${slug}`. */
  href?: string;
}

export interface CityCardProps {
  city: CityCardData;
  priority?: boolean;
  size?: "md" | "lg";
  className?: string;
}

export function CityCard({ city, priority, size = "md", className }: CityCardProps) {
  const t = useTranslations("CityCard");
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 220, damping: 22 });

  const aspect = size === "lg" ? "aspect-[4/5]" : "aspect-[3/4]";

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <m.div
      style={{ perspective: 1200 }}
      className={cn("group relative", className)}
    >
      <Link
        href={city.href ?? `/region/${city.slug}`}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="block"
      >
        <m.div
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          className={cn(
            "relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/[0.04] dark:ring-white/[0.04]",
            aspect
          )}
        >
          <m.div
            className="absolute inset-0"
            initial={false}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.9, ease: easing.standard }}
          >
            <Image
              src={city.cover}
              alt={city.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
            />
          </m.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-base group-hover:from-black/90" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-500/0 opacity-0 transition-opacity duration-slow group-hover:from-brand-500/10 group-hover:to-transparent group-hover:opacity-100" />

          <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full glass-subtle px-2.5 py-1 text-caption text-white">
            <MapPin size={12} />
            {city.region}
          </div>

          <div className="absolute inset-x-5 bottom-5 flex flex-col gap-2 text-white">
            <m.div
              initial={false}
              animate={{ y: 0 }}
              className="overflow-hidden"
            >
              <m.h3
                initial={false}
                whileHover={{ y: -4 }}
                className="font-display text-display-lg leading-[1.05] drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
              >
                {city.name}
              </m.h3>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              whileHover={{ opacity: 1, y: 0, height: "auto" }}
              animate={{ opacity: 0, y: 12, height: 0 }}
              transition={{ duration: duration.slow, ease: easing.standard }}
              className="overflow-hidden"
            >
              <div className="hidden md:block" />
            </m.div>

            <div className="flex items-end justify-between gap-3">
              <div className="text-body-sm/relaxed text-white/85">
                {city.tagline ?? t("placesToExplore", { count: city.placeCount })}
              </div>
              <m.div
                initial={false}
                whileHover={{ x: 4, y: -4 }}
                transition={spring.default}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full glass text-white"
                aria-hidden
              >
                <ArrowUpRight size={18} />
              </m.div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-5 bottom-5 hidden md:block">
            <m.div
              initial={{ opacity: 0, height: 0 }}
              whileHover={{ opacity: 1, height: "auto" }}
              transition={{ duration: duration.slow, ease: easing.standard }}
              className="overflow-hidden text-body-sm text-white/80"
            >
              <div className="h-px w-12 bg-white/30 mb-2" />
              {t("placesShort", { count: city.placeCount })}
            </m.div>
          </div>
        </m.div>
      </Link>
    </m.div>
  );
}
