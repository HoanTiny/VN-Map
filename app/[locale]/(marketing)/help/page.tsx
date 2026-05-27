import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("Help"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/help", locale),
  };
}

export default async function HelpPage() {
  const t = await getTranslations("Help");

  const tags = {
    saved: (c: React.ReactNode) => (
      <Link href="/saved" className="text-brand-600 hover:underline">{c}</Link>
    ),
    trip: (c: React.ReactNode) => (
      <Link href="/trip" className="text-brand-600 hover:underline">{c}</Link>
    ),
    submit: (c: React.ReactNode) => (
      <Link href="/submit" className="text-brand-600 hover:underline">{c}</Link>
    ),
    explore: (c: React.ReactNode) => (
      <Link href="/explore" className="text-brand-600 hover:underline">{c}</Link>
    ),
    code: (c: React.ReactNode) => (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 text-body-sm">{c}</code>
    ),
  };

  const qas = ["1", "2", "3", "4", "5", "6"] as const;

  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">{t("badge")}</Badge>
          <h1 className="font-display text-display-lg text-text">{t("title")}</h1>
          <p className="mt-2 text-body-lg text-text-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="mt-10 space-y-2">
          {qas.map((n, i) => (
            <Reveal key={n} delay={i * 0.03}>
              <details className="group rounded-2xl border border-border bg-surface p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-display text-h3 text-text">
                  {t(`q${n}`)}
                  <span className="text-text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-body leading-relaxed text-text-muted">
                  {t.rich(`a${n}`, tags)}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}
