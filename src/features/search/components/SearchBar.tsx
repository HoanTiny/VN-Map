"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Search, MapPin, Tag, Layers, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring, transition } from "@/lib/motion";
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
  { type: "place", id: "hoi-an", label: "Hội An", sub: "Quảng Nam · Di sản", href: "/place/hoi-an" },
  { type: "place", id: "ha-long", label: "Vịnh Hạ Long", sub: "Quảng Ninh · Di sản", href: "/place/ha-long-bay" },
  { type: "place", id: "da-lat", label: "Đà Lạt", sub: "Lâm Đồng · Cao nguyên", href: "/place/da-lat" },
  { type: "region", id: "trung", label: "Miền Trung", sub: "Vùng miền", href: "/region/trung" },
  { type: "category", id: "food", label: "Ẩm thực", sub: "Danh mục", href: "/category/food" },
  { type: "collection", id: "7d-trung", label: "Cung đường miền Trung 7 ngày", sub: "Bộ sưu tập", href: "/collection/7d-mien-trung" },
];

const TRENDING = ["Hội An", "Đà Lạt", "Phú Quốc", "Sa Pa", "Ninh Bình"];

const TYPE_META: Record<Suggestion["type"], { icon: typeof MapPin; label: string }> = {
  place: { icon: MapPin, label: "Địa điểm" },
  region: { icon: MapPin, label: "Vùng miền" },
  category: { icon: Tag, label: "Danh mục" },
  collection: { icon: Layers, label: "Bộ sưu tập" },
};

// Staggered layout variants for dropdown items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
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
      {/* Search Input Bar - Adaptive Frosted Glass (Adapts perfectly to light and dark modes) */}
      <m.div
        layout
        transition={spring.default}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-white/70 dark:bg-black/40 backdrop-blur-md text-zinc-900 dark:text-white",
          "border-white/40 dark:border-white/10 transition-all duration-300 ease-out shadow-lg",
          "hover:border-zinc-300 dark:hover:border-white/20",
          open
            ? "border-brand-500/30 bg-white/90 dark:bg-black/60 shadow-[0_12px_40px_rgba(0,0,0,0.12),_0_0_24px_rgba(230,59,51,0.04)]"
            : "focus-within:border-brand-500/30 focus-within:bg-white/90 dark:focus-within:bg-black/55 focus-within:shadow-[0_8px_24px_rgba(0,0,0,0.08),_0_0_16px_rgba(230,59,51,0.03)]"
        )}
      >
        {/* Animated Search Button */}
        <m.button
          aria-label="Tìm kiếm"
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          whileHover={{ scale: 1.06, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 14 }}
          className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-md shadow-brand-500/15"
        >
          <Search size={18} />
        </m.button>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-12 flex-1 bg-transparent text-body text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500 dark:placeholder:text-white/45"
          enterKeyHint="search"
          aria-label="Ô tìm kiếm"
        />

        {/* Pop-in Animate Clear Button */}
        <AnimatePresence>
          {query && (
            <m.button
              aria-label="Xoá"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={16} />
            </m.button>
          )}
        </AnimatePresence>

        {/* Responsive Category Shortcuts */}
        <div className="mr-2 hidden items-center gap-1 md:flex">
          {categories.slice(0, 4).map((c) => {
            const Icon = c.icon;
            const active = activeCat === c.key;
            return (
              <m.button
                key={c.key}
                onClick={() => setActiveCat(active ? null : c.key)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-pressed={active}
                title={c.labelVi}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                  active
                    ? "bg-brand-50 text-brand-600 border border-brand-500/10 dark:bg-brand-500/20 dark:text-brand-400 dark:border-brand-500/30 font-bold shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-200 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <Icon size={16} />
              </m.button>
            );
          })}
        </div>
      </m.div>

      {/* Suggestion Dropdown Listbox - Adaptive Frosted Glass (White Glass in light mode, Dark Glass in dark mode) */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={transition.fast}
            className={cn(
              "absolute inset-x-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-2xl",
              "border border-white/40 dark:border-white/10 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl shadow-2xl liquid-glass-card"
            )}
            role="listbox"
          >
            {!debounced ? (
              <EmptyState />
            ) : results.length === 0 ? (
              <NoResults q={debounced} />
            ) : (
              <m.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-h-[60vh] overflow-y-auto p-2 "
              >
                {(["place", "region", "category", "collection"] as const).map((t) => {
                  const items = grouped[t];
                  if (!items?.length) return null;
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <section key={t} className="px-1 py-1">
                      <m.div variants={itemVariants} className="px-3 py-2 text-overline text-zinc-400 dark:text-white/40">
                        {meta.label}
                      </m.div>
                      <ul>
                        {items.slice(0, 4).map((s) => (
                          <m.li key={s.id} variants={itemVariants}>
                            <Link
                              href={s.href}
                              onClick={() => setOpen(false)}
                              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100/80 dark:hover:bg-white/5 transition-colors duration-200"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/50 transition-colors duration-300 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/20 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                <Icon size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-body text-zinc-900 dark:text-white font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">{s.label}</div>
                                {s.sub && (
                                  <div className="truncate text-body-sm text-zinc-500 dark:text-white/50">{s.sub}</div>
                                )}
                              </div>
                              <ArrowRight
                                size={16}
                                className="shrink-0 text-zinc-400 dark:text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400"
                              />
                            </Link>
                          </m.li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
                <m.div variants={itemVariants} className="mt-1 border-t border-zinc-200 dark:border-white/5 px-1 pt-2">
                  <Link
                    href={`/search?q=${encodeURIComponent(debounced)}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-body text-brand-600 dark:text-brand-400 hover:bg-zinc-100/80 dark:hover:bg-white/5 transition-colors duration-200 font-medium"
                  >
                    <span>Xem tất cả kết quả cho “{debounced}”</span>
                    <ArrowRight size={16} />
                  </Link>
                </m.div>
              </m.div>
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
    <m.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4"
    >
      <m.div variants={itemVariants} className="mb-3 flex items-center gap-2 px-2 text-overline text-[var(--brand-500)] text-[12px] font-bold dark:text-white/40">
        <TrendingUp size={12} className="text-brand-500 animate-pulse" /> Đang được tìm nhiều
      </m.div>
      <m.div variants={itemVariants} className="mb-4 flex flex-wrap gap-2 px-2">
        {TRENDING.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(t)}`}
            className="rounded-full border border-zinc-200 dark:border-white/10  bg-zinc-100/60 dark:bg-white/5 px-3 py-1.5 text-body-sm text-zinc-800 dark:text-white/90 hover:border-brand-500/35 hover:bg-zinc-200/80 dark:hover:bg-white/10 transition-all duration-200"
          >
            {t}
          </Link>
        ))}
      </m.div>

      <m.div variants={itemVariants} className="mb-2 flex items-center gap-2 px-2 text-overline text-[var(--brand-500)] dark:text-white/40">
        <Clock size={12} /> Gợi ý cho bạn
      </m.div>

      <div className="grid grid-cols-2 gap-2 px-2 sm:grid-cols-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <m.div key={c.key} variants={itemVariants}>
              <Link
                href={`/category/${c.key}`}
                className="group flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100/40 dark:bg-white/5 p-3 hover:border-brand-500/35 hover:bg-zinc-200/80 dark:hover:bg-white/10 transition-all duration-300"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{ backgroundColor: `color-mix(in srgb, ${c.color} 20%, transparent)`, color: c.color }}
                >
                  <Icon size={16} />
                </span>
                <span className="text-body text-zinc-800 dark:text-white font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">{c.labelVi}</span>
              </Link>
            </m.div>
          );
        })}
      </div>
    </m.div>
  );
}

function NoResults({ q }: { q: string }) {
  return (
    <div className="p-8 text-center text-zinc-800 dark:text-white">
      <div className="text-body font-medium">Không tìm thấy “{q}”</div>
      <div className="mt-1 text-body-sm text-zinc-500 dark:text-white/50">
        Thử từ khoá khác hoặc duyệt theo vùng miền.
      </div>
      <Link
        href="/explore"
        className="mt-4 inline-flex items-center gap-2 text-body-sm text-brand-600 dark:text-brand-400 hover:underline animate-bounce"
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
