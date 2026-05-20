"use client";
import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { useTrips } from "../hooks/useTrips";
import { TripCard } from "./TripCard";
import { NewTripDialog } from "./NewTripDialog";

export function TripList() {
  const { trips, hydrated } = useTrips();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <Reveal>
            <p className="text-overline text-brand-600">CỦA BẠN</p>
            <h1 className="mt-2 font-display text-display-lg text-text">Chuyến đi</h1>
            <p className="mt-2 text-body-lg text-text-muted">
              Dựng lộ trình theo ngày, thêm địa điểm yêu thích, chia sẻ với bạn bè.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <Button onClick={() => setNewOpen(true)}>
              <Plus size={16} /> Tạo chuyến đi
            </Button>
          </Reveal>
        </div>

        <div className="mt-10">
          {!hydrated ? (
            <p className="text-body-sm text-text-muted">Đang tải…</p>
          ) : trips.length === 0 ? (
            <EmptyState onCreate={() => setNewOpen(true)} />
          ) : (
            <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => (
                <StaggerItem key={t.id}>
                  <TripCard trip={t} />
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Briefcase size={20} />
      </div>
      <p className="font-display text-h3 text-text">Chưa có chuyến đi nào</p>
      <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
        Tạo chuyến đi đầu tiên — đặt tên, chọn số ngày, thêm địa điểm yêu thích.
      </p>
      <Button className="mt-4" onClick={onCreate}>
        <Plus size={16} /> Tạo chuyến đi
      </Button>
    </div>
  );
}
