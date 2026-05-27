import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("Terms"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/terms", locale),
  };
}

export default async function TermsPage() {
  const [t, locale] = await Promise.all([getTranslations("Terms"), getLocale()]);
  const date = new Date().toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const email = (c: React.ReactNode) => (
    <a href="mailto:hello@map-vn.vn" className="text-brand-600 hover:underline">{c}</a>
  );

  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">{t("badge")}</Badge>
          <h1 className="font-display text-display-lg text-text">{t("title")}</h1>
          <p className="mt-2 text-body-sm text-text-muted">{t("updated", { date })}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-6 text-body-lg leading-relaxed text-text-muted">
            <p>{t("intro")}</p>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s1Title")}</h2>
              <p className="mt-2">{t("s1Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s2Title")}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {(["ban1", "ban2", "ban3", "ban4"] as const).map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
              <p className="mt-2">{t("s2Note")}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s3Title")}</h2>
              <p className="mt-2">{t("s3Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("contactTitle")}</h2>
              <p className="mt-2">{t.rich("contactBody", { email })}</p>
            </section>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
