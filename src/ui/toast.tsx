"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

export type ToastVariant = "success" | "info" | "warning" | "danger";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  show: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof Check; className: string }
> = {
  success: { icon: Check, className: "bg-success text-white" },
  info: { icon: Info, className: "bg-info text-white" },
  warning: { icon: AlertTriangle, className: "bg-warning text-black" },
  danger: { icon: X, className: "bg-danger text-white" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ToastContextValue["show"]>((message, opts) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toast: Toast = {
      id,
      message,
      variant: opts?.variant ?? "success",
      duration: opts?.duration ?? 3200,
    };
    setToasts((prev) => [...prev, toast]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((p) => p.id !== t.id));
      }, t.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic
        className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            const Icon = meta.icon;
            return (
              <m.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={spring.default}
                className={cn(
                  "pointer-events-auto inline-flex max-w-full items-center gap-2.5 rounded-full px-4 py-2.5 text-body-sm font-medium shadow-lg",
                  meta.className
                )}
                role="status"
              >
                <Icon size={14} className="shrink-0" />
                <span className="line-clamp-2">{t.message}</span>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
