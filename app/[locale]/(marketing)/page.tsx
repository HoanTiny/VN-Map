import Image from "next/image";
import { preload } from "react-dom";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles, Star, Users } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Reveal } from "@/components/Reveal";
import { DynamicHeroBackground, DynamicHeroText } from "@/components/motion";
import { CategoriesBento } from "@/components/CategoriesBento";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Glass } from "@/ui/glass";
import { SearchBar } from "@/features/search/components/SearchBar";
import { PlaceCard } from "@/features/place/components/PlaceCard";
import { CityCard } from "@/features/region/components/CityCard";
import { siteConfig } from "@/config/site";
import { getFeaturedPlaces } from "@/features/place/data";
import { getSiteStats, type SiteStats } from "@/features/place/lib/queries";
import { getRecentActivity } from "@/features/activity/lib/queries";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { getHeroPresets, resolveRegionKey, getInitialHeroImageUrl } from "@/features/admin/lib/hero-presets-queries";
import { detectServerGeo } from "@/lib/server-geo";
import { listCuratedTrips } from "@/features/trip-template/lib/queries";
import { CuratedTripCard } from "@/features/trip-template/components/CuratedTripCard";
import type { PlaceCardData } from "@/features/place/components/PlaceCard";
import { featuredCities } from "@/features/region/data";

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export async function generateMetadata() {
  const [tc, locale] = await Promise.all([getTranslations("Common"), getLocale()]);
  const ogUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(siteConfig.name)}&subtitle=${encodeURIComponent(tc("tagline"))}&locale=${locale}`;
  return {
    description: tc("tagline"),
    alternates: localizedAlternates("/", locale),
    openGraph: {
      title: siteConfig.name,
      description: tc("tagline"),
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      locale: locale === "en" ? "en_US" : "vi_VN",
    },
    twitter: { card: "summary_large_image" as const, title: siteConfig.name, description: tc("tagline") },
  };
}

export default async function LandingPage() {
  const [featuredPlaces, stats, activity, heroPresets, geo, curatedTrips, t, tc] = await Promise.all([
    getFeaturedPlaces(),
    getSiteStats(),
    getRecentActivity(8),
    getHeroPresets(),
    detectServerGeo(),
    listCuratedTrips(6),
    getTranslations("Home"),
    getTranslations("Common"),
  ]);
  const initialHeroRegion = resolveRegionKey(heroPresets, geo.city, geo.region);
  const heroImgUrl = getInitialHeroImageUrl(heroPresets, initialHeroRegion);
  if (heroImgUrl) preload(heroImgUrl, { as: "image", fetchPriority: "high" });
  return (
    <>
      <HeroSection stats={stats} heroPresets={heroPresets} initialRegion={initialHeroRegion} t={t} />
      <CategoriesBento />
      <CitiesSection t={t} tc={tc} />
      <PlacesSection places={featuredPlaces} t={t} tc={tc} />
      {activity.length > 0 && <ActivitySection initial={activity} t={t} tc={tc} />}
      {curatedTrips.length > 0 && <CuratedTripsSection trips={curatedTrips} t={t} />}
      <MapCtaSection stats={stats} t={t} />
      <StatsSection t={t} />
    </>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"Home">>>;
type TC = Awaited<ReturnType<typeof getTranslations<"Common">>>;

/* ---------------------------------- Hero ---------------------------------- */

function HeroSection({
  stats,
  heroPresets,
  initialRegion,
  t,
}: {
  stats: SiteStats;
  heroPresets: Awaited<ReturnType<typeof getHeroPresets>>;
  initialRegion: string | null;
  t: T;
}) {
  const userLabel = stats.userCount > 0 ? formatCompact(stats.userCount) : null;
  const placeLabel = `${formatCompact(stats.placeCount)}+`;
  const rating = stats.avgRating.toFixed(1);
  return (
    <section className="relative isolate pt-36 md:pt-[19rem]">{/* */}
      {/* Dynamic Adaptive Background */}
      <DynamicHeroBackground presets={heroPresets} initialRegion={initialRegion} />
      <div className="container relative pb-24 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge variant="brand" className="bg-white/10 text-white backdrop-blur ring-1 ring-white/15">
              <Sparkles size={12} className="text-brand-500" />
              {t("betaBadge")}
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-5 font-display text-display-lg leading-[1.05] text-white md:text-display-xl">
              {t("heroTitlePrefix")} <DynamicHeroText />
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/85">
              {t("heroSubtitle")}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar placeholder={t("heroSearchPlaceholder")} />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/explore">
                  <Map size={18} /> {t("ctaOpenMap")}
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link href="/trip/new">
                  <Compass size={18} /> {t("ctaPlanTrip")}
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 rounded-full bg-black/30 backdrop-blur-md px-6 py-2.5 border border-white/10 shadow-lg text-body-sm text-white/95 select-none transition-all hover:bg-black/35 hover:border-white/15">
              <span className="flex items-center gap-1.5 font-medium">
                <Star size={14} className="fill-warning text-warning" />{" "}
                {userLabel
                  ? t("statsRatingFrom", { rating, count: userLabel })
                  : t("statsRatingReviews", { rating, count: formatCompact(stats.reviewCount) })}
              </span>
              <span className="hidden h-3 w-px bg-white/15 md:inline" />
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-white/80" /> {t("statsPlacesApproved", { count: placeLabel })}
              </span>
              <span className="hidden h-3 w-px bg-white/15 md:inline" />
              <span className="font-medium">{t("statsProvinces", { count: stats.provinceCount })}</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Premium easing transition fade to page body */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            color-mix(in srgb, var(--bg) 8%, transparent) 20%,
            color-mix(in srgb, var(--bg) 24%, transparent) 65%,
            color-mix(in srgb, var(--bg) 54%, transparent) 82%,
            color-mix(in srgb, var(--bg) 100%, transparent) 100%
          )`,
        }}
      />
    </section>
  );
}

/* --------------------------------- Cities --------------------------------- */

function CitiesSection({ t, tc }: { t: T; tc: TC }) {
  return (
    <section className="container pb-20 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <Reveal>
          <div>
            <p className="text-overline text-brand-600">{t("citiesOverline")}</p>
            <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
              {t("citiesTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-body-lg text-text-muted">
              {t("citiesSubtitle")}
            </p>
          </div>
        </Reveal>
        <Link
          href="/region"
          className="hidden shrink-0 items-center gap-1 text-body text-brand-600 hover:underline md:inline-flex"
        >
          {tc("viewAll")} <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {featuredCities.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <CityCard city={c} priority={i === 0} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Places --------------------------------- */

function PlacesSection({ places, t, tc }: { places: PlaceCardData[]; t: T; tc: TC }) {
  return (
    <section className="border-t border-border bg-surface-2/40">
      <div className="container py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="text-overline text-brand-600">{t("placesOverline")}</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                {t("placesTitle")}
              </h2>
              <p className="mt-3 max-w-xl text-body-lg text-text-muted">
                {t("placesSubtitle")}
              </p>
            </div>
          </Reveal>
          <Link
            href="/explore"
            className="hidden shrink-0 items-center gap-1 text-body text-brand-600 hover:underline md:inline-flex"
          >
            {tc("viewOnMap")} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {places.slice(0, 8).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 0.06} className="h-full">
              <PlaceCard place={p} priority={i < 2} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Activity ------------------------------- */

function ActivitySection({
  initial,
  t,
  tc,
}: {
  initial: Awaited<ReturnType<typeof getRecentActivity>>;
  t: T;
  tc: TC;
}) {
  return (
    <section className="border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: heading + CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-overline text-brand-600">{t("activityOverline")}</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                {t("activityTitle")}
              </h2>
              <p className="mt-4 max-w-md text-body-lg text-text-muted">
                {t("activitySubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/submit">
                    <Sparkles size={16} /> {t("contributePlace")}
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/explore">
                    {tc("openMap")} <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Right: live feed */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <ActivityFeed initial={initial} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Curated trips ---------------------------- */

function CuratedTripsSection({
  trips,
  t,
}: {
  trips: Awaited<ReturnType<typeof listCuratedTrips>>;
  t: T;
}) {
  return (
    <section id="bo-suu-tap" className="border-t border-border bg-surface-2/40 scroll-mt-24">
      <div className="container py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="text-overline text-brand-600">{t("collectionsOverline")}</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                {t("collectionsTitle")}
              </h2>
              <p className="mt-3 max-w-xl text-body-lg text-text-muted">
                {t("collectionsSubtitle")}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t, i) => (
            <Reveal key={t.slug} delay={(i % 3) * 0.06}>
              <CuratedTripCard trip={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


/* -------------------------------- Map CTA -------------------------------- */

function MapCtaSection({ stats, t }: { stats: SiteStats; t: T }) {
  return (
    <section className="container pb-20 md:pb-28">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-2xl border border-border">
          <Image
            src="https://images.unsplash.com/photo-1528127269322-539801943592?w=2400&q=85"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

          <div className="relative grid items-center gap-6 p-8 md:grid-cols-2 md:gap-10 md:p-14 lg:p-20">
            <div className="text-white">
              <p className="text-overline text-brand-500">{t("mapCtaOverline")}</p>
              <h2 className="mt-2 font-display text-display-lg leading-[1.05]">
                {t.rich("mapCtaTitle", {
                  br: () => <br />,
                })}
              </h2>
              <p className="mt-4 max-w-md text-body-lg text-white/80">
                {t("mapCtaSubtitle")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/explore">
                    <Map size={18} /> {t("ctaOpenMap")}
                  </Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link href="/search">
                    {t("mapCtaFindPlaces")}
                  </Link>
                </Button>
              </div>
            </div>

            <Glass variant="strong" className="hidden p-6 md:block border-white/20 dark:border-white/10">
              <div className="grid grid-cols-2 gap-4 text-text dark:text-white">
                {[
                  { k: String(stats.provinceCount), v: t("statProvinces") },
                  { k: `${formatCompact(stats.placeCount)}+`, v: t("statPlaces") },
                  { k: String(stats.categoryCount), v: t("statCategories") },
                  {
                    k:
                      stats.userCount > 0
                        ? formatCompact(stats.userCount)
                        : formatCompact(stats.reviewCount),
                    v: stats.userCount > 0 ? t("statUsers") : t("statReviews"),
                  },
                ].map((s) => (
                  <div 
                    key={s.v} 
                    className="rounded-xl bg-black/[0.04] dark:bg-white/5 p-4 border border-black/[0.04] dark:border-white/5 backdrop-blur-sm animate-pulse-subtle"
                  >
                    <div className="font-display text-h1 font-extrabold text-text dark:text-white tracking-tight">{s.k}</div>
                    <div className="text-body-sm text-text-muted dark:text-white/70 font-bold mt-0.5">{s.v}</div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- Stats --------------------------------- */

function StatsSection({ t }: { t: T }) {
  const features = [
    {
      icon: Map,
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      color: "var(--cat-beach)",
    },
    {
      icon: Sparkles,
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      color: "var(--brand-500)",
    },
    {
      icon: Compass,
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      color: "var(--cat-rooftop)",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-surface-2/10 dark:bg-surface/5">
      {/* Decorative ambient background: Giant Glowing Vietnamese Gold Star + Red Aura */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Soft Red/Pink Ambient Aura (representing the flag background) */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-500/10 via-rose-500/5 to-transparent blur-[120px] dark:from-brand-500/22 dark:via-rose-600/10 dark:to-transparent animate-pulse"
          style={{ animationDuration: '8s' }}
        />

        {/* Floating, slowly rotating Glowing Gold Star */}
        <div 
          className="absolute w-[460px] h-[460px] opacity-[0.16] dark:opacity-[0.24] transition-opacity duration-slower"
          style={{
            animation: 'floatAndRotateStar 40s linear infinite',
          }}
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_60px_rgba(255,205,0,0.5)]"
          >
            {/* Premium Gold Gradient Fill */}
            <defs>
              <linearGradient id="gold-star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-100)" />
                <stop offset="50%" stopColor="var(--gold-500)" />
                <stop offset="100%" stopColor="var(--gold-700)" />
              </linearGradient>
              {/* Gold Stroke Gradient */}
              <linearGradient id="gold-star-stroke" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--gold-500)" />
                <stop offset="100%" stopColor="var(--gold-100)" />
              </linearGradient>
            </defs>
            <path 
              d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" 
              fill="url(#gold-star-gradient)"
              stroke="url(#gold-star-stroke)"
              strokeWidth="0.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* CSS Keyframes for slow float and rotation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes floatAndRotateStar {
            0% {
              transform: rotate(0deg) translateY(0px) scale(1);
            }
            50% {
              transform: rotate(180deg) translateY(-20px) scale(1.04);
            }
            100% {
              transform: rotate(360deg) translateY(0px) scale(1);
            }
          }
        `}} />
      </div>

      <div className="container py-24 md:py-32 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Reveal>
            <p className="text-overline tracking-[0.25em] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500">
              {t("whyOverline", { name: siteConfig.name.toUpperCase() })}
            </p>
            <h2 className="mt-4 font-display text-h1 md:text-display-lg text-text">
              {t.rich("whyTitle", {
                em: (chunks) => (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-500 to-gold-500">
                    {chunks}
                  </span>
                ),
              })}
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <div
                  className="group relative rounded-3xl border border-border bg-surface p-8 md:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl liquid-glass-card overflow-hidden"
                  style={{ "--cat-color": f.color } as React.CSSProperties}
                >
                  {/* Subtle card grid mesh pattern on hover */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Glowing halo behind icon */}
                  <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundColor: f.color }} />

                  <div
                    className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-transparent shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${f.color} 10%, transparent)`,
                      color: f.color,
                      borderColor: `color-mix(in srgb, ${f.color} 20%, transparent)`,
                    }}
                  >
                    <Icon size={24} className="transition-transform duration-300 group-hover:scale-105" />
                  </div>

                  <h3 className="mt-6 font-display text-h3 text-text font-bold tracking-tight group-hover:text-brand-600 transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-body-md text-text-muted leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
