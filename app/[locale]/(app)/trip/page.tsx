import { getTranslations } from "next-intl/server";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { TripList } from "@/features/trip/components/TripList";

export async function generateMetadata() {
  const t = await getTranslations("TripPage");
  return { title: t("metaTitle") };
}

export default function TripIndexPage() {
  return (
    <AuthGuard mode="redirect">
      <TripList />
    </AuthGuard>
  );
}
