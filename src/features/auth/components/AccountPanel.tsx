"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Briefcase,
  MapPin,
  Sparkles,
  LogIn,
  LogOut,
  Compass,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion";
import { Skeleton } from "@/ui/skeleton";
import { useSession } from "../hooks/useSession";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { useTrips } from "@/features/trip/hooks/useTrips";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/ui/toast";

export function AccountPanel() {
  const t = useTranslations("MePage");
  const { user, hydrated: sessionHydrated, disabled } = useSession();
  const { saved, hydrated: savedHydrated } = useSaved();
  const { trips, hydrated: tripsHydrated } = useTrips();
  const { show: toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const hydrated = sessionHydrated && savedHydrated && tripsHydrated;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast(t("signedOutSuccess"), { variant: "info" });
      router.push("/");
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
    <article className="relative min-h-[calc(100vh-4rem)] pb-24 pt-8 md:pt-16 bg-bg transition-colors duration-200 overflow-hidden">
      {/* Decorative technical grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Vibrant Apple-style wallpaper blobs for liquid glass refractions */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45 dark:opacity-25 select-none">
        <div className="absolute top-[10%] left-[20%] w-[380px] h-[380px] rounded-full bg-blue-500/20 dark:bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "14s" }} />
        <div className="absolute top-[35%] right-[15%] w-[450px] h-[450px] rounded-full bg-rose-500/25 dark:bg-rose-500/15 blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-[5%] left-[5%] w-[420px] h-[420px] rounded-full bg-amber-500/20 dark:bg-amber-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "12s" }} />
      </div>

      <div className="container max-w-5xl relative z-10">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: Frosted Liquid Glass User Profile Console */}
            <div 
              className="md:col-span-1 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group apple-glass-card shadow-sm"
              style={{ "--cat-color": "var(--brand-500)" } as React.CSSProperties}
            >
              {/* Dynamic light reflection edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="space-y-6">
                {/* Header Title with Status */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-display text-h3 text-text font-bold">{t("profileTitle")}</span>
                  {disabled ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      {t("statusBeta")}
                    </span>
                  ) : !hydrated ? (
                    <Skeleton className="h-5 w-14 bg-surface-2" />
                  ) : user ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {t("statusConnected")}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-zinc-200/20 bg-zinc-200/10 dark:border-zinc-800/40 dark:bg-zinc-800/30 text-text-muted">
                      {t("statusOffline")}
                    </span>
                  )}
                </div>

                {/* Cyberpunk circular avatar & identification details */}
                <div className="flex flex-col items-center text-center py-2 space-y-4">
                  <div className="relative">
                    {/* Glowing background ring */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-500 via-amber-500 to-emerald-500 opacity-20 blur-sm group-hover:opacity-45 transition-opacity duration-500" />
                    
                    {/* Round Avatar Container */}
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border border-white/20 bg-surface-2 shadow-md">
                      <Image
                        src="/images/me_hero.png"
                        alt="Cyber Explorer avatar"
                        width={112}
                        height={112}
                        className="h-full w-full object-cover object-top scale-[1.3] transition-transform duration-500 group-hover:scale-[1.38]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 w-full px-2">
                    {!hydrated ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Skeleton className="h-6 w-32 bg-surface-2" />
                        <Skeleton className="h-4 w-44 bg-surface-2" />
                      </div>
                    ) : user ? (
                      <>
                        <h2 className="font-display text-h2 text-text font-bold truncate max-w-full">
                          {displayName(user.email, user.user_metadata, t("fallbackUserName"))}
                        </h2>
                        <p className="text-body-sm text-text-muted truncate max-w-full">
                          {user.email}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="font-display text-h2 text-text font-bold">
                          {t("guestName")}
                        </h2>
                        <p className="text-body-sm text-text-muted">
                          {t("noAccountLinked")}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cloud synchronization briefing styled in nested satin frosted look */}
                <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4 text-xs leading-relaxed text-text-muted border border-white/5 backdrop-blur-sm">
                  {disabled ? (
                    <p>{t("betaSyncNote")}</p>
                  ) : !hydrated ? (
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full bg-surface" />
                      <Skeleton className="h-3 w-4/5 bg-surface" />
                    </div>
                  ) : user ? (
                    <p>
                      {t.rich("signedInSyncNote", {
                        email: user.email ?? "",
                        b: (chunks) => <span className="text-text font-medium">{chunks}</span>,
                      })}
                    </p>
                  ) : (
                    <p>{t("signedOutSyncNote")}</p>
                  )}
                </div>
              </div>

              {/* Dynamic Authentication Action buttons */}
              <div className="mt-8 pt-4 border-t border-white/10 space-y-3">
                {!hydrated ? (
                  <Skeleton className="h-10 w-full bg-surface-2 rounded-xl" />
                ) : user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/explore"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-98 text-white text-body-sm font-semibold transition-all duration-200 shadow-sm"
                    >
                      <Compass size={16} /> {t("exploreMap")}
                    </Link>

                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 active:scale-98 text-text-muted hover:text-text text-body-sm font-medium transition-all duration-200"
                    >
                      <LogOut size={16} /> {t("signOut")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/sign-in"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-98 text-white text-body-sm font-semibold transition-all duration-200 shadow-sm"
                    >
                      <LogIn size={16} /> {t("signIn")}
                    </Link>
                    <Link
                      href="/explore"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 active:scale-98 text-text hover:text-brand-500 text-body-sm font-medium transition-all duration-200"
                    >
                      {t("guestMap")} <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Apple Liquid Glass Grid Tiles */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Table titles */}
              <div className="space-y-1">
                <h3 className="text-body-sm font-mono text-brand-500 font-bold uppercase tracking-wider">
                  {t("controlBoard")}
                </h3>
                <h2 className="font-display text-h1 text-text">
                  {t("journeyHeading")}
                </h2>
              </div>

              {/* Layout of 4 core quick tiles styled with liquid glass */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Tile
                  href="/saved"
                  icon={<Heart size={20} className="text-rose-500 fill-rose-500/10 group-hover:fill-rose-500/30 transition-colors" />}
                  iconBg="bg-rose-500/10 dark:bg-rose-950/30"
                  title={t("savedTitle")}
                  description={t("savedDesc")}
                  countText={!hydrated ? undefined : t("savedCount", { count: saved.length })}
                  ticksCount={!hydrated ? undefined : saved.length}
                  tickColor="bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.35)]"
                  catColorVar="var(--cat-food)"
                />

                <Tile
                  href="/trip"
                  icon={<Briefcase size={20} className="text-cyan-500" />}
                  iconBg="bg-cyan-500/10 dark:bg-cyan-950/30"
                  title={t("tripsTitle")}
                  description={t("tripsDesc")}
                  countText={!hydrated ? undefined : t("tripsCount", { count: trips.length })}
                  ticksCount={!hydrated ? undefined : trips.length}
                  tickColor="bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.35)]"
                  catColorVar="var(--cat-beach)"
                />

                <Tile
                  href="/submit"
                  icon={<MapPin size={20} className="text-amber-500" />}
                  iconBg="bg-amber-500/10 dark:bg-amber-950/30"
                  title={t("submitTitle")}
                  description={t("submitDesc")}
                  countText={t("submitBadge")}
                  catColorVar="var(--cat-heritage)"
                />

                <Tile
                  href="/explore"
                  icon={<Sparkles size={20} className="text-indigo-500" />}
                  iconBg="bg-indigo-500/10 dark:bg-indigo-950/30"
                  title={t("exploreTitle")}
                  description={t("exploreDesc")}
                  countText={t("exploreBadge")}
                  catColorVar="var(--cat-experience)"
                />
              </div>

            </div>

          </div>
        </Reveal>
      </div>
    </article>
  );
}

// Highly polished responsive quick tile sub-component with Apple Liquid Glass aesthetic
function Tile({
  href,
  icon,
  iconBg,
  title,
  description,
  countText,
  ticksCount,
  tickColor = "bg-brand-500",
  catColorVar = "var(--brand-500)",
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  countText?: string;
  ticksCount?: number;
  tickColor?: string;
  catColorVar?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden apple-glass-card shadow-sm"
      style={{ "--cat-color": catColorVar } as React.CSSProperties}
    >
      {/* Subtle blueprint digital map pattern visible on hover */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.025)_1px,transparent_1px)] bg-[size:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex items-start justify-between gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-105`}>
            {icon}
          </span>
          {countText && (
            <span className="font-mono text-[10px] font-bold text-text-muted bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">
              {countText}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-display text-h3 text-text group-hover:text-brand-500 transition-colors duration-200">
            {title}
          </h3>
          <p className="mt-1 text-body-sm text-text-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Modern tick progress bar indicators */}
      {ticksCount !== undefined && (
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-[3px] rounded-full transition-all duration-300 ${
                i < Math.min(ticksCount, 12)
                  ? `${tickColor} opacity-90`
                  : "bg-black/10 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
      )}
    </Link>
  );
}

// Display Name Parsing Utility
function displayName(
  email: string | undefined,
  meta: Record<string, unknown> | undefined,
  fallback: string,
): string {
  const fromMeta = meta?.["display_name"] as string | undefined;
  if (fromMeta) return fromMeta;
  if (!email) return fallback;
  return email.split("@")[0]!;
}
