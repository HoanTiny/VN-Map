import { getTranslations } from "next-intl/server";
import { SubmitLanding } from "@/features/submit/components/SubmitLanding";

export async function generateMetadata() {
  const t = await getTranslations("SubmitPage");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default function SubmitPage() {
  return <SubmitLanding />;
}
