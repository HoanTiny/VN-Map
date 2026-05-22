"use client";
import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Upload,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/ui/toast";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/cn";
import {
  upsertTripTemplate,
  deleteTripTemplate,
  toggleTripTemplateEnabled,
  type TripTemplateInput,
} from "../actions";
import type { AdminTripTemplateRow } from "@/features/trip-template/lib/queries";

const SEASON_OPTIONS: { value: TripTemplateInput["season"]; label: string }[] = [
  { value: "any", label: "Quanh năm" },
  { value: "spring", label: "Xuân" },
  { value: "summer", label: "Hè" },
  { value: "autumn", label: "Thu" },
  { value: "winter", label: "Đông" },
  { value: "tet", label: "Tết" },
  { value: "national_day", label: "Lễ 2/9" },
];

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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-body-sm outline-none transition-colors focus:border-brand-500",
        props.className
      )}
    />
  );
}

function blank(): AdminTripTemplateRow {
  return {
    id: "",
    slug: "",
    title: "",
    summary: "",
    cover: "",
    duration_days: 1,
    season: "any",
    destinations: [],
    tags: [],
    days: [{ label: "Ngày 1", placeSlugs: [], note: "" }],
    display_order: 100,
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function TripTemplatesEditor({ initial }: { initial: AdminTripTemplateRow[] }) {
  const [rows, setRows] = useState(initial);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <TemplateCard
          key={row.id}
          row={row}
          onDelete={() => setRows((p) => p.filter((r) => r.id !== row.id))}
          onUpdate={(patch) =>
            setRows((p) => p.map((r) => (r.id === row.id ? { ...r, ...patch } : r)))
          }
        />
      ))}

      {creating ? (
        <TemplateCard
          key="__new"
          isNew
          row={blank()}
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
          <Plus size={16} /> Thêm template mới
        </button>
      )}
    </div>
  );
}

function TemplateCard({
  row,
  isNew,
  onDelete,
  onUpdate,
  onCreated,
}: {
  row: AdminTripTemplateRow;
  isNew?: boolean;
  onDelete: () => void;
  onUpdate?: (patch: Partial<AdminTripTemplateRow>) => void;
  onCreated?: (created: AdminTripTemplateRow) => void;
}) {
  const [open, setOpen] = useState<boolean>(isNew ?? false);
  const [draft, setDraft] = useState({
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    cover: row.cover,
    duration_days: row.duration_days,
    season: row.season,
    destinations: row.destinations.join(", "),
    tags: row.tags.join(", "),
    display_order: row.display_order,
    days: row.days.map((d) => ({
      label: d.label,
      note: d.note ?? "",
      placeSlugs: d.placeSlugs.join(", "),
    })),
  });
  const [uploading, setUploading] = useState(false);
  const [saving, startSaving] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const totalPlaces = draft.days.reduce(
    (n, d) => n + d.placeSlugs.split(",").filter((s) => s.trim()).length,
    0
  );

  const uploadCover = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `trips/${draft.slug || "new"}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error || !data) throw new Error(error?.message ?? "Upload thất bại");
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
      setDraft((d) => ({ ...d, cover: publicUrl }));
      toast.show("Đã upload cover", { variant: "success" });
    } catch (err) {
      toast.show("Lỗi upload: " + (err as Error).message, { variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = (): Partial<TripTemplateInput> => ({
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    cover: draft.cover.trim(),
    duration_days: Number(draft.duration_days) || draft.days.length,
    season: draft.season,
    destinations: draft.destinations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    tags: draft.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    display_order: Number(draft.display_order) || 100,
    days: draft.days.map((d) => ({
      label: d.label.trim(),
      note: d.note.trim() || undefined,
      placeSlugs: d.placeSlugs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })),
  });

  const handleSave = () => {
    const payload = buildPayload();
    if (isNew && (!payload.slug || !payload.title || !payload.cover)) {
      toast.show("Phải nhập slug + title + cover trước khi lưu", { variant: "warning" });
      return;
    }
    startSaving(async () => {
      try {
        await upsertTripTemplate(isNew ? null : row.id, payload);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
        toast.show(isNew ? "Đã tạo template" : `Đã lưu "${payload.title}"`, { variant: "success" });
        if (isNew && onCreated) {
          onCreated({
            ...row,
            ...(payload as Partial<AdminTripTemplateRow>),
            id: `temp-${Date.now()}`,
            updated_at: new Date().toISOString(),
          } as AdminTripTemplateRow);
        } else if (onUpdate) {
          onUpdate(payload as Partial<AdminTripTemplateRow>);
        }
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const handleDelete = () => {
    if (isNew) return onDelete();
    if (!confirm(`Xoá template "${row.title}"?`)) return;
    startSaving(async () => {
      try {
        await deleteTripTemplate(row.id);
        toast.show("Đã xoá", { variant: "success" });
        onDelete();
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const handleToggle = () => {
    startSaving(async () => {
      try {
        const next = !row.enabled;
        await toggleTripTemplateEnabled(row.id, next);
        onUpdate?.({ enabled: next });
        toast.show(next ? "Đã bật template" : "Đã ẩn template", { variant: "info" });
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const updateDay = (i: number, patch: Partial<(typeof draft.days)[number]>) =>
    setDraft((d) => ({
      ...d,
      days: d.days.map((day, idx) => (idx === i ? { ...day, ...patch } : day)),
    }));

  const addDay = () =>
    setDraft((d) => ({
      ...d,
      days: [...d.days, { label: `Ngày ${d.days.length + 1}`, note: "", placeSlugs: "" }],
    }));

  const removeDay = (i: number) =>
    setDraft((d) => ({ ...d, days: d.days.filter((_, idx) => idx !== i) }));

  const moveDay = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const next = [...d.days];
      const target = i + dir;
      if (target < 0 || target >= next.length) return d;
      [next[i], next[target]] = [next[target]!, next[i]!];
      return { ...d, days: next };
    });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-surface transition-colors",
        row.enabled === false && !isNew ? "border-border opacity-60" : "border-border"
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-2"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface-2">
          {draft.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.cover} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <span className="font-display text-h3 text-text">
          {draft.title || draft.slug || "(Chưa đặt tên)"}
        </span>
        {!isNew && (
          <Badge variant={row.enabled ? "success" : "neutral"}>
            {row.enabled ? "Hiện" : "Ẩn"}
          </Badge>
        )}
        <Badge variant="brand">
          {SEASON_OPTIONS.find((s) => s.value === draft.season)?.label ?? draft.season}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Calendar size={10} /> {draft.duration_days} ngày
        </Badge>
        <span className="text-caption text-text-subtle">
          {draft.days.length} ngày · {totalPlaces} địa điểm
        </span>

        <div className="ml-auto flex items-center gap-2">
          {!isNew && (
            <>
              <Link
                href={`/trips/${row.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption text-text-muted hover:bg-surface-2 hover:text-brand-600"
              >
                Xem <ExternalLink size={11} />
              </Link>
              <Button size="sm" variant="ghost" onClick={handleToggle} disabled={saving}>
                {row.enabled ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={saving}>
            <Trash2 size={14} /> {isNew ? "Huỷ" : ""}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : savedFlash ? <Check size={14} /> : <Save size={14} />}
            {saving ? "Lưu…" : savedFlash ? "Đã lưu" : "Lưu"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-5 p-4">
          {/* Cover preview + upload */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="shrink-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-2 md:w-72">
                {draft.cover ? (
                  <Image
                    src={draft.cover}
                    alt={draft.title}
                    fill
                    sizes="288px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-body-sm text-text-subtle">
                    Chưa có cover
                  </div>
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCover(f);
                    e.target.value = "";
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Đang tải…" : "Tải cover"}
                </Button>
              </div>
            </div>

            {/* Meta */}
            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Slug (không sửa sau khi tạo)">
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                  disabled={!isNew}
                  placeholder="ha-noi-tet-3-ngay"
                />
              </Field>
              <Field label="Tiêu đề">
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </Field>

              <Field label="Mùa">
                <select
                  value={draft.season}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, season: e.target.value as TripTemplateInput["season"] }))
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-sm"
                >
                  {SEASON_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Số ngày (auto theo days nếu để 0)">
                <Input
                  type="number"
                  value={draft.duration_days}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, duration_days: Number(e.target.value) }))
                  }
                />
              </Field>

              <Field label="URL cover">
                <Input
                  value={draft.cover}
                  onChange={(e) => setDraft((d) => ({ ...d, cover: e.target.value }))}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Display order">
                <Input
                  type="number"
                  value={draft.display_order}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, display_order: Number(e.target.value) }))
                  }
                />
              </Field>

              <Field label="Tóm tắt (1-2 câu)" className="md:col-span-2">
                <Textarea
                  rows={2}
                  value={draft.summary}
                  onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                />
              </Field>

              <Field label="Province slugs (CSV)">
                <Input
                  value={draft.destinations}
                  onChange={(e) => setDraft((d) => ({ ...d, destinations: e.target.value }))}
                  placeholder="ha-noi, quang-ninh"
                />
              </Field>
              <Field label="Tags (CSV)">
                <Input
                  value={draft.tags}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                  placeholder="phố cổ, ẩm thực, Tết"
                />
              </Field>
            </div>
          </div>

          {/* Days editor */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-text">Lịch trình từng ngày</span>
              <Button size="sm" variant="ghost" onClick={addDay}>
                <Plus size={14} /> Thêm ngày
              </Button>
            </div>

            <div className="space-y-3">
              {draft.days.map((day, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface-2/40 p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-display text-h3 text-brand-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Input
                      value={day.label}
                      onChange={(e) => updateDay(i, { label: e.target.value })}
                      placeholder={`Ngày ${i + 1}`}
                      className="max-w-xs"
                    />
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        onClick={() => moveDay(i, -1)}
                        disabled={i === 0}
                        className="rounded p-1 text-text-muted hover:bg-surface disabled:opacity-30"
                        aria-label="Lên"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDay(i, 1)}
                        disabled={i === draft.days.length - 1}
                        className="rounded p-1 text-text-muted hover:bg-surface disabled:opacity-30"
                        aria-label="Xuống"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => removeDay(i)}
                        className="rounded p-1 text-text-muted hover:bg-danger/10 hover:text-danger"
                        aria-label="Xoá ngày"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Textarea
                      rows={2}
                      value={day.note}
                      onChange={(e) => updateDay(i, { note: e.target.value })}
                      placeholder="Ghi chú cho ngày này (tuỳ chọn)"
                    />
                    <Input
                      value={day.placeSlugs}
                      onChange={(e) => updateDay(i, { placeSlugs: e.target.value })}
                      placeholder="Place slugs CSV: hanoi-old-quarter, cafe-giang, pho-bat-dan"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={"block " + (className ?? "")}>
      <span className="mb-1 block text-caption font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
