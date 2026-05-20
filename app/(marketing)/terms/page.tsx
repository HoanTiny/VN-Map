import { Badge } from "@/ui/badge";
import { Reveal } from "@/components/motion";

export const metadata = {
  title: "Điều khoản · Map-VN",
};

export default function TermsPage() {
  return (
    <article className="pb-24 pt-32 md:pt-40">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="brand" className="mb-3">PHIÊN BẢN BETA</Badge>
          <h1 className="font-display text-display-lg text-text">Điều khoản sử dụng</h1>
          <p className="mt-2 text-body-sm text-text-muted">
            Cập nhật: {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 space-y-6 text-body-lg leading-relaxed text-text-muted">
            <p>
              Bằng việc sử dụng Map-VN, bạn đồng ý với các điều khoản dưới đây.
              Phiên bản chính thức sẽ ra mắt cùng Phase 2 — bản hiện tại là khung
              demo cho cộng đồng beta.
            </p>

            <section>
              <h2 className="font-display text-h2 text-text">Nội dung đóng góp</h2>
              <p className="mt-2">
                Khi bạn đóng góp địa điểm hoặc viết review, bạn xác nhận nội dung do bạn
                tạo ra, không vi phạm bản quyền bên thứ ba, và cho phép Map-VN hiển thị
                công khai trên nền tảng. Ảnh upload phải do bạn chụp hoặc có quyền dùng.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Nội dung cấm</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Spam, quảng cáo trá hình.</li>
                <li>Nội dung 18+, bạo lực, kỳ thị.</li>
                <li>Thông tin sai sự thật về địa điểm (giá, giờ mở…).</li>
                <li>Ảnh không phù hợp văn hoá Việt Nam.</li>
              </ul>
              <p className="mt-2">
                Biên tập viên có quyền xoá / từ chối duyệt nội dung vi phạm.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Trách nhiệm</h2>
              <p className="mt-2">
                Map-VN cố gắng cung cấp thông tin chính xác nhưng không đảm bảo tuyệt đối —
                thông tin có thể thay đổi (quán đóng cửa, giá lên, giờ thay đổi). Vui lòng
                xác nhận trước khi ghé.
              </p>
            </section>

            <section>
              <h2 className="font-display text-h2 text-text">Liên hệ</h2>
              <p className="mt-2">
                Báo cáo nội dung vi phạm, khiếu nại, hoặc thắc mắc:{" "}
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
