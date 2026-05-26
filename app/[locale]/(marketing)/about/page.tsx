import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/i18n/metadata";
import { Reveal } from "@/components/motion";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { siteConfig } from "@/config/site";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getTranslations("About"), getLocale()]);
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: localizedAlternates("/about", locale),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("About");
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">{t("badge")}</Badge>
          <h1 className="font-display text-display-lg text-text md:text-display-xl">
            {t("headline")}
          </h1>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 text-body-lg leading-relaxed text-text-muted">
            {siteConfig.name} là <strong className="text-text">Google Maps cho trải nghiệm
            ăn chơi tại Việt Nam</strong> — nơi cộng đồng người Việt và khách du lịch quốc
            tế cùng đóng góp địa điểm đáng trải nghiệm: quán ăn, cafe đẹp, bar, rooftop,
            check-in nổi tiếng, hidden gems, làng nghề, workshop…
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mt-12 font-display text-h2 text-text">Triết lý</h2>
          <ul className="mt-4 space-y-3 text-body-lg text-text-muted">
            <li>
              <strong className="text-text">Map-first</strong> — bản đồ là trục chính, không
              phải feed/listing. Khám phá theo địa lý + chủ đề song song.
            </li>
            <li>
              <strong className="text-text">Cộng đồng đóng góp</strong> — nội dung do người
              dùng tạo ra, biên tập viên duyệt. Luôn mới, luôn địa phương hoá.
            </li>
            <li>
              <strong className="text-text">Lifestyle &gt; landmark</strong> — tập trung
              vào trải nghiệm thực: phở vỉa hè, bar phố cổ, rooftop bí mật — không phải
              điểm chụp ảnh sáo rỗng.
            </li>
            <li>
              <strong className="text-text">Premium nhưng thân thuộc</strong> — design
              Airbnb-grade kết hợp đỏ cờ vàng sao Việt Nam.
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="mt-12 font-display text-h2 text-text">Lộ trình</h2>
          <ol className="mt-4 space-y-3 text-body-lg text-text-muted">
            <li>
              <strong className="text-text">Phase 1 (hiện tại)</strong> — MVP demo với
              mock data + community contribution flow + reviews + trip planner. Lưu
              localStorage.
            </li>
            <li>
              <strong className="text-text">Phase 2</strong> — Backend Supabase + auth +
              moderation queue + đồng bộ thiết bị.
            </li>
            <li>
              <strong className="text-text">Phase 3</strong> — Bản đồ 3D buildings, đa
              ngôn ngữ VI/EN, realtime updates, AI gợi ý cá nhân hoá.
            </li>
          </ol>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/explore">{t("ctaOpenMap")}</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/submit">{t("ctaContribute")}</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
