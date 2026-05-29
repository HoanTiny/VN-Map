"use client";
import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { spring } from "@/lib/motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("PWA");
  const tc = useTranslations("Common");

  // Register service worker.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {}); // non-fatal
  }, []);

  // Capture install prompt.
  useEffect(() => {
    const alreadyDismissed = localStorage.getItem("mapvn:pwa-dismissed");
    if (alreadyDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    setInstallPrompt(null);
    localStorage.setItem("mapvn:pwa-dismissed", "1");
  };

  const show = !!installPrompt && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={spring.default}
          className="fixed bottom-20 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xl md:bottom-6"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
            <Download size={18} className="text-brand-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-body-sm font-medium text-text">{t("bannerTitle")}</p>
            <p className="text-caption text-text-muted">{t("bannerHint")}</p>
          </div>
          <button
            onClick={install}
            className="shrink-0 rounded-full bg-brand-600 px-3 py-1.5 text-caption font-medium text-white hover:bg-brand-700"
          >
            {t("install")}
          </button>
          <button
            onClick={dismiss}
            aria-label={tc("close")}
            className="shrink-0 text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}
