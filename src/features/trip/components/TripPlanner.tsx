"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, ArrowLeftRight, MapPin, Map as MapIcon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { Badge } from "@/ui/badge";
import { spring } from "@/lib/motion";
import { useTrip } from "../hooks/useTrips";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { allPlaces, type PlaceItem } from "@/features/map/lib/places-data";
import { categoryByKey } from "@/config/categories";
import { ProvinceChipPicker } from "./ProvinceChipPicker";

export function TripPlanner({ tripId }: { tripId: string }) {
  const router = useRouter();
  const { trip, hydrated, addPlace, removePlace, addDay, removeDay, update, remove } =
    useTrip(tripId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!hydrated) {
    return <div className="container py-24 text-body-sm text-text-muted">Đang tải…</div>;
  }
  if (!trip) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-h2 text-text">Không tìm thấy chuyến đi</p>
        <Button className="mt-4" asChild>
          <Link href="/trip">
            <ChevronLeft size={16} /> Về danh sách
          </Link>
        </Button>
      </div>
    );
  }

  const deleteTripAndExit = () => {
    remove();
    router.push("/trip");
  };

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <div className="flex items-center gap-1 text-body-sm text-text-muted">
          <Link href="/trip" className="hover:text-text">Chuyến đi</Link>
          <span>›</span>
          <span className="line-clamp-1">{trip.name}</span>
        </div>

        <header className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={trip.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full bg-transparent font-display text-display-lg text-text outline-none focus:bg-surface-2/40 focus:ring-2 focus:ring-brand-500 rounded-md px-1 -ml-1"
              maxLength={80}
            />
            <textarea
              value={trip.description ?? ""}
              onChange={(e) => update({ description: e.target.value || undefined })}
              placeholder="Thêm mô tả ngắn…"
              rows={1}
              className="mt-2 w-full resize-none bg-transparent text-body-lg text-text-muted outline-none focus:bg-surface-2/40 focus:ring-2 focus:ring-brand-500 rounded-md px-1 -ml-1"
              maxLength={300}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!confirmDelete ? (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={14} /> Xoá chuyến đi
              </Button>
            ) : (
              <>
                <span className="text-body-sm text-text-muted">Chắc chứ?</span>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Huỷ
                </Button>
                <Button variant="destructive" onClick={deleteTripAndExit}>
                  Xoá
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-body-sm text-text-muted">
          <Badge variant="neutral">{trip.days.length} ngày</Badge>
          <Badge variant="neutral">
            {trip.days.reduce((sum, d) => sum + d.placeSlugs.length, 0)} địa điểm
          </Badge>
        </div>

        {/* Destinations picker */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-h3 text-text">Điểm đến</h3>
            <span className="text-caption text-text-muted">
              Gợi ý địa điểm sẽ ưu tiên các tỉnh dưới đây
            </span>
          </div>
          <ProvinceChipPicker
            value={trip.destinations}
            onChange={(next) => update({ destinations: next })}
            placeholder="VD: Hà Nội, Đà Nẵng, Hội An…"
          />
        </div>

        <div className="mt-8 space-y-6">
          <AnimatePresence initial={false}>
            {trip.days.map((day, dayIndex) => (
              <m.section
                key={dayIndex}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={spring.default}
                className="rounded-2xl border border-border bg-surface p-5 md:p-6"
              >
                <header className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-display text-h3 text-text">{day.label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-text-muted">
                      {day.placeSlugs.length} địa điểm
                    </span>
                    {trip.days.length > 1 && (
                      <IconButton
                        label="Xoá ngày"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(dayIndex)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    )}
                  </div>
                </header>

                {day.placeSlugs.length === 0 ? (
                  <p className="rounded-lg bg-surface-2/60 p-4 text-center text-body-sm text-text-muted">
                    Chưa có địa điểm — thêm bên dưới.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {day.placeSlugs.map((slug) => {
                      const place = allPlaces.find((p) => p.slug === slug);
                      if (!place) return null;
                      return (
                        <PlaceRow
                          key={slug}
                          place={place}
                          dayCount={trip.days.length}
                          currentDay={dayIndex}
                          onRemove={() => removePlace(dayIndex, slug)}
                          onMove={(target) => {
                            removePlace(dayIndex, slug);
                            addPlace(target, slug);
                          }}
                        />
                      );
                    })}
                  </ul>
                )}

                <AddPlaceToDay
                  excludeSlugs={trip.days.flatMap((d) => d.placeSlugs)}
                  destinations={trip.destinations}
                  onAdd={(slug) => addPlace(dayIndex, slug)}
                />

                <Link
                  href={`/explore?pickTrip=${trip.id}&pickDay=${dayIndex}`}
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-body-sm font-medium text-text-muted hover:border-brand-500 hover:bg-brand-50/30 hover:text-brand-700"
                >
                  <MapIcon size={14} /> Thêm từ bản đồ
                </Link>
              </m.section>
            ))}
          </AnimatePresence>

          <button
            type="button"
            onClick={addDay}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-5 text-body text-text-muted transition-colors hover:border-brand-500 hover:bg-brand-50/30 hover:text-brand-700"
          >
            <Plus size={16} /> Thêm ngày {trip.days.length + 1}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------- Row ---------- */

function PlaceRow({
  place,
  dayCount,
  currentDay,
  onRemove,
  onMove,
}: {
  place: PlaceItem;
  dayCount: number;
  currentDay: number;
  onRemove: () => void;
  onMove: (targetDay: number) => void;
}) {
  const cat = categoryByKey[place.category];
  const [moveOpen, setMoveOpen] = useState(false);
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
        <Image src={place.cover} alt={place.name} fill sizes="80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/place/${place.slug}`} className="line-clamp-1 text-body font-medium text-text hover:underline">
          {place.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5 text-body-sm text-text-muted">
          <span style={{ color: cat.color }}>{cat.labelVi}</span>
          <span>·</span>
          <MapPin size={11} />
          <span className="truncate">{place.province}</span>
        </div>
      </div>
      {dayCount > 1 && (
        <div className="relative">
          <IconButton
            label="Đổi ngày"
            variant="ghost"
            size="sm"
            onClick={() => setMoveOpen((v) => !v)}
          >
            <ArrowLeftRight size={14} />
          </IconButton>
          {moveOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-32 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
              {Array.from({ length: dayCount }, (_, i) => i)
                .filter((i) => i !== currentDay)
                .map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onMove(i);
                      setMoveOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-body-sm text-text hover:bg-surface-2"
                  >
                    → Ngày {i + 1}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
      <IconButton label="Xoá khỏi ngày" variant="ghost" size="sm" onClick={onRemove}>
        <Trash2 size={14} />
      </IconButton>
    </li>
  );
}

/* ---------- AddPlaceToDay ---------- */

function AddPlaceToDay({
  excludeSlugs,
  destinations,
  onAdd,
}: {
  excludeSlugs: string[];
  destinations?: string[];
  onAdd: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { saved } = useSaved();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"destinations" | "all">("destinations");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-body-sm font-medium text-text-muted hover:border-brand-500 hover:bg-brand-50/30 hover:text-brand-700"
      >
        <Plus size={14} /> Thêm địa điểm
      </button>
    );
  }

  const exclude = new Set(excludeSlugs);
  const hasDestinations = (destinations?.length ?? 0) > 0;

  // Map province slug → does it match a destination?
  const isInDestination = (province: string): boolean => {
    if (!hasDestinations) return true;
    const provSlug = provinceNameToSlug(province);
    return destinations!.includes(provSlug);
  };

  const q = query.trim().toLowerCase();
  const fromSaved = saved
    .map((s) => allPlaces.find((p) => p.slug === s))
    .filter(Boolean) as PlaceItem[];

  // Pool of available places (not yet in trip)
  let pool = allPlaces.filter((p) => !exclude.has(p.slug));

  // When destinations set + scope is "destinations", filter to those provinces
  if (hasDestinations && scope === "destinations") {
    pool = pool.filter((p) => isInDestination(p.province));
  }

  // Rank: saved-in-destination first → other in-destination by rating → rest by rating
  const ranked = [
    ...fromSaved.filter((p) => pool.includes(p) && isInDestination(p.province)),
    ...pool
      .filter((p) => !saved.includes(p.slug))
      .sort((a, b) => {
        if (hasDestinations) {
          const aIn = isInDestination(a.province) ? 0 : 1;
          const bIn = isInDestination(b.province) ? 0 : 1;
          if (aIn !== bIn) return aIn - bIn;
        }
        return b.rating - a.rating;
      }),
  ];

  const filtered = q
    ? ranked.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.province.toLowerCase().includes(q)
      )
    : ranked;

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2/40 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm địa điểm để thêm…"
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Đóng
        </Button>
      </div>

      {hasDestinations && (
        <div className="mt-2 flex items-center gap-1 text-caption">
          <button
            type="button"
            onClick={() => setScope("destinations")}
            aria-pressed={scope === "destinations"}
            className={
              scope === "destinations"
                ? "rounded-full bg-brand-500 px-2.5 py-1 font-medium text-white"
                : "rounded-full px-2.5 py-1 text-text-muted hover:bg-surface-2"
            }
          >
            Trong điểm đến
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            aria-pressed={scope === "all"}
            className={
              scope === "all"
                ? "rounded-full bg-text px-2.5 py-1 font-medium text-bg"
                : "rounded-full px-2.5 py-1 text-text-muted hover:bg-surface-2"
            }
          >
            Tất cả VN
          </button>
        </div>
      )}
      <ul className="mt-2 max-h-60 overflow-y-auto">
        {filtered.slice(0, 12).map((p) => {
          const cat = categoryByKey[p.category];
          return (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => {
                  onAdd(p.slug);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${cat.color} 16%, transparent)`,
                    color: cat.color,
                  }}
                >
                  •
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-text">{p.name}</span>
                  <span className="block truncate text-body-sm text-text-muted">
                    {cat.labelVi} · {p.province}
                  </span>
                </span>
                <Plus size={14} className="text-text-muted" />
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-4 text-center text-body-sm text-text-muted">
            Không có gợi ý
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * Convert place.province (display name like "Hà Nội") to provinces.ts slug
 * ("ha-noi") for destination matching.
 */
function provinceNameToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
