import { getLocale, getTranslations } from "next-intl/server";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { TripList } from "@/features/trip/components/TripList";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("TripPage"), getLocale()]);
  return { title: t("metaTitle"), alternates: localizedAlternates("/trip", locale) };
}

export default function TripIndexPage() {
  return (
    <AuthGuard mode="redirect">
      <TripList />
    </AuthGuard>
  );
}
