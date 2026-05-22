import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { getCuratedTrip, SEASON_LABEL } from "@/features/trip-template/lib/queries";
import { ForkTripButton } from "@/features/trip-template/components/ForkTripButton";
import { listAllPlaces } from "@/features/place/lib/queries";
import { Badge } from "@/ui/badge";
import { PlaceCard, type PlaceCardData } from "@/features/place/components/PlaceCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getCuratedTrip(slug);
  if (!trip) return { title: "Lịch trình · Map-VN" };
  return {
    title: `${trip.title} · Map-VN`,
    description: trip.summary,
    openGraph: { images: [trip.cover] },
  };
}

export default async function CuratedTripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [trip, allPlaces] = await Promise.all([getCuratedTrip(slug), listAllPlaces()]);
  if (!trip) notFound();

  const placeBySlug = new Map(allPlaces.map((p) => [p.slug, p]));

  return (
    <div className="bg-bg">
      {/* Hero cover */}
      <section className="relative h-[55vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={trip.cover}
          alt={trip.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/80" />

        <div className="container relative flex h-full flex-col justify-end pb-12 text-white">
          <Link
            href="/"
            className="mb-auto mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-body-sm backdrop-blur hover:bg-black/50"
          >
            <ArrowLeft size={14} /> Trang chủ
          </Link>

          <div className="flex flex-wrap gap-2">
            <Badge variant="brand" className="shadow">{SEASON_LABEL[trip.season]}</Badge>
            <Badge variant="neutral" className="bg-black/40 text-white shadow">
              <Calendar size={11} /> {trip.duration_days} ngày
            </Badge>
            {trip.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="neutral" className="bg-white/10 text-white shadow">
                {t}
              </Badge>
            ))}
          </div>
          <h1 className="mt-3 max-w-3xl font-display text-display-md leading-tight md:text-display-xl">
            {trip.title}
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-white/85">{trip.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ForkTripButton slug={trip.slug} />
            {trip.destinations.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-body-sm text-white/80">
                <MapPin size={14} />
                {trip.destinations.join(" · ")}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Day-by-day itinerary */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          {trip.days.map((day, dayIdx) => {
            const dayPlaces = day.placeSlugs
              .map((s) => placeBySlug.get(s))
              .filter((p): p is NonNullable<typeof p> => Boolean(p));

            return (
              <div key={dayIdx} className="relative">
                <div className="mb-5 flex items-baseline gap-3">
                  <span className="font-display text-display-sm text-brand-600">
                    {String(dayIdx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-h2 text-text">{day.label}</h2>
                </div>

                {day.note && (
                  <p className="mb-5 rounded-2xl bg-surface-2/60 px-5 py-4 text-body text-text-muted ring-1 ring-border">
                    {day.note}
                  </p>
                )}

                {dayPlaces.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dayPlaces.map((p) => (
                      <PlaceCard key={p.id} place={p as unknown as PlaceCardData} />
                    ))}
                  </div>
                ) : (
                  <p className="text-body-sm text-text-subtle">
                    Chưa có địa điểm phù hợp trong DB cho ngày này.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
