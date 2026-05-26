import { getTranslations } from "next-intl/server";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { SavedPlaces } from "@/features/saved/components/SavedPlaces";

export async function generateMetadata() {
  const t = await getTranslations("SavedPage");
  return { title: t("metaTitle") };
}

export default function SavedPage() {
  return (
    <AuthGuard mode="redirect">
      <SavedPlaces />
    </AuthGuard>
  );
}
