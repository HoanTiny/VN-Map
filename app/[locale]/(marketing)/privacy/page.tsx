import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("Privacy"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/privacy", locale),
  };
}

export default async function PrivacyPage() {
  const [t, locale] = await Promise.all([getTranslations("Privacy"), getLocale()]);
  const date = new Date().toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const email = (c: React.ReactNode) => (
    <a href="mailto:hello@map-vn.vn" className="text-brand-600 hover:underline">{c}</a>
  );
  const bold = (c: React.ReactNode) => <strong className="text-text">{c}</strong>;

  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl prose prose-neutral dark:prose-invert">
        <Reveal>
          <Badge variant="brand" className="mb-3">{t("badge")}</Badge>
          <h1 className="font-display text-display-lg text-text">{t("title")}</h1>
          <p className="mt-2 text-body-sm text-text-muted">{t("updated", { date })}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-6 text-body-lg leading-relaxed text-text-muted">
            <section>
              <h2 className="font-display text-h2 text-text">{t("s1Title")}</h2>
              <p className="mt-2">{t.rich("s1Body", { b: bold })}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s2Title")}</h2>
              <p className="mt-2">{t("s2Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s3Title")}</h2>
              <p className="mt-2">{t("s3Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">{t("s4Title")}</h2>
              <p className="mt-2">{t("s4Body")}</p>
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
