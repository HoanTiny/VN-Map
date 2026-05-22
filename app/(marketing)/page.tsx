import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles, Star, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { DynamicHeroBackground, DynamicHeroText } from "@/components/motion";
import { DraggableMarqueeRow } from "@/components/DraggableMarqueeRow";
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
import type { PlaceCardData } from "@/features/place/components/PlaceCard";
import { featuredCities, collections } from "@/features/region/data";

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export default async function LandingPage() {
  const [featuredPlaces, stats] = await Promise.all([
    getFeaturedPlaces(),
    getSiteStats(),
  ]);
  return (
    <>
      <HeroSection stats={stats} />
      <CategoriesStrip />
      <CitiesSection />
      <PlacesSection places={featuredPlaces} />
      <CollectionsSection />
      <MapCtaSection stats={stats} />
      <StatsSection />
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function HeroSection({ stats }: { stats: SiteStats }) {
  const userLabel = stats.userCount > 0 ? formatCompact(stats.userCount) : null;
  const placeLabel = `${formatCompact(stats.placeCount)}+`;
  return (
    <section className="relative isolate pt-36 md:pt-[19rem]">{/* */}
      {/* Dynamic Adaptive Background */}
      <DynamicHeroBackground />

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
            color-mix(in srgb, var(--bg) 80%, transparent) 92%,
            var(--bg) 100%
          )`,
        }}
      />
    </section>
  );
}

/* ------------------------------- Categories ------------------------------- */

const categoryMetadata: Record<
  string,
  { count: string; tagline: string; isHot?: boolean }
> = {
  cafe:       { count: "85+ quán",    tagline: "Không gian kết nối & khơi nguồn cảm hứng" },
  nightlife:  { count: "42+ pub",     tagline: "Giai điệu lôi cuốn & năng lượng đêm muộn", isHot: true },
  rooftop:    { count: "30+ view",    tagline: "Thu trọn hoàng hôn & toàn cảnh thành phố", isHot: true },
  checkin:    { count: "110+ điểm",   tagline: "Lưu giữ khoảnh khắc & góc máy nghệ thuật" },
  hidden:     { count: "25+ góc",     tagline: "Tìm về chốn bình yên sâu trong ngõ hẻm",  isHot: true },
  experience: { count: "50+ tour",    tagline: "Trải nghiệm bản địa chân thực cùng chuyên gia" },
  beach:      { count: "95+ bãi",     tagline: "Sóng vỗ cát vàng & ánh nắng vàng rực rỡ" },
  mountain:   { count: "60+ đỉnh",    tagline: "Chạm đỉnh sương mờ & săn mây đại ngàn" },
  heritage:   { count: "40+ di tích", tagline: "Dấu ấn thời gian & câu chuyện di sản xưa", isHot: true },
  food:       { count: "150+ quán",   tagline: "Hương vị đậm đà tinh hoa ẩm thực ba miền" },
  city:       { count: "85+ điểm",    tagline: "Khám phá góc phố nhộn nhịp & kiến trúc hiện đại" },
  nature:     { count: "35+ điểm",    tagline: "Trốn phố về rừng & lắng nghe âm thanh tự nhiên" },
};

function CatCard({
  c,
  className = "shrink-0 w-[230px] min-h-[170px]",
}: {
  c: (typeof categoriesByGroup)["lifestyle"][number];
  className?: string;
}) {
  const Icon = c.icon;
  const meta = categoryMetadata[c.key] ?? { count: "50+ điểm", tagline: "Khám phá ngay" };
  return (
    <Link
      href={`/category/${c.key}`}
      className={`group liquid-glass-card relative flex flex-col justify-between items-start overflow-hidden rounded-[24px] p-5 text-left hover:-translate-y-1 transition-transform duration-300 ${className}`}
      style={{ "--cat-color": c.color } as React.CSSProperties}
    >
      <div className="liquid-container absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-[28px]">
        <div className="blob blob-1" /><div className="blob blob-2" />
        <div className="blob blob-3" /><div className="blob blob-4" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-transparent opacity-90 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-20" />

      <div className="relative z-10 flex w-full items-start justify-between gap-2">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-[16px] transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:rotate-3"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${c.color} 20%, transparent) 0%, color-mix(in srgb, ${c.color} 8%, transparent) 100%)`,
            color: c.color,
            border: `1px solid color-mix(in srgb, ${c.color} 30%, transparent)`,
          }}
        >
          <Icon size={18} />
        </span>
        <div className="flex flex-col items-end gap-1">
          {meta.isHot && (
            <span className="flex items-center gap-0.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-500 ring-1 ring-red-500/20">
              🔥 HOT
            </span>
          )}
          <span className="rounded-full bg-text/5 px-2 py-0.5 text-[10px] font-bold text-text-muted">
            {meta.count}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-4 w-full">
        <span className="font-display text-base font-bold text-text group-hover:text-[var(--cat-color)] transition-colors duration-300">
          {c.labelVi}
        </span>
        <p className="mt-1 line-clamp-2 text-[11px] text-text-muted leading-relaxed">
          {meta.tagline}
        </p>
      </div>

      <span className="absolute bottom-4 right-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 dark:bg-black/40 text-[var(--cat-color)] shadow-sm border border-border/40 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight size={12} className="stroke-[2.5]" />
      </span>
    </Link>
  );
}

function CategoriesStrip() {
  const lifestyle = categoriesByGroup["lifestyle"];
  const travel = categoriesByGroup["travel"];

  return (
    <section className="py-16 overflow-hidden">
      {/* Keyframes — scoped inline to avoid globals pollution */}
      <style>{`
        @keyframes cat-marquee-l {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="cat-marquee-l"] { animation: none !important; }
        }
      `}</style>

      {/* Section header */}
      <Reveal>
        <div className="container mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-brand-600 uppercase mb-1">DANH MỤC</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-text">
              Khám phá theo chủ đề
            </h2>
          </div>
          <Link
            href="/explore"
            className="shrink-0 inline-flex items-center gap-1 text-body-sm text-brand-600 hover:underline"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
      </Reveal>

      {/* ── Mobile: static 2-col tap-friendly grid ── */}
      <div className="md:hidden container grid grid-cols-2 gap-3">
        {[...lifestyle, ...travel].map((c) => (
          <CatCard key={c.key} c={c} className="w-full min-h-[150px]" />
        ))}
      </div>

      {/* ── Desktop: drag-to-scroll marquee ── */}
      <div
        className="hidden md:block space-y-3"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        }}
      >
        <DraggableMarqueeRow animName="cat-marquee-l" duration={28} direction="left">
          {[...lifestyle, ...lifestyle].map((c, i) => (
            <CatCard key={`ls-${i}`} c={c} />
          ))}
        </DraggableMarqueeRow>

        <DraggableMarqueeRow animName="cat-marquee-l" duration={34} direction="right">
          {[...travel, ...travel].map((c, i) => (
            <CatCard key={`tr-${i}`} c={c} />
          ))}
        </DraggableMarqueeRow>
      </div>

      {/* SVG Gooey Filter for Apple Liquid Glass */}
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
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
            <Reveal key={p.slug} delay={(i % 4) * 0.06}>
              <PlaceCard place={p} priority={i < 2} />
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

            <Glass variant="strong" className="hidden p-6 md:block">
              <div className="grid grid-cols-2 gap-4 text-white">
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
                  <div key={s.v} className="rounded-xl bg-white/5 p-4">
                    <div className="font-display text-h1">{s.k}</div>
                    <div className="text-body-sm text-white/70">{s.v}</div>
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
    },
    {
      icon: Sparkles,
      title: "Nội dung tuyển chọn",
      desc: "Mỗi địa điểm đều được biên tập viên duyệt — ảnh đẹp, mô tả chuẩn.",
    },
    {
      icon: Compass,
      title: "Trip planner",
      desc: "Kéo thả địa điểm vào ngày, chia sẻ link cho bạn bè cùng đi.",
    },
  ];
  return (
    <section className="border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-overline text-brand-600">VÌ SAO {siteConfig.name.toUpperCase()}</p>
            <h2 className="mt-2 font-display text-h1 md:text-display-lg text-text">
              Premium nhưng thân thuộc.
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-h3 text-text">{f.title}</h3>
                  <p className="mt-2 text-body text-text-muted">{f.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
