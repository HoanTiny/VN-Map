"use client";
import { useState } from "react";
import { Coffee, Utensils, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { SuggestPlaceForm } from "./SuggestPlaceForm";
import { SubmissionsList } from "./SubmissionsList";

export function SubmitLanding() {
  const [open, setOpen] = useState(false);

  return (
    <article className="pb-24 pt-24 md:pt-28">
      {/* Hero */}
      <section className="container">
        <Reveal>
          <Badge variant="brand" className="mb-3">
            <Sparkles size={12} /> CỘNG ĐỒNG
          </Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-display text-display-lg text-text md:text-display-xl">
            Đóng góp địa điểm.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-3 max-w-2xl text-body-lg text-text-muted">
            Bản đồ này được xây dựng từ cộng đồng — bạn biết quán cafe ngon, bar hay,
            rooftop view đẹp, hidden gem chưa ai biết? Chia sẻ cho mọi người.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8">
            <Button size="lg" onClick={() => setOpen(true)}>
              <Coffee size={18} /> Đóng góp địa điểm
            </Button>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="container mt-16">
        <Reveal>
          <h2 className="mb-6 font-display text-h2 text-text">Quy trình</h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Điền form",
              body: "Tên, danh mục, tỉnh thành, toạ độ (tự động từ tỉnh), mô tả, ảnh.",
            },
            {
              n: "2",
              title: "Chờ duyệt",
              body: "Biên tập viên kiểm tra thông tin trong vòng 24-72 giờ.",
            },
            {
              n: "3",
              title: "Lên bản đồ",
              body: "Địa điểm xuất hiện công khai với badge \"Cộng đồng đóng góp\".",
            },
          ].map((s, i) => (
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

      {/* Categories invite */}
      <section className="container mt-16">
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-2/40 p-6 md:p-8">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <p className="text-overline text-brand-600">CATEGORY MỚI</p>
                <h3 className="mt-1 font-display text-h2 text-text">
                  Có danh mục chưa có?
                </h3>
                <p className="mt-2 text-body text-text-muted">
                  Workshop làm gốm, trại nuôi ong, art space, vintage shop… Hãy chia sẻ —
                  cộng đồng sẽ vote và biên tập viên sẽ bổ sung vào hệ thống.
                </p>
              </div>
              <div className="shrink-0">
                <Button variant="secondary" disabled>
                  <Utensils size={16} /> Sắp ra mắt
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Own submissions */}
      <section className="container mt-16">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-overline text-brand-600">CỦA BẠN</p>
              <h2 className="mt-1 font-display text-h2 text-text">Đề xuất đã gửi</h2>
            </div>
            <Button onClick={() => setOpen(true)}>
              <ArrowRight size={16} /> Đóng góp mới
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
