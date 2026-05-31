"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { categoriesByGroup, type Category } from "@/config/categories";

// Display copy (count/tagline/highlights) for each category lives in messages
// under `CategoriesBento.meta.<key>`. Only the locale-independent `isHot` badge
// flag stays here in code.
const HOT_CATEGORIES = new Set(["nightlife", "rooftop", "hidden", "heritage"]);

// Return static string literals to prevent Tailwind from purging dynamically constructed classes
function getBentoClasses(index: number): string {
  switch (index % 6) {
    case 0:
      return "md:col-span-2 min-h-[190px] md:min-h-[220px] h-full"; // Wide (2x1)
    case 1:
      return "md:col-span-1 min-h-[190px] md:min-h-[220px] h-full"; // Square (1x1)
    case 2:
      return "md:col-span-1 min-h-[190px] md:min-h-[220px] h-full"; // Square (1x1)
    case 3:
      return "md:col-span-2 min-h-[190px] md:min-h-[220px] h-full"; // Wide (2x1) - Featured
    case 4:
      return "md:col-span-1 min-h-[190px] md:min-h-[220px] h-full"; // Square (1x1)
    case 5:
      return "md:col-span-2 min-h-[190px] md:min-h-[220px] h-full"; // Wide (2x1)
    default:
      return "col-span-1 h-full";
  }
}

function BentoCatCard({
  c,
  index,
}: {
  c: Category;
  index: number;
}) {
  const Icon = c.icon;
  const locale = useLocale();
  const t = useTranslations("CategoriesBento");
  const catLabel = locale === "en" ? c.label : c.labelVi;

  // Per-category copy lives in messages under `CategoriesBento.meta.<key>`.
  const metaKey = `meta.${c.key}`;
  const count = t(`${metaKey}.count`);
  const tagline = t(`${metaKey}.tagline`);
  const highlights = (t.raw(`${metaKey}.highlights`) ?? []) as string[];
  const isHot = HOT_CATEGORIES.has(c.key);

  const bentoClass = getBentoClasses(index);

  // Layout states - index 0, 3, 5 are WIDE (col-span-2)
  const isWide = index === 0 || index === 3 || index === 5;

  return (
    <Link
      href={`/category/${c.key}`}
      className={`group liquid-glass-card relative flex flex-col justify-between items-start overflow-hidden rounded-[30px] p-6 md:p-7 text-left transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[var(--cat-color)]/15 ${bentoClass}`}
      style={{ 
        "--cat-color": c.color,
      } as React.CSSProperties}
    >
      {/* Dynamic colorful blobs background */}
      <div className="liquid-container absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-[30px] opacity-[0.8]">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>

      {/* Volumetric glass gloss overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-95 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-20" />

      {/* 
        ELITE WATERMARK ICON:
        Fills the large empty space inside Bento cards with a gorgeous, stylized category icon watermark.
        Animates responsively on hover (scales up and rotates).
      */}
      <div 
        className={`absolute pointer-events-none transition-all duration-700 ease-out z-0 text-[var(--cat-color)] ${
          isWide 
            ? "right-12 top-1/2 -translate-y-1/2 opacity-[0.08] dark:opacity-[0.14] group-hover:opacity-[0.12] group-hover:scale-105 group-hover:rotate-6"
            : "right-6 bottom-6 opacity-[0.06] dark:opacity-[0.11] group-hover:opacity-[0.10] group-hover:scale-110 group-hover:rotate-6"
        }`}
      >
        <Icon size={isWide ? 120 : 90} className="stroke-[1.0]" />
      </div>

      {/* Top section: Icon + Place taglines */}
      <div className="relative z-10 flex w-full items-start justify-between gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-[20px] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${c.color} 24%, transparent) 0%, color-mix(in srgb, ${c.color} 8%, transparent) 100%)`,
            color: c.color,
            border: `1.5px solid color-mix(in srgb, ${c.color} 35%, transparent)`,
            boxShadow: `0 8px 24px -6px color-mix(in srgb, ${c.color} 30%, transparent)`,
          }}
        >
          <Icon size={20} className="stroke-[2]" />
        </span>
        <div className="flex flex-col items-end gap-1.5">
          {isHot && (
            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-500 ring-1 ring-red-500/20">
              🔥 HOT
            </span>
          )}
          <span className="rounded-full bg-text/5 px-2.5 py-0.5 text-[10px] font-bold text-text-muted border border-border/10 backdrop-blur-sm shadow-sm">
            {count}
          </span>
        </div>
      </div>

      {/* Bottom text block */}
      <div className="relative z-10 mt-5 w-full flex flex-col justify-end max-w-[85%] md:max-w-[78%]">
        <span 
          className="font-display font-extrabold text-text group-hover:text-[var(--cat-color)] transition-colors duration-300 tracking-tight leading-none text-lg md:text-xl"
        >
          {catLabel}
        </span>
        
        <p
          className="mt-2 text-text-muted leading-relaxed font-semibold text-[11px] md:text-[12px] line-clamp-2"
        >
          {tagline}
        </p>

        {/* Highlights: add highly premium mini-tags in Wide cards to fill space with gorgeous structure */}
        {isWide && highlights.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {highlights.slice(0, 3).map((h, i) => (
              <span 
                key={i} 
                className="text-[9px] font-bold px-2 py-0.5 rounded-lg border border-border/40 backdrop-blur-md text-text-muted shadow-sm transition-all duration-300 group-hover:border-[var(--cat-color)]/30 group-hover:text-text"
              >
                #{h}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive hover indicator arrow */}
      <span className="absolute bottom-6 right-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-black/50 text-[var(--cat-color)] shadow-md border border-border/40 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:rotate-[45deg]">
        <ArrowRight size={15} className="stroke-[2.5]" />
      </span>
    </Link>
  );
}

export function CategoriesBento() {
  const t = useTranslations("CategoriesBento");
  const [activeTab, setActiveTab] = useState<"lifestyle" | "travel">("lifestyle");
  const currentCategories = categoriesByGroup[activeTab];

  return (
    <section className="py-20 md:py-28 overflow-hidden relative bg-zinc-50/40 dark:bg-zinc-950/10 border-y border-border/30">
      {/* Subtle Mesh Grid Decorative Pattern behind the glass cards to maximize reflections */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Atmospheric colorful lighting glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-brand-500/5 via-rose-500/3 to-transparent blur-[130px] dark:from-brand-500/12 dark:via-rose-600/6 dark:to-transparent pointer-events-none" />

      <div className="container">
        {/* Section header */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
          <Reveal>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-brand-600 uppercase mb-2">
                {t("overline")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-text leading-tight">
                {t("title")}
              </h2>
              <p className="mt-2.5 max-w-xl text-body text-text-muted">
                {t("subtitle")}
              </p>
            </div>
          </Reveal>

          {/* Liquid Glass Tabs Switcher */}
          <Reveal delay={0.1}>
            <div className="self-start md:self-auto bg-white/50 dark:bg-surface-2/45 backdrop-blur-xl border border-white/60 dark:border-border/45 p-1.5 rounded-full inline-flex gap-1.5 shadow-lg shadow-black/5 relative z-10 select-none">
              <button
                onClick={() => setActiveTab("lifestyle")}
                className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-500 ${
                  activeTab === "lifestyle"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-100"
                    : "text-text-muted hover:text-text hover:bg-surface/50 scale-95"
                }`}
              >
                {t("tabLifestyle")}
              </button>
              <button
                onClick={() => setActiveTab("travel")}
                className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-500 ${
                  activeTab === "travel"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-100"
                    : "text-text-muted hover:text-text hover:bg-surface/50 scale-95"
                }`}
              >
                {t("tabTravel")}
              </button>
            </div>
          </Reveal>
        </div>

        {/* Bento Grid layout container */}
        <div className="relative min-h-[500px] z-10">
          <div
            key={activeTab}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-[fadeIn_0.6s_ease-out_both]"
          >
            {currentCategories.map((c, i) => (
              <Reveal key={c.key} delay={i * 0.05} className="h-full">
                <BentoCatCard c={c} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Gooey Filter for Apple Liquid Glass */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </section>
  );
}
