"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { m } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { pressScale } from "@/lib/motion";

export interface ProvinceFilterChipsProps {
  provinces: Array<{ value: string; label: string; count: number }>;
  paramKey?: string;
}

/**
 * URL-state filter chips. Updates `?province=<value>` and triggers a soft
 * navigation so the server component re-renders with the filtered list.
 */
export function ProvinceFilterChips({
  provinces,
  paramKey = "province",
}: ProvinceFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const active = sp.get(paramKey);

  const setActive = (value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(paramKey, value);
    else next.delete(paramKey);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  if (provinces.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 transition-opacity",
        pending && "opacity-60"
      )}
      role="tablist"
    >
      <m.button
        type="button"
        whileTap={pressScale}
        onClick={() => setActive(null)}
        aria-pressed={!active}
        className={cn(
          "shrink-0 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-body-sm font-medium transition-colors",
          !active
            ? "border-transparent bg-text text-bg"
            : "border-border bg-surface text-text hover:bg-surface-2"
        )}
      >
        Tất cả tỉnh
      </m.button>
      {provinces.map((p) => {
        const selected = active === p.value;
        return (
          <m.button
            key={p.value}
            type="button"
            whileTap={pressScale}
            onClick={() => setActive(selected ? null : p.value)}
            aria-pressed={selected}
            className={cn(
              "shrink-0 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-body-sm font-medium transition-colors",
              selected
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-border bg-surface text-text hover:bg-surface-2"
            )}
          >
            {p.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                selected ? "bg-brand-500 text-white" : "bg-surface-2 text-text-muted"
              )}
            >
              {p.count}
            </span>
            {selected && <X size={12} />}
          </m.button>
        );
      })}
    </div>
  );
}
