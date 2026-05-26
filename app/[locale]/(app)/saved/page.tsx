import { getLocale, getTranslations } from "next-intl/server";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { SavedPlaces } from "@/features/saved/components/SavedPlaces";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("SavedPage"), getLocale()]);
  return { title: t("metaTitle"), alternates: localizedAlternates("/saved", locale) };
}

export default function SavedPage() {
  return (
    <AuthGuard mode="redirect">
      <SavedPlaces />
    </AuthGuard>
  );
}
