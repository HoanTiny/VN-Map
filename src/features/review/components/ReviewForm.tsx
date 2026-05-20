"use client";
import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { transition, spring } from "@/lib/motion";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";
import { RatingStars } from "./RatingStars";
import { companionLabels, type Companion } from "../lib/types";
import { useReviews } from "../hooks/useReviews";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1_500_000; // ~1.5MB each — fits in localStorage budget

export interface ReviewFormProps {
  placeSlug: string;
  placeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function ReviewForm({
  placeSlug,
  placeName,
  open,
  onOpenChange,
  onSubmitted,
}: ReviewFormProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { add } = useReviews(placeSlug);
  const { show: showToast } = useToast();

  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [companion, setCompanion] = useState<Companion | "">("");
  const [visitedAt, setVisitedAt] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setRating(0);
        setTitle("");
        setBody("");
        setCompanion("");
        setVisitedAt("");
        setPhotos([]);
        setError(null);
      }, 200);
    }
  }, [open]);

  // Persist author name once entered (across submissions)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("mapvn:reviewer-name");
    if (saved) setAuthorName(saved);
  }, []);

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

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    setError(null);
    if (rating === 0) return setError("Vui lòng chọn số sao");
    if (body.trim().length < 30) return setError("Nội dung tối thiểu 30 ký tự");
    if (body.length > 2000) return setError("Nội dung tối đa 2000 ký tự");
    if (title.length > 80) return setError("Tiêu đề tối đa 80 ký tự");
    if (authorName.trim().length < 2) return setError("Vui lòng nhập tên hiển thị");

    setSubmitting(true);
    try {
      localStorage.setItem("mapvn:reviewer-name", authorName.trim());
      add({
        placeSlug,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        title: title.trim() || undefined,
        body: body.trim(),
        photos: photos.length > 0 ? photos : undefined,
        companion: companion || undefined,
        visitedAt: visitedAt || undefined,
        authorName: authorName.trim(),
      });
      showToast("Đã gửi review — cảm ơn bạn đã chia sẻ!", { variant: "success" });
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
                <Dialog.Title className="sr-only">
                  Viết review — {placeName}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Chia sẻ trải nghiệm thực tế của bạn về {placeName}.
                </Dialog.Description>

                <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <h2 id={titleId} className="font-display text-h3 text-text">
                      Viết review
                    </h2>
                    <p className="text-body-sm text-text-muted">{placeName}</p>
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
                  {/* Rating */}
                  <Field label="Đánh giá" required>
                    <RatingStars value={rating} onChange={setRating} size={32} />
                  </Field>

                  {/* Title */}
                  <Field label="Tiêu đề" hint="Tùy chọn — tối đa 80 ký tự">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={80}
                      placeholder="Trải nghiệm của bạn thế nào?"
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </Field>

                  {/* Body */}
                  <Field
                    label="Nội dung"
                    required
                    hint={`${body.length}/2000 ký tự (tối thiểu 30)`}
                  >
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={2000}
                      rows={5}
                      placeholder="Mô tả trải nghiệm thực tế — món ngon, view, atmosphere, mẹo cho người sau…"
                      className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </Field>

                  {/* Photos */}
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

                  {/* Companion */}
                  <Field label="Đi cùng">
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(companionLabels) as Companion[]).map((c) => {
                        const active = companion === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCompanion(active ? "" : c)}
                            aria-pressed={active}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-body-sm font-medium transition-colors",
                              active
                                ? "border-brand-500 bg-brand-50 text-brand-700"
                                : "border-border bg-surface text-text hover:bg-surface-2"
                            )}
                          >
                            {companionLabels[c]}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {/* Visited at */}
                  <Field label="Thời điểm đi" hint="Giúp người sau biết khi nào bạn ghé">
                    <input
                      type="month"
                      value={visitedAt}
                      onChange={(e) => setVisitedAt(e.target.value)}
                      className="rounded-lg border border-border bg-bg px-3 py-2 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </Field>

                  {/* Author */}
                  <Field label="Tên hiển thị" required>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      maxLength={40}
                      placeholder="Tên của bạn (sẽ hiển thị công khai)"
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </Field>

                  {error && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-body-sm text-danger">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface-2/30 px-6 py-3">
                  <Dialog.Close asChild>
                    <Button variant="ghost">Huỷ</Button>
                  </Dialog.Close>
                  <Button onClick={submit} loading={submitting}>
                    Gửi review
                  </Button>
                </div>
              </m.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

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
      <div className="mb-1.5 flex items-baseline justify-between">
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
