import { getTranslations } from "next-intl/server";
import { AccountPanel } from "@/features/auth/components/AccountPanel";

export async function generateMetadata() {
  const t = await getTranslations("MePage");
  return { title: t("metaTitle") };
}

export default function MePage() {
  return <AccountPanel />;
}
