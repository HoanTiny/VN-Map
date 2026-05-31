import { getLocale, getTranslations } from "next-intl/server";
import { TripPlanner } from "@/features/trip/components/TripPlanner";
import { localizedAlternates } from "@/i18n/metadata";

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const [t, locale] = await Promise.all([getTranslations("TripPage"), getLocale()]);
  return {
    title: t("metaTitle"),
    alternates: localizedAlternates(`/trip/${id}`, locale),
    robots: { index: false, follow: false },
  };
}

export default async function TripDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <TripPlanner tripId={id} />;
}
