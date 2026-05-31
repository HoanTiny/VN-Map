import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  regions,
  regionByKey,
  provincesByRegion,
  type RegionKey,
} from "@/config/regions";
import { listAllPlaces } from "@/features/place/lib/queries";

interface Params {
  region: string;
}

export function generateStaticParams() {
  return regions.map((r) => ({ region: r.key }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { region } = await params;
  const [t, locale] = await Promise.all([getTranslations("RegionPage"), getLocale()]);
  const r = regionByKey[region as RegionKey];
  if (!r) return { title: t("notFound") };
  return {
    title: `${r.label} · Map-VN`,
    description: r.description,
    alternates: localizedAlternates(`/region/${region}`, locale),
  };
}

export default async function RegionPage({ params }: { params: Promise<Params> }) {
  const { region } = await params;
  const r = regionByKey[region as RegionKey];
  if (!r) notFound();

  const provs = provincesByRegion[r.key];
  const [allPlaces, t] = await Promise.all([listAllPlaces(), getTranslations("RegionPage")]);
  const placeCounts = new Map<string, number>();
  allPlaces.forEach((p) => {
    placeCounts.set(p.province, (placeCounts.get(p.province) ?? 0) + 1);
  });

  return (
    <article className="pb-24">
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-24 md:pt-28">
        <div className="absolute inset-0 -z-10">
          <Image
            src={r.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-bg" />
        </div>
        <div className="container pb-16 text-white">
          <Reveal>
            <Link
              href="/region"
              className="inline-flex items-center gap-1 text-body-sm text-white/80 hover:text-white"
            >
              <ArrowLeft size={14} /> {t("regionLink")}
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-overline text-white/80">{t("detailMeta")}</p>
            <h1 className="mt-2 font-display text-display-xl">{r.label}</h1>
            <p className="mt-3 max-w-2xl text-body-lg text-white/85">{r.description}</p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="neutral" className="bg-white/15 text-white">
                {t("provinceCount", { count: provs.length })}
              </Badge>
              <Badge variant="neutral" className="bg-white/15 text-white">
                {t("placeCount", { count: provs.reduce((sum, p) => sum + (placeCounts.get(p.name) ?? 0), 0) })}
              </Badge>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Province grid */}
      <section className="container py-12">
        <Reveal>
          <h2 className="mb-6 font-display text-h2 text-text">{t("provincesInRegion")}</h2>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {provs.map((p) => (
            <StaggerItem key={p.slug}>
              <ProvinceCard
                href={`/region/${r.key}/${p.slug}`}
                name={p.name}
                tagline={p.tagline}
                cover={p.cover}
                placeCountLabel={t("placeCount", { count: placeCounts.get(p.name) ?? 0 })}
              />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal>
          <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
            <p className="font-display text-h3 text-text">{t("exploreOnMap")}</p>
            <p className="mt-1 text-body-sm text-text-muted">
              {t("exploreOnMapHint", { region: r.label })}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/explore">
                <MapPin size={16} /> {t("openMap")}
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </article>
  );
}

function ProvinceCard({
  href,
  name,
  tagline,
  cover,
  placeCountLabel,
}: {
  href: string;
  name: string;
  tagline: string;
  cover: string;
  placeCountLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[16/11] overflow-hidden rounded-2xl shadow-md"
    >
      <Image
        src={cover}
        alt={name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-slow group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-5 bottom-5 text-white">
        <p className="font-display text-h2 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          {name}
        </p>
        <p className="mt-1 line-clamp-1 text-body-sm text-white/85">{tagline}</p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-caption text-white backdrop-blur">
          {placeCountLabel}
        </div>
      </div>
    </Link>
  );
}
