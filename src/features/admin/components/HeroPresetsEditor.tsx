"use client";
import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  Sun,
  Sunset as SunsetIcon,
  Moon,
  Eye,
  EyeOff,
  Star,
  Pencil,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/ui/toast";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/cn";
import {
  upsertHeroPreset,
  deleteHeroPreset,
  toggleHeroPresetEnabled,
  type HeroPresetInput,
} from "../actions";
import type {
  HeroPresetRow,
  HeroRegionPresets,
  HeroTimeOfDayPreset,
} from "../lib/hero-presets-queries";

const TIME_OPTIONS = [
  { key: "day", label: "Ngày", icon: Sun },
  { key: "sunset", label: "Hoàng hôn", icon: SunsetIcon },
  { key: "night", label: "Đêm", icon: Moon },
] as const;

type TimeOfDay = "day" | "sunset" | "night";

const OVERLAY_DEFAULTS: Record<TimeOfDay, string> = {
  day: "from-black/35 via-black/10 to-transparent",
  sunset: "from-black/40 via-black/12 to-transparent",
  night: "from-black/50 via-black/15 to-transparent",
};

const EMPTY_PRESET: HeroTimeOfDayPreset = { images: [], overlay: "" };

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-sm outline-none transition-colors focus:border-brand-500",
        props.className
      )}
    />
  );
}

export function HeroPresetsEditor({ initial }: { initial: HeroPresetRow[] }) {
  const [rows, setRows] = useState(initial);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <PresetCard
          key={row.id}
          row={row}
          onDelete={() => setRows((p) => p.filter((r) => r.id !== row.id))}
          onUpdate={(patch) =>
            setRows((p) => p.map((r) => (r.id === row.id ? { ...r, ...patch } : r)))
          }
        />
      ))}

      {creating ? (
        <PresetCard
          key="__new"
          isNew
          row={makeBlankRow()}
          onDelete={() => setCreating(false)}
          onCreated={(created) => {
            setRows((p) => [...p, created]);
            setCreating(false);
          }}
        />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/50 px-4 py-6 text-body-sm font-medium text-text-muted transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          <Plus size={16} /> Thêm preset mới
        </button>
      )}
    </div>
  );
}

function makeBlankRow(): HeroPresetRow {
  return {
    id: "",
    region: "",
    label: "",
    match_keywords: [],
    is_default: false,
    enabled: true,
    display_order: 100,
    updated_at: new Date().toISOString(),
    presets: {
      day: { images: [], overlay: OVERLAY_DEFAULTS.day },
      sunset: { images: [], overlay: OVERLAY_DEFAULTS.sunset },
      night: { images: [], overlay: OVERLAY_DEFAULTS.night },
    },
  };
}

function PresetCard({
  row,
  isNew,
  onDelete,
  onUpdate,
  onCreated,
}: {
  row: HeroPresetRow;
  isNew?: boolean;
  onDelete: () => void;
  onUpdate?: (patch: Partial<HeroPresetRow>) => void;
  onCreated?: (created: HeroPresetRow) => void;
}) {
  const [open, setOpen] = useState<boolean>(isNew ?? false);
  const [draft, setDraft] = useState({
    region: row.region,
    label: row.label,
    match_keywords: row.match_keywords.join(", "),
    display_order: row.display_order,
    is_default: row.is_default,
    presets: row.presets,
  });
  const [saving, startSaving] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const toast = useToast();

  const totalImages =
    (draft.presets.day?.images.length ?? 0) +
    (draft.presets.sunset?.images.length ?? 0) +
    (draft.presets.night?.images.length ?? 0);

  const handleSave = () => {
    const patch: Partial<HeroPresetInput> = {
      region: draft.region.trim(),
      label: draft.label.trim(),
      match_keywords: draft.match_keywords
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      display_order: Number(draft.display_order) || 100,
      is_default: draft.is_default,
      presets: draft.presets,
    };

    if (isNew && (!patch.region || !patch.label)) {
      toast.show("Phải nhập region và label trước khi lưu", { variant: "warning" });
      return;
    }

    startSaving(async () => {
      try {
        await upsertHeroPreset(isNew ? null : row.id, patch);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
        toast.show(isNew ? "Đã tạo preset" : `Đã lưu "${patch.label}"`, { variant: "success" });

        if (isNew && onCreated) {
          // Optimistic: pretend new row appended; user will see fresh data after reload.
          onCreated({
            ...row,
            ...(patch as HeroPresetRow),
            id: `temp-${Date.now()}`,
            updated_at: new Date().toISOString(),
          });
        } else if (onUpdate) {
          onUpdate({
            region: patch.region!,
            label: patch.label!,
            match_keywords: patch.match_keywords ?? [],
            display_order: patch.display_order ?? 100,
            is_default: patch.is_default ?? false,
            presets: patch.presets!,
          });
        }
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const handleDelete = () => {
    if (isNew) return onDelete();
    if (!confirm(`Xoá preset "${row.label}"?`)) return;
    startSaving(async () => {
      try {
        await deleteHeroPreset(row.id);
        toast.show("Đã xoá", { variant: "success" });
        onDelete();
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const handleToggleEnabled = () => {
    startSaving(async () => {
      try {
        const next = !row.enabled;
        await toggleHeroPresetEnabled(row.id, next);
        onUpdate?.({ enabled: next });
        toast.show(next ? "Đã bật preset" : "Đã ẩn preset", { variant: "info" });
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const updateTimePreset = (time: TimeOfDay, patch: Partial<HeroTimeOfDayPreset>) => {
    setDraft((d) => ({
      ...d,
      presets: {
        ...d.presets,
        [time]: { ...(d.presets[time] ?? EMPTY_PRESET), ...patch },
      } as HeroRegionPresets,
    }));
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-surface transition-colors",
        row.enabled === false && !isNew ? "border-border opacity-60" : "border-border"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-2"
          aria-label={open ? "Thu gọn" : "Mở rộng"}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="font-display text-h3 text-text">
          {draft.label || draft.region || "(Chưa đặt tên)"}
        </span>
        {draft.is_default && (
          <Badge variant="brand" className="gap-1">
            <Star size={10} className="fill-current" /> Mặc định
          </Badge>
        )}
        {!isNew && (
          <Badge variant={row.enabled ? "success" : "neutral"}>
            {row.enabled ? "Hiển thị" : "Đã ẩn"}
          </Badge>
        )}
        <span className="text-caption text-text-subtle">{totalImages} ảnh</span>
        <span className="text-caption text-text-subtle">
          {draft.region ? `key: ${draft.region}` : "—"}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {!isNew && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleEnabled}
              disabled={saving}
            >
              {row.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
              {row.enabled ? "Ẩn" : "Hiện"}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={saving}>
            <Trash2 size={14} />
            {isNew ? "Huỷ" : "Xoá"}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : savedFlash ? <Check size={14} /> : <Save size={14} />}
            {saving ? "Đang lưu" : savedFlash ? "Đã lưu" : "Lưu"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-5 p-4">
          {/* Meta fields */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-caption font-medium text-text-muted">Region (key)</span>
              <Input
                value={draft.region}
                onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                placeholder="hanoi / hue / phuquoc…"
                disabled={!isNew}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-caption font-medium text-text-muted">Label hiển thị</span>
              <Input
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="Hà Nội"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-caption font-medium text-text-muted">Display order</span>
              <Input
                type="number"
                value={draft.display_order}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, display_order: Number(e.target.value) }))
                }
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                checked={draft.is_default}
                onChange={(e) => setDraft((d) => ({ ...d, is_default: e.target.checked }))}
                className="size-4"
              />
              <span className="text-body-sm">Là preset mặc định</span>
            </label>
            <label className="block md:col-span-2 lg:col-span-4">
              <span className="mb-1 block text-caption font-medium text-text-muted">
                Match keywords (CSV, lowercase) — IP geolocation hits sẽ map sang preset này
              </span>
              <Input
                value={draft.match_keywords}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, match_keywords: e.target.value }))
                }
                placeholder="ha noi, hanoi"
              />
            </label>
          </div>

          {/* Time-of-day editors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {TIME_OPTIONS.map(({ key, label, icon: Icon }) => (
              <TimeOfDayEditor
                key={key}
                title={label}
                icon={<Icon size={14} />}
                preset={draft.presets[key] ?? { ...EMPTY_PRESET, overlay: OVERLAY_DEFAULTS[key] }}
                onChange={(patch) => updateTimePreset(key, patch)}
                slug={draft.region || "new"}
                tod={key}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeOfDayEditor({
  title,
  icon,
  preset,
  onChange,
  slug,
  tod,
}: {
  title: string;
  icon: React.ReactNode;
  preset: HeroTimeOfDayPreset;
  onChange: (patch: Partial<HeroTimeOfDayPreset>) => void;
  slug: string;
  tod: TimeOfDay;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `hero/${slug || "preset"}-${tod}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error || !data) throw new Error(error?.message ?? "Upload thất bại");
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
      onChange({ images: [...preset.images, { src: publicUrl, alt: file.name }] });
      toast.show("Đã thêm ảnh", { variant: "success" });
    } catch (err) {
      toast.show("Lỗi upload: " + (err as Error).message, { variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = window.prompt("Dán URL ảnh:");
    if (!url) return;
    const alt = window.prompt("Mô tả ngắn (alt text):") ?? "";
    onChange({ images: [...preset.images, { src: url, alt }] });
  };

  const removeAt = (idx: number) => {
    onChange({ images: preset.images.filter((_, i) => i !== idx) });
  };

  const updateAt = (idx: number, patch: Partial<{ src: string; alt: string }>) => {
    onChange({
      images: preset.images.map((img, i) => (i === idx ? { ...img, ...patch } : img)),
    });
  };

  const moveAt = (idx: number, dir: -1 | 1) => {
    const next = [...preset.images];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target]!, next[idx]!];
    onChange({ images: next });
  };

  const replaceFile = async (idx: number, file: File) => {
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `hero/${slug || "preset"}-${tod}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error || !data) throw new Error(error?.message ?? "Upload thất bại");
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
      updateAt(idx, { src: publicUrl });
      toast.show("Đã thay ảnh", { variant: "success" });
    } catch (err) {
      toast.show("Lỗi upload: " + (err as Error).message, { variant: "danger" });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="font-medium text-text">{title}</span>
        <span className="ml-auto text-caption text-text-subtle">{preset.images.length} ảnh</span>
      </div>

      <div className="space-y-2">
        {preset.images.map((img, i) => (
          <ImageRow
            key={`${i}-${img.src}`}
            image={img}
            index={i}
            total={preset.images.length}
            onUpdate={(patch) => updateAt(i, patch)}
            onRemove={() => removeAt(i)}
            onReplace={(file) => replaceFile(i, file)}
            onMove={(dir) => moveAt(i, dir)}
          />
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Tải ảnh
        </Button>
        <Button size="sm" variant="ghost" onClick={addUrl}>
          <Plus size={14} /> URL
        </Button>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-caption font-medium text-text-muted">Overlay gradient</span>
        <Input
          value={preset.overlay}
          onChange={(e) => onChange({ overlay: e.target.value })}
          placeholder="from-black/35 via-black/10 to-transparent"
          className="text-caption"
        />
      </label>
    </div>
  );
}

function ImageRow({
  image,
  index,
  total,
  onUpdate,
  onRemove,
  onReplace,
  onMove,
}: {
  image: { src: string; alt: string };
  index: number;
  total: number;
  onUpdate: (patch: Partial<{ src: string; alt: string }>) => void;
  onRemove: () => void;
  onReplace: (file: File) => Promise<void> | void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(image.src);
  const [replacing, setReplacing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const commitUrl = () => {
    const next = urlDraft.trim();
    if (next && next !== image.src) {
      onUpdate({ src: next });
      setImgError(false);
    } else {
      setUrlDraft(image.src);
    }
    setEditingUrl(false);
  };

  const cancelEdit = () => {
    setUrlDraft(image.src);
    setEditingUrl(false);
  };

  return (
    <div className="flex gap-2 rounded-lg bg-surface p-2 ring-1 ring-border">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-surface-2">
        {imgError || !image.src ? (
          <div className="flex h-full w-full items-center justify-center text-caption text-text-subtle">
            ?
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <Input
          value={image.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Mô tả ngắn (alt text)"
          className="py-1 text-caption"
        />

        {editingUrl ? (
          <div className="flex gap-1">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitUrl();
                if (e.key === "Escape") cancelEdit();
              }}
              placeholder="https://…"
              className="py-1 text-caption"
              autoFocus
            />
            <button
              onClick={commitUrl}
              className="rounded-md bg-brand-500 px-2 text-white hover:bg-brand-600"
              aria-label="Lưu URL"
            >
              <Check size={12} />
            </button>
            <button
              onClick={cancelEdit}
              className="rounded-md bg-surface-2 px-2 text-text-muted hover:bg-surface"
              aria-label="Huỷ"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setUrlDraft(image.src);
              setEditingUrl(true);
            }}
            className="group flex w-full items-center gap-1.5 text-left text-caption text-text-subtle hover:text-brand-600"
            title="Click để sửa URL"
          >
            <Pencil size={10} className="shrink-0 opacity-50 group-hover:opacity-100" />
            <span className="truncate">{image.src}</span>
          </button>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <button
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="rounded p-0.5 text-text-muted hover:bg-surface-2 disabled:opacity-30"
          aria-label="Di chuyển lên"
          title="Lên"
        >
          <ArrowUp size={12} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          className="rounded p-0.5 text-text-muted hover:bg-surface-2 disabled:opacity-30"
          aria-label="Di chuyển xuống"
          title="Xuống"
        >
          <ArrowDown size={12} />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setReplacing(true);
            try {
              await onReplace(f);
              setImgError(false);
            } finally {
              setReplacing(false);
              e.target.value = "";
            }
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={replacing}
          className="rounded-md p-1 text-text-muted hover:bg-brand-500/10 hover:text-brand-600 disabled:opacity-50"
          aria-label="Thay ảnh"
          title="Thay ảnh từ máy"
        >
          {replacing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
        </button>
        <button
          onClick={onRemove}
          className="rounded-md p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
          aria-label="Xoá ảnh"
          title="Xoá"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// Image is imported but not used in render — kept for future thumbnail Next/Image swap.
void Image;
