"use client";
import { useMemo } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { spring } from "@/lib/motion";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { categoryByKey } from "@/config/categories";
import { useMapStore } from "@/stores/map-store";
import { useMapData } from "../context/MapDataContext";

export function MapSidePanel() {
  const bounds = useMapStore((s) => s.bounds);
  const filter = useMapStore((s) => s.filter);
  const selectedId = useMapStore((s) => s.selectedPlaceId);
  const select = useMapStore((s) => s.select);
  const hoverId = useMapStore((s) => s.hoverId);
  const setHover = useMapStore((s) => s.setHover);
  const { places: allPlaces } = useMapData();
  const [collapsed, setCollapsed] = useState(false);

  const visible = useMemo(() => {
    let arr = allPlaces;
    if (filter.size > 0) arr = arr.filter((p) => filter.has(p.category));
    if (bounds) {
      arr = arr.filter(
        (p) =>
          p.lng >= bounds.west &&
          p.lng <= bounds.east &&
          p.lat >= bounds.south &&
          p.lat <= bounds.north
      );
    }
    return arr;
  }, [bounds, filter, allPlaces]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        aria-label="Mở danh sách"
        className="pointer-events-auto flex h-12 w-10 items-center justify-center rounded-r-2xl glass shadow-md text-text"
      >
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <m.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={spring.default}
      className="pointer-events-auto flex w-[380px] flex-col overflow-hidden rounded-2xl glass shadow-lg"
      aria-label="Danh sách địa điểm trong khu vực"
    >
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div>
          <div className="text-overline text-text-subtle">Trong khung nhìn</div>
          <div className="font-display text-h3 text-text">
            {visible.length} địa điểm
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Thu gọn"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
        >
          <ChevronLeft size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {visible.map((p) => {
              const cat = categoryByKey[p.category];
              const CatIcon = cat.icon;
              const active = selectedId === p.id;
              const hovered = hoverId === p.id;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => select(p.id)}
                    onMouseEnter={() => setHover(p.id)}
                    onMouseLeave={() => setHover(null)}
                    className={cn(
                      "group flex w-full gap-3 rounded-xl border p-2 text-left transition-all duration-fast",
                      active
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-50/20"
                        : hovered
                        ? "border-border bg-surface-2"
                        : "border-transparent hover:bg-surface-2"
                    )}
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={p.cover}
                        alt={p.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-center gap-1.5 text-caption" style={{ color: cat.color }}>
                        <CatIcon size={11} />
                        {cat.labelVi}
                      </div>
                      <div className="line-clamp-1 text-body font-medium text-text">{p.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-body-sm text-text-muted">
                        <span className="inline-flex items-center gap-0.5">
                          <Star size={11} className="fill-warning text-warning" />
                          {p.rating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <MapPin size={11} />
                          <span className="line-clamp-1">{p.province}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </m.aside>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <div className="text-h3 font-display text-text">Không có địa điểm</div>
        <p className="mt-1 text-body-sm text-text-muted">
          Thử zoom out hoặc bỏ bớt bộ lọc danh mục.
        </p>
      </div>
    </div>
  );
}
