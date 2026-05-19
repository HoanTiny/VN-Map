import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Map, Sparkles, Star, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Glass } from "@/ui/glass";
import { Card, CardBody } from "@/ui/card";
import { SearchBar } from "@/features/search/components/SearchBar";
import { PlaceCard } from "@/features/place/components/PlaceCard";
import { CityCard } from "@/features/region/components/CityCard";
import { categoriesByGroup } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { featuredPlaces } from "@/features/place/data";
import { featuredCities, collections } from "@/features/region/data";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <CategoriesStrip />
      <CitiesSection />
      <PlacesSection />
      <CollectionsSection />
      <MapCtaSection />
      <StatsSection />
    </>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden pt-28 md:pt-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1528127269322-539801943592?w=2400&q=85"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent" />
      </div>

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
              Khám phá Việt Nam,{" "}
              <span className="text-brand-500">từng địa điểm một.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/85">
              Bản đồ trải nghiệm cho người yêu Việt Nam — biển, núi, di sản, ẩm thực, đô thị, thiên nhiên.
              Lưu địa điểm, dựng chuyến đi, chia sẻ cung đường.
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-warning text-warning" /> 4.8 từ 12k người dùng
              </span>
              <span className="hidden h-3 w-px bg-white/20 md:inline" />
              <span className="flex items-center gap-1.5">
                <Users size={14} /> 580+ địa điểm được duyệt
              </span>
              <span className="hidden h-3 w-px bg-white/20 md:inline" />
              <span>63 tỉnh thành</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* fade to body */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
    </section>
  );
}

/* ------------------------------- Categories ------------------------------- */

function CategoriesStrip() {
  const groups: Array<{ key: "lifestyle" | "travel"; label: string; sub: string }> = [
    { key: "lifestyle", label: "Ăn chơi", sub: "Cafe · bar · rooftop · check-in · hidden gems" },
    { key: "travel", label: "Khám phá", sub: "Biển · núi · di sản · thiên nhiên · đô thị" },
  ];

  return (
    <section className="container py-10 space-y-10">
      {groups.map(({ key, label, sub }) => (
        <Reveal key={key}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-overline text-brand-600">{label.toUpperCase()}</p>
              <h3 className="font-display text-h3 text-text">{sub}</h3>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {categoriesByGroup[key].map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.key}
                  href={`/category/${c.key}`}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${c.color} 14%, transparent)`,
                      color: c.color,
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="text-body-sm font-medium text-text">{c.labelVi}</span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      ))}
    </section>
  );
}

/* --------------------------------- Cities --------------------------------- */

function CitiesSection() {
  return (
    <section className="container py-20 md:py-28">
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

function PlacesSection() {
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
          {featuredPlaces.slice(0, 8).map((p, i) => (
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

function MapCtaSection() {
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
                  { k: "63", v: "Tỉnh thành" },
                  { k: "580+", v: "Địa điểm" },
                  { k: "6", v: "Danh mục" },
                  { k: "12k", v: "Người dùng" },
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
