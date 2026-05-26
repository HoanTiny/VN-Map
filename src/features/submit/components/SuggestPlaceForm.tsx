"use client";
import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, ImagePlus, MapPin } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { transition, spring } from "@/lib/motion";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";
import { categories, type CategoryKey } from "@/config/categories";
import { provinces, provinceBySlug, closestProvince } from "@/config/regions";
import { useSubmissions } from "../hooks/useSubmissions";
import { useSession } from "@/features/auth/hooks/useSession";
import { uploadPhotos } from "@/lib/upload";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1_500_000;

export interface SuggestPlaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional preset — when triggered from a province page, pre-fill province. */
  initialProvinceSlug?: string;
  /** Optional preset — when triggered from a category page. */
  initialCategory?: CategoryKey;
  /** Optional preset — when triggered by "pick on map" / AI flow. */
  initialCoords?: {
    lng: number;
    lat: number;
    name?: string;
    category?: string;
    address?: string;
    description?: string;
  };
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
  const t = useTranslations("Suggest");
  const locale = useLocale();
  const PRICE_OPTIONS: Array<{ value: "$" | "$$" | "$$$" | "$$$$"; label: string }> = [
    { value: "$", label: t("priceCheap") },
    { value: "$$", label: t("priceMid") },
    { value: "$$$", label: t("priceHigh") },
    { value: "$$$$", label: t("priceLux") },
  ];
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { add } = useSubmissions();
  const { user } = useSession();
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

  // Apply initialCoords from "pick on map" / AI suggest flow
  useEffect(() => {
    if (!open || !initialCoords) return;
    setLng(initialCoords.lng.toFixed(6));
    setLat(initialCoords.lat.toFixed(6));
    const closest = closestProvince([initialCoords.lng, initialCoords.lat]);
    setProvinceSlug(closest.slug);
    if (initialCoords.name) setName(initialCoords.name);
    if (initialCoords.address) setAddress(initialCoords.address);
    if (initialCoords.description) setDescription(initialCoords.description);
    if (initialCoords.category) {
      const map: Record<string, CategoryKey> = {
        cafe: "cafe", restaurant: "food", food: "food",
        bar: "nightlife", nightlife: "nightlife", rooftop: "rooftop",
        beach: "beach", mountain: "mountain", park: "nature", nature: "nature",
        museum: "heritage", heritage: "heritage", attraction: "checkin",
        market: "food", hotel: "experience", experience: "experience",
        hidden: "hidden", checkin: "checkin",
      };
      const mapped = map[initialCoords.category.toLowerCase()];
      if (mapped) setCategory(mapped);
    }
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
        setError(t("photoTooLarge", { name: file.name }));
        continue;
      }
      const dataUrl = await readAsDataURL(file);
      setPhotos((prev) => (prev.length < MAX_PHOTOS ? [...prev, dataUrl] : prev));
    }
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError(t("geoUnsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLng(pos.coords.longitude.toFixed(6));
        setLat(pos.coords.latitude.toFixed(6));
      },
      () => setError(t("geoFailed"))
    );
  };

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError(t("needName"));
    if (!category) return setError(t("needCategory"));
    if (!provinceSlug) return setError(t("needProvince"));
    if (description.trim().length < 50)
      return setError(t("minDesc"));
    if (description.length > 1000) return setError(t("maxDesc"));
    const lngNum = Number(lng);
    const latNum = Number(lat);
    if (!Number.isFinite(lngNum) || !Number.isFinite(latNum))
      return setError(t("badCoords"));
    if (lngNum < 102 || lngNum > 110 || latNum < 8 || latNum > 24)
      return setError(t("outsideVN"));
    if (submittedBy.trim().length < 2) return setError(t("needContributor"));

    const prov = provinceBySlug[provinceSlug];
    if (!prov) return setError(t("invalidProvince"));

    setSubmitting(true);
    try {
      localStorage.setItem("mapvn:contributor-name", submittedBy.trim());
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const uploadedPhotos = user && photos.length > 0
        ? await uploadPhotos(photos, user.id)
        : photos;
      await add({
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
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
        submittedBy: submittedBy.trim(),
      });
      showToast(t("submittedToast"), {
        variant: "success",
        duration: 4000,
      });
      onSubmitted?.();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("genericError"));
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
                <Dialog.Title className="sr-only">{t("dialogTitle")}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  {t("dialogDesc")}
                </Dialog.Description>

                <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <h2 id={titleId} className="font-display text-h3 text-text">
                      {t("heading")}
                    </h2>
                    <p className="text-body-sm text-text-muted">
                      {t("subheading")}
                    </p>
                  </div>
                  <Dialog.Close
                    aria-label={t("close")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
                  >
                    <X size={16} />
                  </Dialog.Close>
                </div>

                <div
                  className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
                  style={{ maxHeight: "calc(92dvh - 9rem)" }}
                >
                  <Field label={t("fieldName")} required>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      placeholder={t("namePlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label={t("fieldCategory")} required>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryKey)}
                        className={inputCls}
                      >
                        <option value="">{t("pickCategory")}</option>
                        <optgroup label={t("groupLifestyle")}>
                          {categories
                            .filter((c) => c.group === "lifestyle")
                            .map((c) => (
                              <option key={c.key} value={c.key}>
                                {locale === "en" ? c.label : c.labelVi}
                              </option>
                            ))}
                        </optgroup>
                        <optgroup label={t("groupTravel")}>
                          {categories
                            .filter((c) => c.group === "travel")
                            .map((c) => (
                              <option key={c.key} value={c.key}>
                                {locale === "en" ? c.label : c.labelVi}
                              </option>
                            ))}
                        </optgroup>
                      </select>
                    </Field>
                    <Field label={t("fieldProvince")} required>
                      <select
                        value={provinceSlug}
                        onChange={(e) => {
                          setProvinceSlug(e.target.value);
                          setLng("");
                          setLat("");
                        }}
                        className={inputCls}
                      >
                        <option value="">{t("pickProvince")}</option>
                        {provinces.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label={t("fieldDistrict")} hint={t("optional")}>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={t("districtPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                    <Field label={t("fieldAddress")} hint={t("optional")}>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t("addressPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field
                    label={t("fieldCoords")}
                    required
                    hint={t("coordsHint")}
                  >
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder={t("lng")}
                        className={inputCls}
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder={t("lat")}
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
                    label={t("fieldDesc")}
                    required
                    hint={t("descHint", { count: description.length })}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={4}
                      placeholder={t("descPlaceholder")}
                      className={cn(inputCls, "resize-y")}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label={t("fieldPrice")} hint={t("optional")}>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value as typeof priceRange)}
                        className={inputCls}
                      >
                        <option value="">{t("pricePickNone")}</option>
                        {PRICE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t("fieldHours")} hint={t("optional")}>
                      <input
                        type="text"
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                        placeholder={t("hoursPlaceholder")}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label={t("fieldTags")} hint={t("tagsHint")}>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder={t("tagsPlaceholder")}
                      className={inputCls}
                    />
                  </Field>

                  <Field label={t("fieldPhotos")} hint={t("photosHint", { max: MAX_PHOTOS })}>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((src, i) => (
                        <div
                          key={i}
                          className="relative aspect-square overflow-hidden rounded-lg border border-border"
                        >
                          <Image src={src} alt={t("photoAlt", { n: i + 1 })} fill className="object-cover" sizes="120px" unoptimized />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            aria-label={t("removePhoto")}
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
                          <span className="text-caption">{t("addPhoto")}</span>
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

                  <Field label={t("fieldContributor")} required>
                    <input
                      type="text"
                      value={submittedBy}
                      onChange={(e) => setSubmittedBy(e.target.value)}
                      maxLength={40}
                      placeholder={t("contributorPlaceholder")}
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
                    {t("moderationNotice")}
                  </p>
                  <div className="ml-auto flex items-center gap-2">
                    <Dialog.Close asChild>
                      <Button variant="ghost">{t("cancel")}</Button>
                    </Dialog.Close>
                    <Button onClick={submit} loading={submitting}>
                      {t("submit")}
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
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
