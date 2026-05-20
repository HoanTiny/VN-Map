"use client";
import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";
import { Button } from "@/ui/button";
import { addPlaceToTrip, getTrip } from "../lib/storage";

export interface TripPickAddButtonProps {
  slug: string;
  tripId: string;
  dayIndex: number;
  className?: string;
}

/**
 * One-click "add to a specific trip day" CTA. Used inside MapPlaceCard when
 * the user is in trip-pick mode (came from TripPlanner's "Thêm từ bản đồ").
 * Shows confirmation tick briefly after add.
 */
export function TripPickAddButton({
  slug,
  tripId,
  dayIndex,
  className,
}: TripPickAddButtonProps) {
  const [justAdded, setJustAdded] = useState(false);
  const [alreadyIn, setAlreadyIn] = useState(false);

  // Check on mount + when slug changes whether this place is already in that day.
  useEffect(() => {
    const trip = getTrip(tripId);
    const day = trip?.days[dayIndex];
    setAlreadyIn(!!day?.placeSlugs.includes(slug));
  }, [slug, tripId, dayIndex]);

  const add = () => {
    if (alreadyIn) return;
    addPlaceToTrip(tripId, dayIndex, slug);
    setJustAdded(true);
    setAlreadyIn(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <Button
      size="sm"
      variant={alreadyIn ? "tonal" : "primary"}
      onClick={add}
      disabled={alreadyIn && !justAdded}
      className={cn(className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {justAdded || alreadyIn ? (
          <m.span
            key="added"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={transition.fast}
            className="inline-flex items-center gap-2"
          >
            <Check size={14} /> Đã thêm vào Ngày {dayIndex + 1}
          </m.span>
        ) : (
          <m.span
            key="add"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.fast}
            className="inline-flex items-center gap-2"
          >
            <Plus size={14} /> Thêm vào Ngày {dayIndex + 1}
          </m.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
