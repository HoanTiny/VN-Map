"use client";
import { useState } from "react";
import { Plus, Minus, Locate, Layers, Check, Box } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
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
  const enable3D = useMapStore((s) => s.enable3D);
  const setEnable3D = useMapStore((s) => s.setEnable3D);
  const [openLayers, setOpenLayers] = useState(false);
  const [seen3DHint, setSeen3DHint] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("mapvn:seen3DHint") === "1";
  });

  const activeKey = styleKey ?? "auto";
  const show3DHint = !seen3DHint && !enable3D;

  const dismiss3DHint = () => {
    setSeen3DHint(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mapvn:seen3DHint", "1");
    }
  };

  return (
    <Tooltip.Provider delayDuration={150} skipDelayDuration={300}>
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

        {/* 3D toggle with first-time coachmark + persistent active badge */}
        <div className="relative">
          <AnimatePresence>
            {show3DHint && (
              <m.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={transition.fast}
                className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-brand-500 px-3 py-1.5 text-body-sm font-medium text-white shadow-lg"
              >
                Thử chế độ 3D
                <span className="absolute right-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-brand-500" />
              </m.div>
            )}
          </AnimatePresence>

          <ControlButton
            label={enable3D ? "Tắt chế độ 3D" : "Bật chế độ 3D — xem nhà cửa nổi khối"}
            active={enable3D}
            onClick={() => {
              setEnable3D(!enable3D);
              if (show3DHint) dismiss3DHint();
            }}
            pulse={show3DHint}
          >
            <Box size={16} />
            {enable3D && (
              <span className="pointer-events-none absolute -bottom-1 -right-1 rounded-full bg-brand-500 px-1 py-px text-[9px] font-bold leading-tight text-white shadow-md">
                3D
              </span>
            )}
          </ControlButton>
        </div>

        <ControlButton label="Vị trí của tôi" onClick={onLocate}>
          <Locate size={16} />
        </ControlButton>

        <div className="flex flex-col overflow-hidden rounded-xl glass shadow-md">
          <ZoomButton label="Phóng to" onClick={onZoomIn}>
            <Plus size={16} />
          </ZoomButton>
          <div className="h-px w-full bg-border" />
          <ZoomButton label="Thu nhỏ" onClick={onZoomOut}>
            <Minus size={16} />
          </ZoomButton>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

function ControlButton({
  label,
  active,
  onClick,
  pulse,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl glass shadow-sm text-text",
            "transition-colors hover:bg-white/10 dark:hover:bg-white/5",
            active && "ring-2 ring-brand-500 text-brand-600 dark:text-brand-500",
            pulse && "animate-pulse ring-2 ring-brand-500/60"
          )}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="left"
          sideOffset={8}
          className="z-50 select-none rounded-md bg-neutral-900 dark:bg-neutral-100 px-2.5 py-1.5 text-body-sm text-white dark:text-neutral-900 shadow-md data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0"
        >
          {label}
          <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center text-text hover:bg-white/10 dark:hover:bg-white/5"
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="left"
          sideOffset={8}
          className="z-50 select-none rounded-md bg-neutral-900 dark:bg-neutral-100 px-2.5 py-1.5 text-body-sm text-white dark:text-neutral-900 shadow-md"
        >
          {label}
          <Tooltip.Arrow className="fill-neutral-900 dark:fill-neutral-100" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
