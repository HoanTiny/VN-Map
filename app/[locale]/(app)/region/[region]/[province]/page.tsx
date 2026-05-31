import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  regionByKey,
  provinces,
  provinceBySlug,
  type RegionKey,
} from "@/config/regions";
import { listPlacesByProvince } from "@/features/place/lib/queries";
import { siteConfig } from "@/config/site";
import { localizedAlternates } from "@/i18n/metadata";
import { PlaceGrid } from "@/features/place/components/PlaceGrid";
import { categories, type CategoryKey } from "@/config/categories";

interface Params {
  region: string;
  province: string;
}

export function generateStaticParams() {
  return provinces.map((p) => ({ region: p.region, province: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { region, province } = await params;
  const [t, locale] = await Promise.all([getTranslations("RegionPage"), getLocale()]);
  const prov = provinceBySlug[province];
  if (!prov) return { title: t("notFound") };
  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(prov.name)}&subtitle=${encodeURIComponent(prov.tagline)}&cover=${encodeURIComponent(prov.cover)}&locale=${locale}`;
  return {
    title: `${prov.name} · Map-VN`,
    description: prov.tagline,
    openGraph: {
      title: prov.name,
      description: prov.tagline,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: prov.name, description: prov.tagline },
    alternates: localizedAlternates(`/region/${region}/${province}`, locale),
  };
}

export default async function ProvincePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { region, province } = await params;
  const sp = await searchParams;
  const r = regionByKey[region as RegionKey];
  const prov = provinceBySlug[province];
  if (!r || !prov || prov.region !== r.key) notFound();

  const [all, t, locale] = await Promise.all([
    listPlacesByProvince(prov.name),
    getTranslations("RegionPage"),
    getLocale(),
  ]);
  const catFilter = sp.cat ?? null;
  const visible = catFilter ? all.filter((p) => p.category === catFilter) : all;

  // Category breakdown
  const catCounts = new Map<CategoryKey, number>();
  all.forEach((p) => {
    catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  });
  const presentCats = categories.filter((c) => catCounts.has(c.key));

  return (
    <article className="pb-24">
      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-24 md:pt-28">
        <div className="absolute inset-0 -z-10">
          <Image
            src={prov.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-bg" />
        </div>
        <div className="container pb-16 text-white">
          <Reveal>
            <div className="flex items-center gap-1 text-body-sm text-white/80">
              <Link href="/region" className="hover:text-white">{t("regionLink")}</Link>
              <span>›</span>
              <Link href={`/region/${r.key}`} className="hover:text-white">{r.label}</Link>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-overline text-white/80">{r.label.toUpperCase()}</p>
            <h1 className="mt-2 font-display text-display-xl">{prov.name}</h1>
            <p className="mt-3 max-w-2xl text-body-lg text-white/85">{prov.tagline}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="bg-white/15 text-white">
                {t("placeCount", { count: all.length })}
              </Badge>
              <Badge variant="neutral" className="bg-white/15 text-white">
                {t("categoriesCount", { count: presentCats.length })}
              </Badge>
              <Button variant="glass" size="sm" asChild className="ml-2">
                <Link href={`/explore?province=${prov.slug}`}>
                  <MapPin size={14} /> {t("viewOnMap")}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category breakdown */}
      {presentCats.length > 0 && (
        <section className="container py-10">
          <Reveal>
            <h2 className="mb-4 font-display text-h2 text-text">{t("exploreByCategory")}</h2>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap gap-2">
              <CatChip
                href={`/region/${r.key}/${prov.slug}`}
                label={t("allCategories")}
                count={all.length}
                active={!catFilter}
              />
              {presentCats.map((c) => {
                const Icon = c.icon;
                return (
                  <CatChip
                    key={c.key}
                    href={`/region/${r.key}/${prov.slug}?cat=${c.key}`}
                    label={locale === "en" ? c.label : c.labelVi}
                    count={catCounts.get(c.key) ?? 0}
                    active={catFilter === c.key}
                    icon={<Icon size={14} style={{ color: c.color }} />}
                  />
                );
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* Places grid */}
      <section className="container">
        <Reveal>
          <p className="mb-4 text-body-sm text-text-muted">
            {catFilter
              ? t("resultsCountWithCat", {
                  count: visible.length,
                  category: (() => {
                    const c = categories.find((x) => x.key === catFilter);
                    if (!c) return "";
                    return locale === "en" ? c.label : c.labelVi;
                  })(),
                })
              : t("resultsCount", { count: visible.length })}
          </p>
        </Reveal>
        <PlaceGrid places={visible} />

        {visible.length > 0 && (
          <Reveal>
            <div className="mt-12 flex items-center justify-between rounded-2xl border border-border bg-surface p-6">
              <div>
                <p className="font-display text-h3 text-text">{t("contributeTitle")}</p>
                <p className="mt-1 text-body-sm text-text-muted">
                  {t("contributeHint", { place: prov.name })}
                </p>
              </div>
              <Button asChild>
                <Link href="/submit">{t("contributeCta")}</Link>
              </Button>
            </div>
          </Reveal>
        )}
      </section>
    </article>
  );
}

function CatChip({
  href,
  label,
  count,
  active,
  icon,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-500 bg-brand-50 px-3 text-body-sm font-medium text-brand-700"
          : "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-body-sm font-medium text-text hover:bg-surface-2"
      }
    >
      {icon}
      {label}
      <span
        className={
          active
            ? "rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white"
            : "rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-text-muted"
        }
      >
        {count}
      </span>
    </Link>
  );
}
