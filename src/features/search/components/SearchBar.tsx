"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Search, MapPin, Tag, Layers, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring, transition, pressScale } from "@/lib/motion";
import { categories } from "@/config/categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface Suggestion {
  type: "place" | "region" | "category" | "collection";
  id: string;
  label: string;
  sub?: string;
  href: string;
}

const MOCK: Suggestion[] = [
  { type: "place",      id: "hoi-an",   label: "Hội An",        sub: "Quảng Nam · Di sản",      href: "/place/hoi-an" },
  { type: "place",      id: "ha-long",  label: "Vịnh Hạ Long",  sub: "Quảng Ninh · Di sản",     href: "/place/ha-long-bay" },
  { type: "place",      id: "da-lat",   label: "Đà Lạt",        sub: "Lâm Đồng · Cao nguyên",   href: "/place/da-lat" },
  { type: "region",     id: "trung",    label: "Miền Trung",    sub: "Vùng miền",                href: "/region/trung" },
  { type: "category",   id: "food",     label: "Ẩm thực",       sub: "Danh mục",                 href: "/category/food" },
  { type: "collection", id: "7d-trung", label: "Cung đường miền Trung 7 ngày", sub: "Bộ sưu tập", href: "/collection/7d-mien-trung" },
];

const TRENDING = ["Hội An", "Đà Lạt", "Phú Quốc", "Sa Pa", "Ninh Bình"];

const TYPE_META: Record<Suggestion["type"], { icon: typeof MapPin; label: string }> = {
  place:      { icon: MapPin, label: "Địa điểm" },
  region:     { icon: MapPin, label: "Vùng miền" },
  category:   { icon: Tag,    label: "Danh mục" },
  collection: { icon: Layers, label: "Bộ sưu tập" },
};

export interface SearchBarProps {
  className?: string;
  variant?: "pill" | "expanded";
  placeholder?: string;
}

export function SearchBar({
  className,
  variant = "pill",
  placeholder = "Tìm địa điểm, vùng miền, ẩm thực…",
}: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounced = useDebouncedValue(query, 180);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, []);

  const results = debounced
    ? MOCK.filter((s) => normalize(s.label).includes(normalize(debounced)))
    : [];
  const grouped = groupBy(results, (s) => s.type);

  const isExpanded = variant === "expanded" && open;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <m.div
        layout
        transition={spring.default}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-surface shadow-sm",
          "transition-shadow focus-within:shadow-md",
          open && "shadow-md"
        )}
      >
        <button
          aria-label="Tìm kiếm"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white"
        >
          <Search size={18} />
        </button>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-12 flex-1 bg-transparent text-body outline-none placeholder:text-text-subtle"
          enterKeyHint="search"
          aria-label="Ô tìm kiếm"
        />

        {query && (
          <button
            aria-label="Xoá"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
          >
            <X size={16} />
          </button>
        )}

        <div className="mr-2 hidden items-center gap-1 md:flex">
          {categories.slice(0, 4).map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(active ? null : c.key)}
                aria-pressed={active}
                title={c.labelVi}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  active ? "bg-brand-50 text-brand-700" : "text-text-muted hover:bg-surface-2 hover:text-text"
                )}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </m.div>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition.fast}
            className={cn(
              "absolute inset-x-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-2xl",
              "border border-border bg-surface shadow-xl"
            )}
            role="listbox"
          >
            {!debounced ? (
              <EmptyState />
            ) : results.length === 0 ? (
              <NoResults q={debounced} />
            ) : (
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {(["place", "region", "category", "collection"] as const).map((t) => {
                  const items = grouped[t];
                  if (!items?.length) return null;
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <section key={t} className="px-1 py-1">
                      <div className="px-3 py-2 text-overline text-text-subtle">
                        {meta.label}
                      </div>
                      <ul>
                        {items.slice(0, 4).map((s) => (
                          <li key={s.id}>
                            <Link
                              href={s.href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted">
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-body text-text">{s.label}</div>
                                {s.sub && (
                                  <div className="truncate text-body-sm text-text-muted">{s.sub}</div>
                                )}
                              </div>
                              <ArrowRight
                                size={16}
                                className="shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
                <div className="mt-1 border-t border-border px-1 pt-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(debounced)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-body text-brand-600 hover:bg-surface-2"
                  >
                    <span>Xem tất cả kết quả cho “{debounced}”</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );

  // marker to silence isExpanded unused if variant === "pill"
  void isExpanded;
}

function EmptyState() {
  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2 px-2 text-overline text-text-subtle">
        <TrendingUp size={12} /> Đang được tìm nhiều
      </div>
      <div className="mb-4 flex flex-wrap gap-2 px-2">
        {TRENDING.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(t)}`}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-body-sm text-text hover:bg-surface-2"
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="mb-2 flex items-center gap-2 px-2 text-overline text-text-subtle">
        <Clock size={12} /> Gợi ý cho bạn
      </div>
      <div className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.key}
              href={`/category/${c.key}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 hover:bg-surface-2"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${c.color} 14%, transparent)`, color: c.color }}
              >
                <Icon size={16} />
              </span>
              <span className="text-body text-text">{c.labelVi}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NoResults({ q }: { q: string }) {
  return (
    <div className="p-8 text-center">
      <div className="text-body text-text">Không tìm thấy “{q}”</div>
      <div className="mt-1 text-body-sm text-text-muted">
        Thử từ khoá khác hoặc duyệt theo vùng miền.
      </div>
      <Link
        href="/explore"
        className="mt-4 inline-flex items-center gap-2 text-body-sm text-brand-600 hover:underline"
      >
        Mở bản đồ <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function groupBy<T, K extends string>(arr: T[], key: (t: T) => K): Partial<Record<K, T[]>> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Partial<Record<K, T[]>>);
}
