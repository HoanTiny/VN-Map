"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-overline text-danger">Error</p>
      <h1 className="font-display text-h1">{t("title")}</h1>
      <p className="max-w-md text-body text-text-muted">{t("subtitle")}</p>
      <div className="mt-4 flex gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button variant="secondary" asChild>
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    </div>
  );
}
