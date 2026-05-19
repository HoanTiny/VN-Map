"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { categories } from "@/config/categories";

export function SearchFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const cat = sp.get("cat");
  const sort = sp.get("sort") ?? "rating";

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "sticky top-20 z-10 -mx-4 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur transition-opacity",
        pending && "opacity-70"
      )}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => update("cat", null)}
          aria-pressed={!cat}
          className={cn(
            "shrink-0 inline-flex h-9 items-center rounded-full border px-3 text-body-sm font-medium transition-colors",
            !cat
              ? "border-transparent bg-text text-bg"
              : "border-border bg-surface text-text hover:bg-surface-2"
          )}
        >
          Tất cả
        </button>
        {categories.map((c) => {
          const Icon = c.icon;
          const active = cat === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => update("cat", active ? null : c.key)}
              aria-pressed={active}
              className={cn(
                "shrink-0 inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-body-sm font-medium transition-colors",
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-border bg-surface text-text hover:bg-surface-2"
              )}
              style={active ? { backgroundColor: c.color } : undefined}
            >
              <Icon
                size={14}
                className={active ? "text-white" : undefined}
                style={!active ? { color: c.color } : undefined}
              />
              {c.labelVi}
            </button>
          );
        })}

        <div className="ml-auto shrink-0">
          <label className="relative inline-flex items-center">
            <select
              value={sort}
              onChange={(e) => update("sort", e.target.value === "rating" ? null : e.target.value)}
              className="h-9 appearance-none rounded-full border border-border bg-surface pl-3 pr-8 text-body-sm text-text hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="rating">Sắp xếp: Đánh giá</option>
              <option value="reviews">Sắp xếp: Phổ biến</option>
              <option value="name">Sắp xếp: Tên</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 text-text-muted"
            />
          </label>
        </div>
      </div>
      <p className="mt-2 text-body-sm text-text-muted">{total} kết quả</p>
    </div>
  );
}
