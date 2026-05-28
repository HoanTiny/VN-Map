"use client";
import { useState } from "react";
import { Navigation } from "lucide-react";
import { Skeleton } from "@/ui/skeleton";
import { cn } from "@/lib/cn";

interface MiniMapEmbedProps {
  lat: number;
  lng: number;
  name: string;
  /** zoom delta in degrees — smaller = more zoomed in */
  delta?: number;
  className?: string;
}

export function MiniMapEmbed({ lat, lng, name, delta = 0.005, className }: MiniMapEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_name=${encodeURIComponent(name)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Mở ${name} trên Google Maps`}
      className={cn("group relative block overflow-hidden", className)}
    >
      {/* Skeleton while iframe loads */}
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}

      <iframe
        src={embedUrl}
        title={name}
        loading="lazy"
        scrolling="no"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full border-0 transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ pointerEvents: "none" }}
      />

      {/* Hover overlay — directions CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
        <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-body-sm font-medium text-zinc-800 opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Navigation size={13} className="text-brand-500" />
          Chỉ đường
        </span>
      </div>
    </a>
  );
}
