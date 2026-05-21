"use client";
import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Briefcase, Check, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, type ButtonProps } from "@/ui/button";
import { useToast } from "@/ui/toast";
import { useTrips } from "../hooks/useTrips";
import { NewTripDialog } from "./NewTripDialog";

export interface AddToTripButtonProps {
  slug: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  label?: string;
  className?: string;
}

/**
 * Popover that lists existing trips with day selector inline. Adding a place
 * confirms with a checkmark briefly. Includes "Create new trip" shortcut.
 */
export function AddToTripButton({
  slug,
  variant = "secondary",
  size = "sm",
  label = "Thêm vào trip",
  className,
}: AddToTripButtonProps) {
  const { trips, addPlaceToDay, getTripById } = useTrips();
  const { show: showToast } = useToast();
  const [newOpen, setNewOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null); // tripId-dayIndex

  const handleAdd = (tripId: string, dayIndex: number) => {
    addPlaceToDay(tripId, dayIndex, slug);
    const key = `${tripId}-${dayIndex}`;
    setJustAdded(key);
    const trip = getTripById(tripId);
    showToast(
      `Đã thêm vào "${trip?.name ?? "chuyến đi"}" — Ngày ${dayIndex + 1}`,
      { variant: "success" }
    );
    setTimeout(() => {
      setJustAdded(null);
      setPopoverOpen(false);
    }, 900);
  };

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Briefcase size={14} /> {label}
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="end"
            className={cn(
              "z-[60] w-72 rounded-2xl border border-border bg-surface p-2 shadow-xl",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            )}
          >
            <div className="px-3 pt-2 pb-1 text-overline text-text-subtle">
              {trips.length === 0 ? "Chưa có chuyến đi" : "Chọn chuyến đi"}
            </div>

            {trips.length > 0 && (
              <ul className="max-h-80 overflow-y-auto">
                {trips.map((trip) => (
                  <li key={trip.id} className="border-b border-border/40 last:border-b-0">
                    <div className="px-3 pt-2 pb-1">
                      <p className="line-clamp-1 text-body font-medium text-text">{trip.name}</p>
                      <p className="text-caption text-text-muted">{trip.days.length} ngày</p>
                    </div>
                    <ul className="pb-2">
                      {trip.days.map((day, i) => {
                        const has = day.placeSlugs.includes(slug);
                        const isAdded = justAdded === `${trip.id}-${i}`;
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              disabled={has}
                              onClick={() => handleAdd(trip.id, i)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-body-sm transition-colors",
                                has
                                  ? "text-text-subtle cursor-default"
                                  : "text-text hover:bg-surface-2"
                              )}
                            >
                              <span>{day.label}</span>
                              {has ? (
                                <Check size={12} className="text-success" />
                              ) : isAdded ? (
                                <Check size={12} className="text-success" />
                              ) : (
                                <span className="text-caption text-text-muted">
                                  {day.placeSlugs.length} địa điểm
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => {
                setPopoverOpen(false);
                setNewOpen(true);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-body-sm font-medium text-brand-600 hover:bg-brand-50/40"
            >
              <Plus size={14} /> Tạo chuyến đi mới
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <NewTripDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}
