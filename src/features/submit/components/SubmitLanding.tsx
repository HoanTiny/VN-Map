"use client";
import { useState } from "react";
import { Coffee, Utensils, Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { SuggestPlaceForm } from "./SuggestPlaceForm";
import { SubmissionsList } from "./SubmissionsList";

export function SubmitLanding() {
  const t = useTranslations("SubmitPage");
  const [open, setOpen] = useState(false);

  const steps = [
    { n: "1", title: t("step1Title"), body: t("step1Body") },
    { n: "2", title: t("step2Title"), body: t("step2Body") },
    { n: "3", title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <section className="container">
        <Reveal>
          <Badge variant="brand" className="mb-3">
            <Sparkles size={12} /> {t("communityBadge")}
          </Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-display-lg text-text md:text-display-xl">
            {t("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 max-w-2xl text-body-lg text-text-muted">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8">
            <Button size="lg" onClick={() => setOpen(true)}>
              <Coffee size={18} /> {t("ctaContribute")}
            </Button>
          </div>
        </Reveal>
      </section>

      <section className="container mt-16">
        <Reveal>
          <h2 className="mb-6 font-display text-h2 text-text">{t("processTitle")}</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-display text-h3 text-brand-700">
                  {s.n}
                </div>
                <h3 className="mt-4 font-display text-h3 text-text">{s.title}</h3>
                <p className="mt-1 text-body text-text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container mt-16">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-2/40 p-6 md:p-8">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-overline text-brand-600">{t("newCategoryOverline")}</p>
                <h3 className="mt-1 font-display text-h2 text-text">
                  {t("newCategoryTitle")}
                </h3>
                <p className="mt-2 text-body text-text-muted">
                  {t("newCategoryBody")}
                </p>
              </div>
              <div className="shrink-0">
                <Button variant="secondary" disabled>
                  <Utensils size={16} /> {t("comingSoon")}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container mt-16">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-overline text-brand-600">{t("yoursOverline")}</p>
              <h2 className="mt-1 font-display text-h2 text-text">{t("yoursTitle")}</h2>
            </div>
            <Button onClick={() => setOpen(true)}>
              <ArrowRight size={16} /> {t("newSubmission")}
            </Button>
          </div>
        </Reveal>
        <Reveal>
          <SubmissionsList />
        </Reveal>
      </section>

      <SuggestPlaceForm open={open} onOpenChange={setOpen} />
    </article>
  );
}
