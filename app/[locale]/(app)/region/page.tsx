import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { regions, provincesByRegion } from "@/config/regions";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("RegionPage"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/region", locale),
  };
}

export default async function RegionLandingPage() {
  const t = await getTranslations("RegionPage");
  return (
    <article className="pb-24">
      <section className="container pt-24 pb-12 md:pt-28">
        <Reveal>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-body-sm text-text-muted hover:text-text"
          >
            <ArrowLeft size={14} /> {t("home")}
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 text-overline text-brand-600">{t("overline")}</p>
          <h1 className="mt-2 font-display text-display-lg text-text">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-2xl text-body-lg text-text-muted">
            {t("subtitle")}
          </p>
        </Reveal>
      </section>

      <section className="container space-y-16">
        {regions.map((region, i) => (
          <Reveal key={region.key} delay={i * 0.05}>
            <header className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-overline text-brand-600">{region.label.toUpperCase()}</p>
                <h2 className="mt-1 font-display text-h1 text-text">{region.label}</h2>
                <p className="mt-2 max-w-xl text-body text-text-muted">{region.description}</p>
              </div>
              <Link
                href={`/region/${region.key}`}
                className="hidden shrink-0 items-center gap-1 text-body text-brand-600 hover:underline md:inline-flex"
              >
                {t("allProvinces")} <ArrowRight size={16} />
              </Link>
            </header>

            <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {provincesByRegion[region.key].slice(0, 4).map((p) => (
                <StaggerItem key={p.slug}>
                  <ProvinceTile
                    region={region.key}
                    slug={p.slug}
                    name={p.name}
                    cover={p.cover}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        ))}
      </section>
    </article>
  );
}

function ProvinceTile({
  region,
  slug,
  name,
  cover,
}: {
  region: string;
  slug: string;
  name: string;
  cover: string;
}) {
  return (
    <Link
      href={`/region/${region}/${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-md"
    >
      <Image
        src={cover}
        alt={name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-slow group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 text-white">
        <p className="font-display text-h3 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          {name}
        </p>
      </div>
    </Link>
  );
}
