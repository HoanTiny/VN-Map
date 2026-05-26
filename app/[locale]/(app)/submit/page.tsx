import { getLocale, getTranslations } from "next-intl/server";
import { SubmitLanding } from "@/features/submit/components/SubmitLanding";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("SubmitPage"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/submit", locale),
  };
}

export default function SubmitPage() {
  return <SubmitLanding />;
}
