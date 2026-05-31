"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Trash2,
  ArrowLeftRight,
  MapPin,
  Map as MapIcon,
  GripVertical,
  Pencil,
  Share2,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { Badge } from "@/ui/badge";
import { spring } from "@/lib/motion";
import { useTrip } from "../hooks/useTrips";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { allPlaces, type PlaceItem } from "@/features/map/lib/places-data";
import { categoryByKey } from "@/config/categories";
import { ProvinceChipPicker } from "./ProvinceChipPicker";
import { useToast } from "@/ui/toast";

export function TripPlanner({ tripId }: { tripId: string }) {
  const t = useTranslations("TripPlanner");
  const router = useRouter();
  const {
    trip,
    hydrated,
    addPlace,
    removePlace,
    reorderPlace,
    reorderDay,
    updatePlaceNote,
    addDay,
    removeDay,
    update,
    remove,
  } = useTrip(tripId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();

  const daySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!hydrated) {
    return <div className="container py-24 text-body-sm text-text-muted">{t("loading")}</div>;
  }
  if (!trip) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-h2 text-text">{t("notFound")}</p>
        <Button className="mt-4" asChild>
          <Link href="/trip">
            <ChevronLeft size={16} /> {t("backToList")}
          </Link>
        </Button>
      </div>
    );
  }

  const deleteTripAndExit = () => {
    remove();
    router.push("/trip");
  };

  async function handleShareTrip() {
    if (!trip) return;
    const lines: string[] = [`🗺️ ${trip.name}`];
    if (trip.destinations.length) {
      lines.push(`📍 ${t("shareDestinations")}: ${trip.destinations.join(", ")}`);
    }
    lines.push("");
    trip.days.forEach((day) => {
      lines.push(`📅 ${day.label}`);
      day.placeSlugs.forEach((slug) => {
        const place = allPlaces.find((p) => p.slug === slug);
        if (!place) return;
        lines.push(`  • ${place.name}`);
        const note = day.placeNotes?.[slug];
        if (note) lines.push(`    ✏️ ${note}`);
      });
      lines.push("");
    });
    lines.push(`— ${t("shareVia")} Map-VN: ${window.location.href}`);
    const text = lines.join("\n");
    if (navigator.share) {
      await navigator.share({ title: trip.name, text }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text);
      toast.show(t("shareCopied"), { variant: "success" });
    }
  }

  function handleDayDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = trip!.days.findIndex((_, i) => `day-${i}` === active.id);
    const toIndex = trip!.days.findIndex((_, i) => `day-${i}` === over.id);
    if (fromIndex !== -1 && toIndex !== -1) reorderDay(fromIndex, toIndex);
  }

  const dayIds = trip.days.map((_, i) => `day-${i}`);

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <div className="flex items-center gap-1 text-body-sm text-text-muted">
          <Link href="/trip" className="hover:text-text">{t("tripsCrumb")}</Link>
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
              placeholder={t("descPlaceholder")}
              rows={1}
              className="mt-2 w-full resize-none bg-transparent text-body-lg text-text-muted outline-none focus:bg-surface-2/40 focus:ring-2 focus:ring-brand-500 rounded-md px-1 -ml-1"
              maxLength={300}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShareTrip}>
              <Share2 size={14} /> {t("shareTrip")}
            </Button>
            {!confirmDelete ? (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={14} /> {t("deleteTrip")}
              </Button>
            ) : (
              <>
                <span className="text-body-sm text-text-muted">{t("confirmDelete")}</span>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={deleteTripAndExit}>
                  {t("delete")}
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-body-sm text-text-muted">
          <Badge variant="neutral">{t("daysCount", { count: trip.days.length })}</Badge>
          <Badge variant="neutral">
            {t("placesCount", { count: trip.days.reduce((sum, d) => sum + d.placeSlugs.length, 0) })}
          </Badge>
        </div>

        {/* Destinations picker */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 md:p-6">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="font-display text-h3 text-text">{t("destinationsTitle")}</h3>
            <span className="text-caption text-text-muted">{t("destinationsHint")}</span>
          </div>
          <ProvinceChipPicker
            value={trip.destinations}
            onChange={(next) => update({ destinations: next })}
            placeholder={t("destinationsPlaceholder")}
          />
        </div>

        {/* Days — outer DndContext for reordering days */}
        <DndContext sensors={daySensors} collisionDetection={closestCenter} onDragEnd={handleDayDragEnd}>
          <SortableContext items={dayIds} strategy={verticalListSortingStrategy}>
            <div className="mt-8 space-y-6">
              <AnimatePresence initial={false}>
                {trip.days.map((day, dayIndex) => (
                  <SortableDaySection
                    key={`day-${dayIndex}`}
                    id={`day-${dayIndex}`}
                    day={day}
                    dayIndex={dayIndex}
                    dayCount={trip.days.length}
                    tripId={trip.id}
                    allExcluded={trip.days.flatMap((d) => d.placeSlugs)}
                    destinations={trip.destinations}
                    onRemoveDay={() => removeDay(dayIndex)}
                    onAddPlace={(slug) => addPlace(dayIndex, slug)}
                    onRemovePlace={(slug) => removePlace(dayIndex, slug)}
                    onMovePlace={(slug, target) => { removePlace(dayIndex, slug); addPlace(target, slug); }}
                    onReorderPlace={(from, to) => reorderPlace(dayIndex, from, to)}
                    onUpdateNote={(slug, note) => updatePlaceNote(dayIndex, slug, note)}
                  />
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addDay}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface p-5 text-body text-text-muted transition-colors hover:border-brand-500 hover:bg-brand-50/30 hover:text-brand-700"
              >
                <Plus size={16} /> {t("addDay", { n: trip.days.length + 1 })}
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </article>
  );
}

/* ---------- SortableDaySection ---------- */

function SortableDaySection({
  id,
  day,
  dayIndex,
  dayCount,
  tripId,
  allExcluded,
  destinations,
  onRemoveDay,
  onAddPlace,
  onRemovePlace,
  onMovePlace,
  onReorderPlace,
  onUpdateNote,
}: {
  id: string;
  day: { label: string; placeSlugs: string[]; placeNotes?: Record<string, string> };
  dayIndex: number;
  dayCount: number;
  tripId: string;
  allExcluded: string[];
  destinations?: string[];
  onRemoveDay: () => void;
  onAddPlace: (slug: string) => void;
  onRemovePlace: (slug: string) => void;
  onMovePlace: (slug: string, targetDay: number) => void;
  onReorderPlace: (from: number, to: number) => void;
  onUpdateNote: (slug: string, note: string) => void;
}) {
  const t = useTranslations("TripPlanner");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const placeSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handlePlaceDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = day.placeSlugs.indexOf(active.id as string);
    const toIndex = day.placeSlugs.indexOf(over.id as string);
    if (fromIndex !== -1 && toIndex !== -1) onReorderPlace(fromIndex, toIndex);
  }

  return (
    <m.section
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={spring.default}
      className="rounded-2xl border border-border bg-surface p-5 md:p-6"
    >
      <header className="mb-4 flex items-center gap-3">
        {/* Day drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={t("dragDay")}
          className="shrink-0 cursor-grab touch-none rounded p-1 text-text-muted opacity-40 hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>

        <h3 className="flex-1 font-display text-h3 text-text">{day.label}</h3>

        <div className="flex items-center gap-2">
          <span className="text-body-sm text-text-muted">
            {t("placesCount", { count: day.placeSlugs.length })}
          </span>
          {dayCount > 1 && (
            <IconButton label={t("removeDay")} variant="ghost" size="sm" onClick={onRemoveDay}>
              <Trash2 size={14} />
            </IconButton>
          )}
        </div>
      </header>

      {day.placeSlugs.length === 0 ? (
        <p className="rounded-lg bg-surface-2/60 p-4 text-center text-body-sm text-text-muted">
          {t("emptyDay")}
        </p>
      ) : (
        <DndContext sensors={placeSensors} collisionDetection={closestCenter} onDragEnd={handlePlaceDragEnd}>
          <SortableContext items={day.placeSlugs} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {day.placeSlugs.map((slug) => {
                const place = allPlaces.find((p) => p.slug === slug);
                if (!place) return null;
                return (
                  <SortablePlaceRow
                    key={slug}
                    place={place}
                    note={day.placeNotes?.[slug] ?? ""}
                    dayCount={dayCount}
                    currentDay={dayIndex}
                    onRemove={() => onRemovePlace(slug)}
                    onMove={(target) => onMovePlace(slug, target)}
                    onUpdateNote={(note) => onUpdateNote(slug, note)}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <AddPlaceToDay
        excludeSlugs={allExcluded}
        destinations={destinations}
        onAdd={onAddPlace}
      />

      <Link
        href={`/explore?pickTrip=${tripId}&pickDay=${dayIndex}`}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-body-sm font-medium text-text-muted hover:border-brand-500 hover:bg-brand-50/30 hover:text-brand-700"
      >
        <MapIcon size={14} /> {t("addFromMap")}
      </Link>
    </m.section>
  );
}

/* ---------- SortablePlaceRow ---------- */

function SortablePlaceRow(props: {
  place: PlaceItem;
  note: string;
  dayCount: number;
  currentDay: number;
  onRemove: () => void;
  onMove: (targetDay: number) => void;
  onUpdateNote: (note: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.place.slug,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <PlaceRow {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </li>
  );
}

/* ---------- PlaceRow ---------- */

function PlaceRow({
  place,
  note,
  dayCount,
  currentDay,
  onRemove,
  onMove,
  onUpdateNote,
  dragHandleProps,
}: {
  place: PlaceItem;
  note: string;
  dayCount: number;
  currentDay: number;
  onRemove: () => void;
  onMove: (targetDay: number) => void;
  onUpdateNote: (note: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const t = useTranslations("TripPlanner");
  const locale = useLocale();
  const cat = categoryByKey[place.category];
  const catLabel = locale === "en" ? cat.label : cat.labelVi;
  const [moveOpen, setMoveOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(!!note);
  const [draft, setDraft] = useState(note);

  return (
    <div className="rounded-xl border border-border bg-bg overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          type="button"
          aria-label={t("dragPlace")}
          {...dragHandleProps}
          className="shrink-0 cursor-grab touch-none rounded p-1 text-text-muted opacity-30 hover:opacity-70 active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>

        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={place.cover} alt={place.name} fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/place/${place.slug}`} className="line-clamp-1 text-body font-medium text-text hover:underline">
            {place.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 text-body-sm text-text-muted">
            <span style={{ color: cat.color }}>{catLabel}</span>
            <span>·</span>
            <MapPin size={11} />
            <span className="truncate">{place.province}</span>
          </div>
          {note && !noteOpen && (
            <p className="mt-1 line-clamp-1 text-caption text-text-muted italic">✏️ {note}</p>
          )}
        </div>

        <IconButton
          label={t("addNote")}
          variant="ghost"
          size="sm"
          onClick={() => setNoteOpen((v) => !v)}
          className={note ? "text-brand-500" : ""}
        >
          <Pencil size={14} />
        </IconButton>

        {dayCount > 1 && (
          <div className="relative">
            <IconButton
              label={t("moveDay")}
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
                      onClick={() => { onMove(i); setMoveOpen(false); }}
                      className="block w-full px-3 py-2 text-left text-body-sm text-text hover:bg-surface-2"
                    >
                      {t("moveToDay", { n: i + 1 })}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
        <IconButton label={t("removeFromDay")} variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 size={14} />
        </IconButton>
      </div>

      {/* Inline note editor */}
      {noteOpen && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onUpdateNote(draft.trim())}
            placeholder={t("notePlaceholder")}
            maxLength={120}
            className="w-full rounded-md bg-surface-2/60 px-3 py-1.5 text-body-sm text-text outline-none focus:ring-1 focus:ring-brand-500/40 placeholder:text-text-muted"
          />
        </div>
      )}
    </div>
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
  const t = useTranslations("TripPlanner");
  const locale = useLocale();
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
        <Plus size={14} /> {t("addPlace")}
      </button>
    );
  }

  const exclude = new Set(excludeSlugs);
  const hasDestinations = (destinations?.length ?? 0) > 0;

  const isInDestination = (province: string): boolean => {
    if (!hasDestinations) return true;
    const provSlug = provinceNameToSlug(province);
    return destinations!.includes(provSlug);
  };

  const q = query.trim().toLowerCase();
  const fromSaved = saved
    .map((s) => allPlaces.find((p) => p.slug === s))
    .filter(Boolean) as PlaceItem[];

  let pool = allPlaces.filter((p) => !exclude.has(p.slug));
  if (hasDestinations && scope === "destinations") {
    pool = pool.filter((p) => isInDestination(p.province));
  }

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
    ? ranked.filter((p) => p.name.toLowerCase().includes(q) || p.province.toLowerCase().includes(q))
    : ranked;

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2/40 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("close")}
        </Button>
      </div>

      {hasDestinations && (
        <div className="mt-2 flex items-center gap-1 text-caption">
          <button
            type="button"
            onClick={() => setScope("destinations")}
            aria-pressed={scope === "destinations"}
            className={scope === "destinations" ? "rounded-full bg-brand-500 px-2.5 py-1 font-medium text-white" : "rounded-full px-2.5 py-1 text-text-muted hover:bg-surface-2"}
          >
            {t("scopeDestination")}
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            aria-pressed={scope === "all"}
            className={scope === "all" ? "rounded-full bg-text px-2.5 py-1 font-medium text-bg" : "rounded-full px-2.5 py-1 text-text-muted hover:bg-surface-2"}
          >
            {t("scopeAll")}
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
                onClick={() => { onAdd(p.slug); setQuery(""); }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-caption"
                  style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 16%, transparent)`, color: cat.color }}
                >
                  •
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body text-text">{p.name}</span>
                  <span className="block truncate text-body-sm text-text-muted">
                    {locale === "en" ? cat.label : cat.labelVi} · {p.province}
                  </span>
                </span>
                <Plus size={14} className="text-text-muted" />
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-4 text-center text-body-sm text-text-muted">{t("noSuggestions")}</li>
        )}
      </ul>
    </div>
  );
}

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
