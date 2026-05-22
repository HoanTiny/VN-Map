"use client";
import { useMemo, useState, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Save, Upload, ExternalLink, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/ui/toast";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/cn";
import { categoryByKey, type CategoryKey } from "@/config/categories";

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
import { updatePlace, type PlacePatch } from "../actions";

export interface EditablePlace {
  id: string;
  slug: string;
  name: string;
  cover: string;
  province: string;
  province_slug: string;
  category: string;
  highlight: string | null;
  address: string | null;
  price_range: "$" | "$$" | "$$$" | "$$$$" | null;
  opening_hours: string | null;
  tags: string[] | null;
  source: "seed" | "community";
  rating: number;
  review_count: number;
  created_at: string;
}

interface Props {
  initialPlaces: EditablePlace[];
}

export function PlacesEditor({ initialPlaces }: Props) {
  const [places, setPlaces] = useState(initialPlaces);
  const [query, setQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");

  const provinces = useMemo(() => {
    const set = new Set(places.map((p) => p.province));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [places]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      if (provinceFilter && p.province !== provinceFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.includes(q)) return false;
      return true;
    });
  }, [places, query, provinceFilter]);

  const updateLocal = (id: string, patch: Partial<EditablePlace>) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc slug…"
            className="pl-9"
          />
        </div>
        <select
          value={provinceFilter}
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-body-sm"
        >
          <option value="">Tất cả tỉnh</option>
          {provinces.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className="ml-auto text-body-sm text-text-muted">
          {filtered.length} / {places.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((p) => (
          <PlaceRow key={p.id} place={p} onLocalUpdate={updateLocal} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface p-8 text-center text-body-sm text-text-muted">
            Không tìm thấy địa điểm phù hợp.
          </p>
        )}
      </div>
    </div>
  );
}

function PlaceRow({
  place,
  onLocalUpdate,
}: {
  place: EditablePlace;
  onLocalUpdate: (id: string, patch: Partial<EditablePlace>) => void;
}) {
  const [draft, setDraft] = useState({
    name: place.name,
    cover: place.cover,
    highlight: place.highlight ?? "",
    address: place.address ?? "",
    category: place.category,
    province: place.province,
    price_range: place.price_range ?? "",
    opening_hours: place.opening_hours ?? "",
    tags: (place.tags ?? []).join(", "),
  });
  const [uploading, setUploading] = useState(false);
  const [saving, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const dirty =
    draft.name !== place.name ||
    draft.cover !== place.cover ||
    draft.highlight !== (place.highlight ?? "") ||
    draft.address !== (place.address ?? "") ||
    draft.category !== place.category ||
    draft.province !== place.province ||
    draft.price_range !== (place.price_range ?? "") ||
    draft.opening_hours !== (place.opening_hours ?? "") ||
    draft.tags !== (place.tags ?? []).join(", ");

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `places/${place.slug}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error || !data) throw new Error(error?.message ?? "Upload thất bại");
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(data.path);
      setDraft((d) => ({ ...d, cover: publicUrl }));
      toast.show("Đã upload ảnh", { variant: "success" });
    } catch (err) {
      toast.show("Lỗi upload: " + (err as Error).message, { variant: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const patch: PlacePatch = {
      name: draft.name,
      cover: draft.cover,
      highlight: draft.highlight || null,
      address: draft.address || null,
      category: draft.category,
      province: draft.province,
      price_range: (draft.price_range || null) as PlacePatch["price_range"],
      opening_hours: draft.opening_hours || null,
      tags: draft.tags
        ? draft.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
    };
    startTransition(async () => {
      try {
        await updatePlace(place.id, patch);
        onLocalUpdate(place.id, {
          ...patch,
          tags: patch.tags as string[] | null,
        } as Partial<EditablePlace>);
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1500);
        toast.show(`Đã lưu "${draft.name}"`, { variant: "success" });
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  const cat = categoryByKey[draft.category as CategoryKey];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-col gap-4 p-4 md:flex-row">
        {/* Cover preview + upload */}
        <div className="shrink-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2 md:w-48">
            {draft.cover ? (
              <Image
                src={draft.cover}
                alt={draft.name}
                fill
                sizes="192px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-body-sm text-text-subtle">
                Chưa có ảnh
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
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? "Đang tải…" : "Tải ảnh"}
            </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Tên">
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </Field>

          <Field label="URL ảnh cover">
            <Input
              value={draft.cover}
              onChange={(e) => setDraft((d) => ({ ...d, cover: e.target.value }))}
              placeholder="https://…"
            />
          </Field>

          <Field label="Tỉnh">
            <Input
              value={draft.province}
              onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}
            />
          </Field>

          <Field label="Danh mục">
            <select
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-sm"
            >
              {Object.entries(categoryByKey).map(([key, c]) => (
                <option key={key} value={key}>
                  {c.labelVi || c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Địa chỉ" className="md:col-span-2">
            <Input
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            />
          </Field>

          <Field label="Mô tả nổi bật" className="md:col-span-2">
            <textarea
              value={draft.highlight}
              onChange={(e) => setDraft((d) => ({ ...d, highlight: e.target.value }))}
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-body-sm"
            />
          </Field>

          <Field label="Giờ mở cửa">
            <Input
              value={draft.opening_hours}
              onChange={(e) => setDraft((d) => ({ ...d, opening_hours: e.target.value }))}
              placeholder="08:00 – 22:00"
            />
          </Field>

          <Field label="Giá">
            <select
              value={draft.price_range}
              onChange={(e) => setDraft((d) => ({ ...d, price_range: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-sm"
            >
              <option value="">—</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
              <option value="$$$$">$$$$</option>
            </select>
          </Field>

          <Field label="Tags (phân tách bằng dấu phẩy)" className="md:col-span-2">
            <Input
              value={draft.tags}
              onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
              placeholder="rooftop, view biển, lãng mạn"
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border bg-surface-2/40 px-4 py-2.5">
        <Badge variant={place.source === "seed" ? "neutral" : "brand"}>
          {place.source === "seed" ? "Seed" : "Cộng đồng"}
        </Badge>
        {cat && <Badge variant="outline">{cat.labelVi || cat.label}</Badge>}
        <span className="text-caption text-text-subtle">
          ⭐ {place.rating.toFixed(1)} · {place.review_count} reviews
        </span>
        <Link
          href={`/place/${place.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-brand-600"
        >
          Xem trang <ExternalLink size={11} />
        </Link>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="ml-auto"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : savedFlash ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Đang lưu…" : savedFlash ? "Đã lưu" : "Lưu"}
        </Button>
      </div>
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
