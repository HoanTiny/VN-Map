"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { siteConfig } from "@/config/site";
import { spring } from "@/lib/motion";

export default function SignInPage() {
  const t = useTranslations("SignInPage");
  return (
    <div className="flex min-h-dvh w-full flex-col lg:flex-row bg-bg">

      {/* Left Column: Authentic Login Interface */}
      <m.section
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={spring.default}
        className="flex-1 w-full lg:w-[46%] xl:w-[42%] lg:flex-none flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-surface z-10 shadow-[8px_0_30px_rgba(0,0,0,0.03)] border-r border-border/40"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-h3 text-text group select-none">
            {/* <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 shadow-[0_0_12px_rgba(218,37,29,0.35)] transition-transform duration-500 group-hover:rotate-12">
              <Compass size={14} className="text-white animate-spin-slow" />
            </span> */}
            <img src="/images/mapVN.png" alt="logo" width={32} height={32} />
            <span className="font-bold tracking-tight text-text transition-colors group-hover:text-brand-500">
              {siteConfig.name}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-[11px] font-bold text-text-muted hover:text-text rounded-full px-3 py-1.5 bg-text/5 transition-all select-none hover:bg-text/10 active:scale-[0.97]">
              <span>{t("language")}</span>
              <span className="text-[9px] text-text-subtle">▼</span>
            </button>
            <Link
              href="/"
              className="text-[11px] font-bold text-brand-600 hover:text-brand-700 rounded-full px-3 py-1.5 border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10 transition-all select-none active:scale-[0.97]"
            >
              {t("home")}
            </Link>
          </div>
        </div>

        {/* Center content wrapper (Vertically centered) */}
        <div className="my-auto py-12 sm:py-16 max-w-[390px] mx-auto w-full flex flex-col justify-center">
          <div className="space-y-3 mb-8">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-500 uppercase tracking-widest ring-1 ring-brand-500/20">
              <Sparkles size={10} /> {t("memberSignIn")}
            </span>
            <h1 className="font-display text-display-md leading-[1.1] text-text font-bold tracking-tight whitespace-pre-line">
              {t("headline")}
            </h1>
            <p className="text-body-sm text-text-muted leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="relative">
            {/* SignInForm reads useSearchParams → Suspense boundary required */}
            <Suspense fallback={
              <div className="h-[280px] w-full flex flex-col items-center justify-center gap-3 text-text-muted select-none">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
                <span className="text-xs font-medium">{t("loadingForm")}</span>
              </div>
            }>
              <SignInForm />
            </Suspense>
          </div>
        </div>

        {/* Footer section */}
        <div className="text-center text-[11px] text-text-subtle/80 leading-relaxed max-w-[340px] mx-auto w-full border-t border-border/30 pt-6">
          {t.rich("termsAgreement", {
            terms: (chunks) => (
              <Link href="/terms" className="underline font-medium hover:text-text transition-colors">{chunks}</Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline font-medium hover:text-text transition-colors">{chunks}</Link>
            ),
          })}
        </div>
      </m.section>

      {/* Right Column: Breathtaking Scenery & Camper Van Road Trip Concept */}
      <m.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="hidden lg:block lg:w-[54%] xl:w-[58%] relative overflow-hidden bg-zinc-950"
      >
        {/* Background Image: Premium road trip/scenery (Yellow camper van at sunset) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85"
          alt="Camper van road trip sunset"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-[10000ms] hover:scale-105"
          loading="eager"
        />

        {/* Dynamic ambient overlays for visual depth and contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Ambient warm glow in top-right corner to match the sunset mood */}
        <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-pulse" />

        {/* Volumetric Overlay Content */}
        <div className="absolute bottom-16 left-16 right-16 text-white z-20 space-y-4 max-w-xl select-none">
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest shadow-sm"
          >
            {t("roadtripBadge")}
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="font-display text-[34px] xl:text-[40px] font-bold leading-[1.1] tracking-tight drop-shadow-md whitespace-pre-line text-white"
          >
            {t("roadtripTitle")}
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            className="text-body-sm text-white/80 leading-relaxed drop-shadow-sm font-light"
          >
            {t("roadtripDesc")}
          </m.p>
        </div>
      </m.section>

    </div>
  );
}
