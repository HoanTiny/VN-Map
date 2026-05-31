"use client";
import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { useTrips } from "../hooks/useTrips";
import { TripCard } from "./TripCard";
import { NewTripDialog } from "./NewTripDialog";

export function TripList() {
  const t = useTranslations("TripPage");
  const { trips, hydrated } = useTrips();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <Reveal>
            <p className="text-overline text-brand-600">{t("yoursOverline")}</p>
            <h1 className="mt-2 font-display text-display-lg text-text">{t("title")}</h1>
            <p className="mt-2 text-body-lg text-text-muted">
              {t("subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <Button onClick={() => setNewOpen(true)}>
              <Plus size={16} /> {t("createTrip")}
            </Button>
          </Reveal>
        </div>

        <div className="mt-10">
          {!hydrated ? (
            <TripGridSkeleton />
          ) : trips.length === 0 ? (
            <EmptyState onCreate={() => setNewOpen(true)} />
          ) : (
            <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <StaggerItem key={trip.id}>
                  <TripCard trip={trip} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>

      <NewTripDialog open={newOpen} onOpenChange={setNewOpen} />
    </article>
  );
}

function TripGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations("TripPage");
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Briefcase size={20} />
      </div>
      <p className="font-display text-h3 text-text">{t("emptyTitle")}</p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        {t("emptySubtitle")}
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus size={16} /> {t("createTrip")}
      </Button>
    </div>
  );
}
