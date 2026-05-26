import { getTranslations } from "next-intl/server";
import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";

export async function generateMetadata() {
  const t = await getTranslations("Privacy");
  return { title: t("metaTitle"), description: t("metaDesc") };
}

export default function PrivacyPage() {
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl prose prose-neutral dark:prose-invert">
        <Reveal>
          <Badge variant="brand" className="mb-3">PHIÊN BẢN BETA</Badge>
          <h1 className="font-display text-display-lg text-text">Chính sách bảo mật</h1>
          <p className="mt-2 text-body-sm text-text-muted">
            Cập nhật: {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-6 text-body-lg leading-relaxed text-text-muted">
            <section>
              <h2 className="font-display text-h2 text-text">Dữ liệu chúng tôi thu thập</h2>
              <p className="mt-2">
                Trong bản beta Phase 1, Map-VN <strong className="text-text">không gửi dữ
                liệu lên server</strong>. Tất cả thông tin bạn tạo (saved, trips, reviews,
                submissions) được lưu trong localStorage của trình duyệt — không rời khỏi
                máy bạn.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Vị trí địa lý</h2>
              <p className="mt-2">
                Khi bạn bấm nút &ldquo;Vị trí của tôi&rdquo; hoặc &ldquo;GPS&rdquo; trong form đóng góp, trình
                duyệt sẽ hỏi quyền truy cập vị trí. Toạ độ được dùng tức thời cho map
                fly-to và không lưu lại đâu cả.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Bản đồ & tile</h2>
              <p className="mt-2">
                Tile bản đồ được fetch từ CartoCDN (basemaps.cartocdn.com) — đối tác bên
                thứ ba có chính sách bảo mật riêng. Map-VN không chia sẻ định danh người
                dùng với họ.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Phase 2 trở đi</h2>
              <p className="mt-2">
                Khi launch backend chính thức, chúng tôi sẽ cập nhật chính sách rõ ràng về
                lưu trữ user account, OAuth provider, moderation queue, và tuân thủ GDPR
                tương đương cho user Châu Âu.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Liên hệ</h2>
              <p className="mt-2">
                Có thắc mắc? Email{" "}
                <a href="mailto:hello@map-vn.vn" className="text-brand-600 hover:underline">
                  hello@map-vn.vn
                </a>
                .
              </p>
            </section>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
