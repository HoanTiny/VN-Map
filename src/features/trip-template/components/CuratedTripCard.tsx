import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/ui/badge";
import { SEASON_LABEL, type TripTemplate } from "../lib/queries";

export function CuratedTripCard({ trip }: { trip: TripTemplate }) {
  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-brand-500/40"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
        <Image
          src={trip.cover}
          alt={trip.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="brand" className="text-[10px] shadow-sm">
            {SEASON_LABEL[trip.season]}
          </Badge>
          <Badge variant="neutral" className="bg-black/40 text-white text-[10px] shadow-sm">
            <Calendar size={10} /> {trip.duration_days} ngày
          </Badge>
        </div>
        <h3 className="absolute inset-x-4 bottom-3 line-clamp-2 font-display text-h3 font-semibold text-white drop-shadow">
          {trip.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-body-sm text-text-muted">{trip.summary}</p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 text-caption text-text-subtle">
            <MapPin size={11} />
            <span className="truncate">{trip.destinations.slice(0, 3).join(" · ") || "Đa điểm"}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-body-sm font-medium text-brand-600 group-hover:gap-1.5 group-hover:underline">
            Xem lịch trình <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
