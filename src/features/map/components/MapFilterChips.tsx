"use client";
import { m } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { pressScale } from "@/lib/motion";
import { categories } from "@/config/categories";
import { useMapStore } from "@/stores/map-store";

export function MapFilterChips() {
  const filter = useMapStore((s) => s.filter);
  const toggle = useMapStore((s) => s.toggleCategory);
  const clear = useMapStore((s) => s.clearFilter);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filter.size > 0 && (
        <button
          onClick={clear}
          aria-label="Xoá lọc"
          className="shrink-0 flex h-9 items-center gap-1 rounded-full bg-text px-3 text-body-sm font-medium text-bg shadow-sm hover:opacity-90"
        >
          <X size={14} />
          {filter.size}
        </button>
      )}

      {categories.map((c) => {
        const Icon = c.icon;
        const active = filter.has(c.key);
        return (
          <m.button
            key={c.key}
            onClick={() => toggle(c.key)}
            aria-pressed={active}
            whileTap={pressScale}
            className={cn(
              "group shrink-0 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-body-sm font-medium transition-all duration-fast",
              active
                ? "border-transparent text-white shadow-md"
                : "border-border bg-surface text-text hover:bg-surface-2"
            )}
            style={
              active
                ? { backgroundColor: c.color }
                : undefined
            }
          >
            <Icon
              size={14}
              className={cn(active ? "text-white" : "")}
              style={!active ? { color: c.color } : undefined}
            />
            {c.labelVi}
          </m.button>
        );
      })}
    </div>
  );
}
