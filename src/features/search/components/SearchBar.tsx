"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Search, MapPin, Tag, Layers, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { spring, transition } from "@/lib/motion";
import { categories } from "@/config/categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRecentSearches } from "@/hooks/use-recent-searches";

interface Suggestion {
  type: "place" | "region" | "category";
  id: string;
  label: string;
  sub?: string;
  href: string;
}

const TRENDING = ["Hội An", "Đà Lạt", "Phú Quốc", "Sa Pa", "Ninh Bình"];

const TYPE_ICON: Record<Suggestion["type"], typeof MapPin> = {
  place: MapPin,
  region: Layers,
  category: Tag,
};

const TYPE_LABEL_KEY: Record<Suggestion["type"], "typePlace" | "typeRegion" | "typeCategory"> = {
  place: "typePlace",
  region: "typeRegion",
  category: "typeCategory",
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
  placeholder,
}: SearchBarProps) {
  const t = useTranslations("Search");
  const resolvedPlaceholder = placeholder ?? t("placeholder");
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

  const { searches: recentSearches, add: addRecent, remove: removeRecent } = useRecentSearches();
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debounced) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search/suggest?q=${encodeURIComponent(debounced)}`, {
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items: Suggestion[] }) => {
        setResults(data.items ?? []);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setLoading(false);
      });
    return () => ctrl.abort();
  }, [debounced]);

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
          aria-label={t("searchAria")}
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
          placeholder={resolvedPlaceholder}
          className="h-12 flex-1 bg-transparent text-body text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500 dark:placeholder:text-white/45"
          enterKeyHint="search"
          aria-label={t("inputAria")}
        />

        {/* Pop-in Animate Clear Button */}
        <AnimatePresence>
          {query && (
            <m.button
              aria-label={t("clearAria")}
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
              <EmptyState recent={recentSearches} onRemoveRecent={removeRecent} />
            ) : loading && results.length === 0 ? (
              <div className="p-8 text-center text-body-sm text-zinc-500 dark:text-white/50">
                {t("searching")}
              </div>
            ) : results.length === 0 ? (
              <NoResults q={debounced} />
            ) : (
              <m.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-h-[60vh] overflow-y-auto p-2 "
              >
                {(["place", "region", "category"] as const).map((kind) => {
                  const items = grouped[kind];
                  if (!items?.length) return null;
                  const Icon = TYPE_ICON[kind];
                  return (
                    <section key={kind} className="px-1 py-1">
                      <m.div variants={itemVariants} className="px-3 py-2 text-overline text-zinc-400 dark:text-white/40">
                        {t(TYPE_LABEL_KEY[kind])}
                      </m.div>
                      <ul>
                        {items.slice(0, 4).map((s) => (
                          <m.li key={s.id} variants={itemVariants}>
                            <Link
                              href={s.href}
                              onClick={() => { addRecent(s.label); setOpen(false); }}
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
                    onClick={() => { addRecent(debounced); setOpen(false); }}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-body text-brand-600 dark:text-brand-400 hover:bg-zinc-100/80 dark:hover:bg-white/5 transition-colors duration-200 font-medium"
                  >
                    <span>{t("viewAllResults", { q: debounced })}</span>
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

function EmptyState({ recent, onRemoveRecent }: { recent: string[]; onRemoveRecent: (q: string) => void }) {
  const t = useTranslations("Search");
  return (
    <m.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4"
    >
      {recent.length > 0 && (
        <>
          <m.div variants={itemVariants} className="mb-2 flex items-center gap-2 px-2 text-overline text-[12px] font-bold text-zinc-400 dark:text-white/40">
            <Clock size={12} /> {t("recentSearches")}
          </m.div>
          <m.ul variants={itemVariants} className="mb-4">
            {recent.map((q) => (
              <li key={q} className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-100/80 dark:hover:bg-white/5">
                <Clock size={14} className="shrink-0 text-zinc-400 dark:text-white/30" />
                <Link
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="min-w-0 flex-1 truncate text-body text-zinc-800 dark:text-white/90 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  {q}
                </Link>
                <button
                  type="button"
                  aria-label={t("removeSearch")}
                  onClick={() => onRemoveRecent(q)}
                  className="shrink-0 rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </m.ul>
        </>
      )}

      <m.div variants={itemVariants} className="mb-3 flex items-center gap-2 px-2 text-overline text-[var(--brand-500)] text-[12px] font-bold dark:text-white/40">
        <TrendingUp size={12} className="text-brand-500 animate-pulse" /> {t("trending")}
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
        <Clock size={12} /> {t("suggestionsForYou")}
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
  const t = useTranslations("Search");
  return (
    <div className="p-8 text-center text-zinc-800 dark:text-white">
      <div className="text-body font-medium">{t("noResults", { q })}</div>
      <div className="mt-1 text-body-sm text-zinc-500 dark:text-white/50">
        {t("noResultsHint")}
      </div>
      <Link
        href="/explore"
        className="mt-4 inline-flex items-center gap-2 text-body-sm text-brand-600 dark:text-brand-400 hover:underline animate-bounce"
      >
        {t("openMap")} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function groupBy<T, K extends string>(arr: T[], key: (t: T) => K): Partial<Record<K, T[]>> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Partial<Record<K, T[]>>);
}
