import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles, Star, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { DynamicHeroBackground, DynamicHeroText, FloatingWavingFlags } from "@/components/motion";
import { CategoriesBento } from "@/components/CategoriesBento";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Glass } from "@/ui/glass";
import { Card, CardBody } from "@/ui/card";
import { SearchBar } from "@/features/search/components/SearchBar";
import { PlaceCard } from "@/features/place/components/PlaceCard";
import { CityCard } from "@/features/region/components/CityCard";
import { categoriesByGroup } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { getFeaturedPlaces } from "@/features/place/data";
import { getSiteStats, type SiteStats } from "@/features/place/lib/queries";
import { getRecentActivity } from "@/features/activity/lib/queries";
import { ActivityFeed } from "@/features/activity/components/ActivityFeed";
import { getHeroPresets, resolveRegionKey } from "@/features/admin/lib/hero-presets-queries";
import { detectServerGeo } from "@/lib/server-geo";
import { listCuratedTrips } from "@/features/trip-template/lib/queries";
import { CuratedTripCard } from "@/features/trip-template/components/CuratedTripCard";
import type { PlaceCardData } from "@/features/place/components/PlaceCard";
import { featuredCities, collections } from "@/features/region/data";

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export default async function LandingPage() {
  const [featuredPlaces, stats, activity, heroPresets, geo, curatedTrips] = await Promise.all([
    getFeaturedPlaces(),
    getSiteStats(),
    getRecentActivity(8),
    getHeroPresets(),
    detectServerGeo(),
    listCuratedTrips(6),
  ]);
  const initialHeroRegion = resolveRegionKey(heroPresets, geo.city, geo.region);
  return (
    <>
      <HeroSection stats={stats} heroPresets={heroPresets} initialRegion={initialHeroRegion} />
      <CategoriesBento />
      <CitiesSection />
      <PlacesSection places={featuredPlaces} />
      {activity.length > 0 && <ActivitySection initial={activity} />}
      {curatedTrips.length > 0 && <CuratedTripsSection trips={curatedTrips} />}
      <CollectionsSection />
      <MapCtaSection stats={stats} />
      <StatsSection />
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function HeroSection({
  stats,
  heroPresets,
  initialRegion,
}: {
  stats: SiteStats;
  heroPresets: Awaited<ReturnType<typeof getHeroPresets>>;
  initialRegion: string | null;
}) {
  const userLabel = stats.userCount > 0 ? formatCompact(stats.userCount) : null;
  const placeLabel = `${formatCompact(stats.placeCount)}+`;
  return (
    <section className="relative isolate pt-36 md:pt-[19rem]">{/* */}
      {/* Dynamic Adaptive Background */}
      <DynamicHeroBackground presets={heroPresets} initialRegion={initialRegion} />
      <div className="container relative pb-24 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge variant="brand" className="bg-white/10 text-white backdrop-blur ring-1 ring-white/15">
              <Sparkles size={12} className="text-brand-500" />
              Bản beta · 2026
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-5 font-display text-display-lg leading-[1.05] text-white md:text-display-xl">
              Ăn chơi Việt Nam, <DynamicHeroText />
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/85">
              Bản đồ cộng đồng cho quán ăn, cafe, bar, rooftop, hidden gem và trải nghiệm
              local. Lưu địa điểm, dựng chuyến đi, đóng góp nơi bạn yêu thích.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar placeholder="Bạn muốn đi đâu?" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/explore">
                  <Map size={18} /> Mở bản đồ
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link href="/trip/new">
                  <Compass size={18} /> Lên chuyến đi
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 rounded-full bg-black/30 backdrop-blur-md px-6 py-2.5 border border-white/10 shadow-lg text-body-sm text-white/95 select-none transition-all hover:bg-black/35 hover:border-white/15">
              <span className="flex items-center gap-1.5 font-medium">
                <Star size={14} className="fill-warning text-warning" />{" "}
                {stats.avgRating.toFixed(1)}
                {userLabel ? ` từ ${userLabel} người dùng` : ` · ${formatCompact(stats.reviewCount)} đánh giá`}
              </span>
              <span className="hidden h-3 w-px bg-white/15 md:inline" />
              <span className="flex items-center gap-1.5 font-medium">
                <Users size={14} className="text-white/80" /> {placeLabel} địa điểm được duyệt
              </span>
              <span className="hidden h-3 w-px bg-white/15 md:inline" />
              <span className="font-medium">{stats.provinceCount} tỉnh thành</span>
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

function CitiesSection() {
  return (
    <section className="container pb-20 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <Reveal>
          <div>
            <p className="text-overline text-brand-600">ĐIỂM ĐẾN NỔI BẬT</p>
            <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
              Ba miền, một hành trình.
            </h2>
            <p className="mt-3 max-w-xl text-body-lg text-text-muted">
              Bắt đầu từ thành phố lớn, lan toả đến từng tỉnh thành — mỗi nơi một câu chuyện riêng.
            </p>
          </div>
        </Reveal>
        <Link
          href="/region"
          className="hidden shrink-0 items-center gap-1 text-body text-brand-600 hover:underline md:inline-flex"
        >
          Xem tất cả <ArrowRight size={16} />
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

function PlacesSection({ places }: { places: PlaceCardData[] }) {
  return (
    <section className="border-t border-border bg-surface-2/40">
      <div className="container py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="text-overline text-brand-600">TRẢI NGHIỆM NỔI BẬT</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                Địa điểm được yêu thích nhất.
              </h2>
              <p className="mt-3 max-w-xl text-body-lg text-text-muted">
                Được tuyển chọn từ hàng ngàn review của cộng đồng du khách.
              </p>
            </div>
          </Reveal>
          <Link
            href="/explore"
            className="hidden shrink-0 items-center gap-1 text-body text-brand-600 hover:underline md:inline-flex"
          >
            Xem trên bản đồ <ArrowRight size={16} />
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

function ActivitySection({ initial }: { initial: Awaited<ReturnType<typeof getRecentActivity>> }) {
  return (
    <section className="border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: heading + CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-overline text-brand-600">NHỊP SỐNG CỘNG ĐỒNG</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                Việt Nam đang được khám phá.
              </h2>
              <p className="mt-4 max-w-md text-body-lg text-text-muted">
                Mỗi địa điểm bạn thấy ở đây vừa được duyệt hoặc đánh giá trong vài giờ qua —
                bởi những người đi trước.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/submit">
                    <Sparkles size={16} /> Đóng góp địa điểm
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/explore">
                    Mở bản đồ <ArrowRight size={16} />
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
}: {
  trips: Awaited<ReturnType<typeof listCuratedTrips>>;
}) {
  return (
    <section className="border-t border-border bg-surface-2/40">
      <div className="container py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="text-overline text-brand-600">LỊCH TRÌNH TINH TUYỂN</p>
              <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
                Sao chép — đi liền.
              </h2>
              <p className="mt-3 max-w-xl text-body-lg text-text-muted">
                Lộ trình đa ngày do biên tập viên thiết kế, theo mùa và vùng — chỉ cần
                bấm sao chép vào chuyến đi của bạn rồi tinh chỉnh.
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

/* ------------------------------ Collections ------------------------------ */

function CollectionsSection() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mb-10">
        <Reveal>
          <p className="text-overline text-brand-600">BỘ SƯU TẬP</p>
          <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
            Cung đường tinh tuyển.
          </h2>
          <p className="mt-3 max-w-xl text-body-lg text-text-muted">
            Lộ trình do biên tập viên thiết kế — sẵn sàng để mang đi.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <Link href={`/collection/${c.slug}`} className="group block">
              <Card tier="place" className="overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={c.cover}
                    alt={c.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full glass-subtle px-2.5 py-1 text-caption text-white">
                    {c.days} ngày · {c.placeCount} địa điểm
                  </div>
                </div>
                <CardBody>
                  <h3 className="font-display text-h3 text-text">{c.title}</h3>
                  <p className="mt-1 text-body-sm text-text-muted">{c.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-body-sm text-brand-600">
                    Xem chi tiết
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </CardBody>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Map CTA -------------------------------- */

function MapCtaSection({ stats }: { stats: SiteStats }) {
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
              <p className="text-overline text-brand-500">BẢN ĐỒ TƯƠNG TÁC</p>
              <h2 className="mt-2 font-display text-display-lg leading-[1.05]">
                Toàn Việt Nam.<br /> Một bản đồ.
              </h2>
              <p className="mt-4 max-w-md text-body-lg text-white/80">
                Pan, zoom, filter theo chủ đề. Click marker để xem chi tiết. Lưu danh sách, dựng chuyến đi —
                tất cả trong một màn hình.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/explore">
                    <Map size={18} /> Mở bản đồ
                  </Link>
                </Button>
                <Button variant="glass" size="lg" asChild>
                  <Link href="/search">
                    Tìm địa điểm
                  </Link>
                </Button>
              </div>
            </div>

            <Glass variant="strong" className="hidden p-6 md:block border-white/20 dark:border-white/10">
              <div className="grid grid-cols-2 gap-4 text-text dark:text-white">
                {[
                  { k: String(stats.provinceCount), v: "Tỉnh thành" },
                  { k: `${formatCompact(stats.placeCount)}+`, v: "Địa điểm" },
                  { k: String(stats.categoryCount), v: "Danh mục" },
                  {
                    k:
                      stats.userCount > 0
                        ? formatCompact(stats.userCount)
                        : formatCompact(stats.reviewCount),
                    v: stats.userCount > 0 ? "Người dùng" : "Đánh giá",
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

function StatsSection() {
  const features = [
    {
      icon: Map,
      title: "Bản đồ tương tác",
      desc: "Mapbox với custom style, cluster, fly-to mượt cho mọi thiết bị.",
      color: "var(--cat-beach)",
    },
    {
      icon: Sparkles,
      title: "Nội dung tuyển chọn",
      desc: "Mỗi địa điểm đều được biên tập viên duyệt — ảnh đẹp, mô tả chuẩn.",
      color: "var(--brand-500)",
    },
    {
      icon: Compass,
      title: "Trip planner",
      desc: "Kéo thả địa điểm vào ngày, chia sẻ link cho bạn bè cùng đi.",
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
              VÌ SAO {siteConfig.name.toUpperCase()}
            </p>
            <h2 className="mt-4 font-display text-h1 md:text-display-lg text-text">
              Premium nhưng <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-500 to-gold-500">thân thuộc</span>.
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
