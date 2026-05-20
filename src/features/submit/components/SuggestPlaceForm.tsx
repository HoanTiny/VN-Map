"use client";
import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, ImagePlus, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { transition, spring } from "@/lib/motion";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";
import { categories, type CategoryKey } from "@/config/categories";
import { provinces, provinceBySlug, closestProvince } from "@/config/regions";
import { useSubmissions } from "../hooks/useSubmissions";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1_500_000;

const PRICE_OPTIONS: Array<{ value: "$" | "$$" | "$$$" | "$$$$"; label: string }> = [
  { value: "$", label: "$ Bình dân" },
  { value: "$$", label: "$$ Trung bình" },
  { value: "$$$", label: "$$$ Cao cấp" },
  { value: "$$$$", label: "$$$$ Sang trọng" },
];

export interface SuggestPlaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional preset — when triggered from a province page, pre-fill province. */
  initialProvinceSlug?: string;
  /** Optional preset — when triggered from a category page. */
  initialCategory?: CategoryKey;
  /** Optional preset — when triggered by "pick on map" flow. Auto-detects province. */
  initialCoords?: { lng: number; lat: number };
  onSubmitted?: () => void;
}

export function SuggestPlaceForm({
  open,
  onOpenChange,
  initialProvinceSlug,
  initialCategory,
  initialCoords,
  onSubmitted,
}: SuggestPlaceFormProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { add } = useSubmissions();
  const { show: showToast } = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryKey | "">(initialCategory ?? "");
  const [provinceSlug, setProvinceSlug] = useState(initialProvinceSlug ?? "");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [lng, setLng] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [priceRange, setPriceRange] = useState<"" | "$" | "$$" | "$$$" | "$$$$">("");
  const [openingHours, setOpeningHours] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submittedBy, setSubmittedBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill coords from selected province if blank
  useEffect(() => {
    if (!provinceSlug) return;
    const prov = provinceBySlug[provinceSlug];
    if (prov && lng === "" && lat === "") {
      setLng(prov.center[0].toFixed(4));
      setLat(prov.center[1].toFixed(4));
    }
  }, [provinceSlug, lng, lat]);

  // Apply initialCoords from "pick on map" flow — runs each time the dialog
  // opens with new coords. Auto-detects closest province by haversine.
  useEffect(() => {
    if (!open || !initialCoords) return;
    setLng(initialCoords.lng.toFixed(6));
    setLat(initialCoords.lat.toFixed(6));
    const closest = closestProvince([initialCoords.lng, initialCoords.lat]);
    setProvinceSlug(closest.slug);
  }, [open, initialCoords]);

  // Persist author across submissions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("mapvn:contributor-name");
    if (saved) setSubmittedBy(saved);
  }, []);

  // Reset on close
  useEffect(() => {
    if (open) return;
    setTimeout(() => {
      setName("");
      setCategory(initialCategory ?? "");
      setProvinceSlug(initialProvinceSlug ?? "");
      setDistrict("");
      setAddress("");
      setDescription("");
      setLng("");
      setLat("");
      setPriceRange("");
      setOpeningHours("");
      setTagsInput("");
      setPhotos([]);
      setError(null);
    }, 200);
  }, [open, initialCategory, initialProvinceSlug]);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toRead = Array.from(files).slice(0, remaining);
    setError(null);
    for (const file of toRead) {
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`Ảnh "${file.name}" quá lớn (≤ 1.5 MB)`);
        continue;
      }
      const dataUrl = await readAsDataURL(file);
      setPhotos((prev) => (prev.length < MAX_PHOTOS ? [...prev, dataUrl] : prev));
    }
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude.toFixed(6));
        setLat(pos.coords.latitude.toFixed(6));
      },
      () => setError("Không thể lấy vị trí — vui lòng nhập thủ công")
    );
  };

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError("Vui lòng nhập tên địa điểm");
    if (!category) return setError("Chọn danh mục");
    if (!provinceSlug) return setError("Chọn tỉnh thành");
    if (description.trim().length < 50)
      return setError("Mô tả tối thiểu 50 ký tự");
    if (description.length > 1000) return setError("Mô tả tối đa 1000 ký tự");
    const lngNum = Number(lng);
    const latNum = Number(lat);
    if (!Number.isFinite(lngNum) || !Number.isFinite(latNum))
      return setError("Toạ độ không hợp lệ");
    if (lngNum < 102 || lngNum > 110 || latNum < 8 || latNum > 24)
      return setError("Toạ độ không nằm trong VN");
    if (submittedBy.trim().length < 2) return setError("Vui lòng nhập tên hiển thị");

    const prov = provinceBySlug[provinceSlug];
    if (!prov) return setError("Tỉnh không hợp lệ");

    setSubmitting(true);
    try {
      localStorage.setItem("mapvn:contributor-name", submittedBy.trim());
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      add({
        name: name.trim(),
        category: category as CategoryKey,
        province: prov.name,
        provinceSlug,
        district: district.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim(),
        lng: lngNum,
        lat: latNum,
        priceRange: priceRange || undefined,
        openingHours: openingHours.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        photos: photos.length > 0 ? photos : undefined,
        submittedBy: submittedBy.trim(),
      });
      showToast("Cảm ơn — đề xuất đã được ghi nhận, sẽ duyệt sớm.", {
        variant: "success",
        duration: 4000,
      });
      onSubmitted?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition.fast}
                className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              className={cn(
                "pointer-events-none fixed inset-0 z-[71] flex items-end justify-center",
                "md:items-center md:p-4"
              )}
            >
              <m.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={spring.default}
                className={cn(
                  "pointer-events-auto flex w-full max-w-2xl flex-col overflow-hidden",
                  "max-h-[92dvh] border border-border bg-surface shadow-xl",
                  "rounded-t-2xl md:rounded-2xl"
                )}
              >
                <Dialog.Title className="sr-only">Đóng góp địa điểm mới</Dialog.Title>
                <Dialog.Description className="sr-only">
                  Đề xuất một địa điểm mới cho cộng đồng. Sẽ qua duyệt trước khi hiển thị.
                </Dialog.Description>

                <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <h2 id={titleId} className="font-display text-h3 text-text">
                      Đóng góp địa điểm
                    </h2>
                    <p className="text-body-sm text-text-muted">
                      Chia sẻ quán ăn / cafe / hidden gem của bạn
                    </p>
                  </div>
                  <Dialog.Close
                    aria-label="Đóng"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
                  >
                    <X size={16} />
                  </Dialog.Close>
                </div>

                <div
                  className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
                  style={{ maxHeight: "calc(92dvh - 9rem)" }}
                >
                  <Field label="Tên địa điểm" required>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      placeholder="VD: Cafe Sài Gòn Cũ"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Danh mục" required>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryKey)}
                        className={inputCls}
                      >
                        <option value="">— Chọn danh mục —</option>
                        <optgroup label="Lifestyle">
                          {categories
                            .filter((c) => c.group === "lifestyle")
                            .map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.labelVi}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label="Travel">
                          {categories
                            .filter((c) => c.group === "travel")
                            .map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.labelVi}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </Field>
                    <Field label="Tỉnh thành" required>
                      <select
                        value={provinceSlug}
                        onChange={(e) => {
                          setProvinceSlug(e.target.value);
                          setLng("");
                          setLat("");
                        }}
                        className={inputCls}
                      >
                        <option value="">— Chọn tỉnh thành —</option>
                        {provinces.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Quận / Huyện" hint="Tuỳ chọn">
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="VD: Hoàn Kiếm"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Địa chỉ chi tiết" hint="Tuỳ chọn">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, đường…"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Toạ độ"
                    required
                    hint="Tự động lấy từ tỉnh — bạn có thể chỉnh lại cho chính xác"
                  >
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="Kinh độ"
                        className={inputCls}
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="Vĩ độ"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={useMyLocation}
                        className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-body-sm font-medium text-text hover:bg-surface-2"
                      >
                        <MapPin size={14} /> GPS
                      </button>
                    </div>
                  </Field>

                  <Field
                    label="Mô tả"
                    required
                    hint={`${description.length}/1000 ký tự (tối thiểu 50)`}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder="Tại sao địa điểm này đáng đến? Món gì ngon? View thế nào? Lưu ý gì?"
                      className={cn(inputCls, "resize-y")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Khung giá" hint="Tuỳ chọn">
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                        className={inputCls}
                      >
                        <option value="">— Không xác định —</option>
                        {PRICE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Giờ mở cửa" hint="Tuỳ chọn">
                      <input
                        type="text"
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        placeholder="VD: 07:00–22:00 hàng ngày"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Tags" hint="Cách nhau bằng dấu phẩy">
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="VD: view-đẹp, couple, instagram"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Ảnh" hint={`Tối đa ${MAX_PHOTOS} ảnh, ≤ 1.5 MB mỗi ảnh`}>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((src, i) => (
                        <div
                          key={i}
                          className="relative aspect-square overflow-hidden rounded-lg border border-border"
                        >
                          <Image src={src} alt={`Ảnh ${i + 1}`} fill className="object-cover" sizes="120px" unoptimized />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label="Xoá ảnh"
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-text-muted hover:border-brand-500 hover:bg-brand-50/40 hover:text-brand-600"
                        >
                          <ImagePlus size={18} />
                          <span className="text-caption">Thêm ảnh</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => onFiles(e.target.files)}
                    />
                  </Field>

                  <Field label="Tên người đóng góp" required>
                    <input
                      type="text"
                      value={submittedBy}
                      onChange={(e) => setSubmittedBy(e.target.value)}
                      maxLength={40}
                      placeholder="Sẽ hiển thị công khai"
                      className={inputCls}
                    />
                  </Field>

                  {error && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-body-sm text-danger">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-surface-2/30 px-6 py-3">
                  <p className="hidden text-caption text-text-muted md:block">
                    Sẽ qua duyệt trước khi hiển thị công khai
                  </p>
                  <div className="ml-auto flex items-center gap-2">
                    <Dialog.Close asChild>
                      <Button variant="ghost">Huỷ</Button>
                    </Dialog.Close>
                    <Button onClick={submit} loading={submitting}>
                      Gửi đề xuất
                    </Button>
                  </div>
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-body-sm font-medium text-text">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
        {hint && <span className="text-caption text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lỗi đọc file"));
    reader.readAsDataURL(file);
  });
}
