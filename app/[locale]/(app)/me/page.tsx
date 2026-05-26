import { getLocale, getTranslations } from "next-intl/server";
import { AccountPanel } from "@/features/auth/components/AccountPanel";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("MePage"), getLocale()]);
  return { title: t("metaTitle"), alternates: localizedAlternates("/me", locale) };
}

export default function MePage() {
  return <AccountPanel />;
}
