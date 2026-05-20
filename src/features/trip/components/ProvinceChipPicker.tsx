"use client";
import { useRef, useState } from "react";
import { X, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { provinces, provinceBySlug } from "@/config/regions";

export interface ProvinceChipPickerProps {
  value: string[];                       // province slugs
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

/**
 * Chip-style multi-select for provinces.
 * - Selected items shown as removable chips
 * - Input box with typeahead suggestions (diacritics-insensitive)
 * - Click suggestion → add chip
 */
export function ProvinceChipPicker({
  value,
  onChange,
  placeholder = "Thêm điểm đến…",
  className,
}: ProvinceChipPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const q = normalize(query);
  const remaining = provinces
    .filter((p) => !value.includes(p.slug))
    .filter((p) => (q ? normalize(p.name).includes(q) : true))
    .slice(0, 8);

  const add = (slug: string) => {
    if (!value.includes(slug)) onChange([...value, slug]);
    setQuery("");
    inputRef.current?.focus();
  };
  const remove = (slug: string) => onChange(value.filter((s) => s !== slug));

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg px-2 py-2",
          "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((slug) => {
          const prov = provinceBySlug[slug];
          if (!prov) return null;
          return (
            <span
              key={slug}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-body-sm font-medium text-brand-700"
            >
              <MapPin size={11} />
              {prov.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(slug);
                }}
                aria-label={`Bỏ ${prov.name}`}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-brand-700 hover:bg-brand-100"
              >
                <X size={10} />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={value.length === 0 ? placeholder : "+"}
          className="min-w-[8ch] flex-1 bg-transparent px-1 text-body outline-none placeholder:text-text-muted"
        />
      </div>

      {open && remaining.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
          {remaining.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(p.slug);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-surface-2"
              >
                <Plus size={14} className="text-text-muted" />
                <span className="flex-1 text-body text-text">{p.name}</span>
                <span className="text-caption text-text-muted">{regionLabel(p.region)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function regionLabel(key: string): string {
  return key === "bac" ? "Bắc" : key === "trung" ? "Trung" : "Nam";
}
