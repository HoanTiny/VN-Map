"use client";
import { useState } from "react";
import { Plus, Minus, Locate, Layers, Check } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { useMapStore, type MapStyleKey } from "@/stores/map-store";
import { transition } from "@/lib/motion";

const STYLES: { key: MapStyleKey | "auto"; label: string }[] = [
  { key: "auto", label: "Tự động (theo theme)" },
  { key: "light", label: "Sáng" },
  { key: "dark", label: "Tối" },
  { key: "satellite", label: "Vệ tinh" },
];

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLocate?: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  const styleKey = useMapStore((s) => s.styleKey);
  const setStyleKey = useMapStore((s) => s.setStyleKey);
  const [openLayers, setOpenLayers] = useState(false);

  const activeKey = styleKey ?? "auto";

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Layers popover */}
      <div className="relative">
        <AnimatePresence>
          {openLayers && (
            <m.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={transition.fast}
              className="absolute bottom-12 right-0 w-56 rounded-2xl glass shadow-lg p-1.5"
              role="listbox"
            >
              <div className="px-3 py-2 text-overline text-text-subtle">Kiểu bản đồ</div>
              {STYLES.map((s) => {
                const active = (activeKey as string) === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setStyleKey(s.key === "auto" ? null : (s.key as MapStyleKey));
                      setOpenLayers(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-body-sm transition-colors",
                      active ? "bg-brand-50 text-brand-700" : "text-text hover:bg-surface-2"
                    )}
                  >
                    <span>{s.label}</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })}
            </m.div>
          )}
        </AnimatePresence>

        <ControlButton
          label="Kiểu bản đồ"
          active={openLayers}
          onClick={() => setOpenLayers((v) => !v)}
        >
          <Layers size={16} />
        </ControlButton>
      </div>

      <ControlButton label="Vị trí của tôi" onClick={onLocate}>
        <Locate size={16} />
      </ControlButton>

      <div className="flex flex-col overflow-hidden rounded-xl glass shadow-md">
        <button
          onClick={onZoomIn}
          aria-label="Phóng to"
          className="flex h-10 w-10 items-center justify-center text-text hover:bg-white/10 dark:hover:bg-white/5"
        >
          <Plus size={16} />
        </button>
        <div className="h-px w-full bg-border" />
        <button
          onClick={onZoomOut}
          aria-label="Thu nhỏ"
          className="flex h-10 w-10 items-center justify-center text-text hover:bg-white/10 dark:hover:bg-white/5"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl glass shadow-sm text-text",
        "transition-colors hover:bg-white/10 dark:hover:bg-white/5",
        active && "ring-2 ring-brand-500"
      )}
    >
      {children}
    </button>
  );
}
