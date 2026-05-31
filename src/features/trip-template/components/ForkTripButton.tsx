"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";
import { forkTripTemplate } from "../actions";

export function ForkTripButton({ slug }: { slug: string }) {
  const t = useTranslations("ForkTrip");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  const onClick = () => {
    start(async () => {
      try {
        const result = await forkTripTemplate(slug);
        if (result?.id) {
          toast.show(t("copied"), { variant: "success" });
          router.push(`/trip/${result.id}`);
        }
      } catch (err) {
        toast.show((err as Error).message, { variant: "danger" });
      }
    });
  };

  return (
    <Button size="lg" onClick={onClick} disabled={pending}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
      {pending ? t("copying") : t("copyToMine")}
    </Button>
  );
}
