"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { m, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { spring, transition } from "@/lib/motion";
import { Button } from "@/ui/button";
import { useTrips } from "../hooks/useTrips";
import { ProvinceChipPicker } from "./ProvinceChipPicker";

export interface NewTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional — navigate to the new trip after creation. Default true. */
  redirectAfterCreate?: boolean;
}

export function NewTripDialog({
  open,
  onOpenChange,
  redirectAfterCreate = true,
}: NewTripDialogProps) {
  const t = useTranslations("NewTrip");
  const router = useRouter();
  const { create } = useTrips();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) return;
    setTimeout(() => {
      setName("");
      setDescription("");
      setNumDays(3);
      setDestinations([]);
      setError(null);
    }, 200);
  }, [open]);

  const submit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError(t("needName"));
    if (numDays < 1 || numDays > 30) return setError(t("dayRange"));
    setSubmitting(true);
    try {
      const trip = await create({
        name: name.trim(),
        description: description.trim() || undefined,
        numDays,
        destinations,
      });
      onOpenChange(false);
      if (redirectAfterCreate) router.push(`/trip/${trip.id}`);
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
                  "pointer-events-auto flex w-full max-w-lg flex-col overflow-hidden",
                  "max-h-[92dvh] border border-border bg-surface shadow-xl",
                  "rounded-t-2xl md:rounded-2xl"
                )}
              >
                <Dialog.Title className="sr-only">{t("dialogTitle")}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  {t("dialogDesc")}
                </Dialog.Description>

                <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-display text-h3 text-text">{t("heading")}</h2>
                  <Dialog.Close
                    aria-label={t("close")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
                  >
                    <X size={16} />
                  </Dialog.Close>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                  <div className="mb-4">
                    <label className="mb-1.5 block text-body-sm font-medium text-text">
                      {t("fieldName")} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      maxLength={80}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-body-sm font-medium text-text">
                      {t("fieldDesc")}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      maxLength={300}
                      placeholder={t("descPlaceholder")}
                      className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-body outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <label className="text-body-sm font-medium text-text">
                        {t("fieldDestinations")}
                      </label>
                      <span className="text-caption text-text-muted">
                        {t("destinationsHint")}
                      </span>
                    </div>
                    <ProvinceChipPicker
                      value={destinations}
                      onChange={setDestinations}
                      placeholder={t("destinationsPlaceholder")}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-body-sm font-medium text-text">
                      {t("fieldDays")} <span className="text-danger">*</span>
                    </label>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg p-1">
                      <button
                        type="button"
                        onClick={() => setNumDays((n) => Math.max(1, n - 1))}
                        aria-label={t("decreaseDays")}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[2ch] text-center font-display text-h3 text-text tabular-nums">
                        {numDays}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNumDays((n) => Math.min(30, n + 1))}
                        aria-label={t("increaseDays")}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-2"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-danger/10 px-3 py-2 text-body-sm text-danger">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-surface-2/30 px-6 py-3">
                  <Dialog.Close asChild>
                    <Button variant="ghost">{t("cancel")}</Button>
                  </Dialog.Close>
                  <Button onClick={submit} loading={submitting}>
                    {t("submit")}
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
