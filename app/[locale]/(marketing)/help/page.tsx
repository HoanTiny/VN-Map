import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";
import { localizedAlternates } from "@/i18n/metadata";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("Help"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/help", locale),
  };
}

const QAS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Làm sao lưu địa điểm yêu thích?",
    a: (
      <>
        Bấm trái tim <span aria-hidden>♡</span> trên bất kỳ thẻ địa điểm nào (trên bản đồ,
        landing, hoặc trang chi tiết). Danh sách lưu xem ở <Link href="/saved" className="text-brand-600 hover:underline">/saved</Link>.
      </>
    ),
  },
  {
    q: "Tạo chuyến đi như thế nào?",
    a: (
      <>
        Vào <Link href="/trip" className="text-brand-600 hover:underline">Chuyến đi</Link>{" "}
        → bấm &ldquo;Tạo chuyến đi&rdquo;. Đặt tên, chọn số ngày, chọn điểm đến (1 hoặc nhiều tỉnh).
        Sau đó thêm địa điểm vào từng ngày — qua search hoặc click &ldquo;Thêm từ bản đồ&rdquo; để pick
        trực tiếp trên map.
      </>
    ),
  },
  {
    q: "Đóng góp địa điểm cho cộng đồng?",
    a: (
      <>
        Có 2 cách: (1) Vào{" "}
        <Link href="/submit" className="text-brand-600 hover:underline">/submit</Link>{" "}
        và điền form, hoặc (2) Trên <Link href="/explore" className="text-brand-600 hover:underline">bản đồ</Link>,
        bấm nút &ldquo;Đóng góp ở đây&rdquo; rồi click vào vị trí trên map — toạ độ + tỉnh sẽ tự
        điền.
      </>
    ),
  },
  {
    q: "Review của tôi có public ngay không?",
    a: (
      <>
        Trong bản beta hiện tại, review của bạn auto-public ngay sau khi gửi (do dùng
        localStorage demo). Ở Phase 2 với backend thật, review sẽ qua duyệt 24-72 giờ.
      </>
    ),
  },
  {
    q: "Dữ liệu của tôi lưu ở đâu?",
    a: (
      <>
        Hiện tại tất cả (saved, trips, reviews, submissions) lưu trong{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 text-body-sm">localStorage</code>{" "}
        của trình duyệt này — không sync giữa các thiết bị. Phase 2 sẽ wire backend
        Supabase.
      </>
    ),
  },
  {
    q: "Tại sao có địa điểm hiện trên map mà không có ở danh mục?",
    a: (
      <>
        Toàn bộ data demo trong Phase 1 chỉ có ~40 địa điểm trên VN — chưa đầy đủ. Phase 2
        sẽ có hàng ngàn địa điểm thật do cộng đồng đóng góp.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">FAQ</Badge>
          <h1 className="font-display text-display-lg text-text">Trợ giúp</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            Câu hỏi thường gặp về cách dùng Map-VN.
          </p>
        </Reveal>

        <div className="mt-10 space-y-2">
          {QAS.map((qa, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <details className="group rounded-2xl border border-border bg-surface p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-display text-h3 text-text">
                  {qa.q}
                  <span className="text-text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-body leading-relaxed text-text-muted">{qa.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </article>
  );
}
