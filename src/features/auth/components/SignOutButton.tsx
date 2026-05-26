"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/ui/button";
import { useToast } from "@/ui/toast";

export interface SignOutButtonProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  redirectTo?: string;
}

export function SignOutButton({
  variant = "secondary",
  size = "md",
  className,
  redirectTo = "/",
}: SignOutButtonProps) {
  const router = useRouter();
  const { show: toast } = useToast();
  const t = useTranslations("MePage");
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast(t("signedOutSuccess"), { variant: "info" });
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : t("signOutFailed"), {
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      loading={loading}
      onClick={signOut}
    >
      <LogOut size={16} /> {t("signOut")}
    </Button>
  );
}
