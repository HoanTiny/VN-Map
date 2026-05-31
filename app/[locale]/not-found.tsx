"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/button";

export default function LocaleNotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-overline text-text-subtle">404</p>
      <h1 className="font-display text-display-lg">{t("title")}</h1>
      <p className="max-w-md text-body text-text-muted">{t("subtitle")}</p>
      <div className="mt-4 flex gap-3">
        <Button asChild>
          <Link href="/">{t("home")}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/explore">{t("explore")}</Link>
        </Button>
      </div>
    </div>
  );
}
