import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Reveal } from "@/components/motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("About"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/about", locale),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  const bold = (chunks: React.ReactNode) => <strong className="text-text">{chunks}</strong>;
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">{t("badge")}</Badge>
          <h1 className="font-display text-display-lg text-text md:text-display-xl">
            {t("headline")}
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 text-body-lg leading-relaxed text-text-muted">
            {t.rich("intro", { name: siteConfig.name, b: bold })}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-12 font-display text-h2 text-text">{t("philosophyTitle")}</h2>
          <ul className="mt-4 space-y-3 text-body-lg text-text-muted">
            {(["ph1", "ph2", "ph3", "ph4"] as const).map((k) => (
              <li key={k}>{t.rich(k, { b: bold })}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="mt-12 font-display text-h2 text-text">{t("roadmapTitle")}</h2>
          <ol className="mt-4 space-y-3 text-body-lg text-text-muted">
            {(["road1", "road2", "road3"] as const).map((k) => (
              <li key={k}>{t.rich(k, { b: bold })}</li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/explore">{t("ctaOpenMap")}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/submit">{t("ctaContribute")}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
