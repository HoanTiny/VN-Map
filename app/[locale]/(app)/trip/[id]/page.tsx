import { getTranslations } from "next-intl/server";
import { TripPlanner } from "@/features/trip/components/TripPlanner";

interface Params {
  id: string;
}

export async function generateMetadata() {
  const t = await getTranslations("TripPage");
  return { title: t("metaTitle") };
}

export default async function TripDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <TripPlanner tripId={id} />;
}
