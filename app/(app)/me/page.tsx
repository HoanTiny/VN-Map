import Link from "next/link";
import { Briefcase, Heart, MapPin, Sparkles, User } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

export const metadata = {
  title: "Tài khoản · Map-VN",
};

export default function MePage() {
  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container max-w-3xl">
        <Reveal>
          <Badge variant="outline" className="mb-3">Bản beta</Badge>
          <h1 className="font-display text-display-lg text-text">Tài khoản</h1>
          <p className="mt-2 text-body-lg text-text-muted">
            Hiện đang dùng chế độ khách — dữ liệu lưu trên trình duyệt này.
            Đăng nhập / đăng ký sẽ ra mắt trong bản cập nhật tới.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Reveal>
            <Tile
              href="/saved"
              icon={<Heart size={20} />}
              title="Đã lưu"
              description="Địa điểm bạn yêu thích — lưu bằng trái tim ♡"
            />
          </Reveal>
          <Reveal delay={0.05}>
            <Tile
              href="/trip"
              icon={<Briefcase size={20} />}
              title="Chuyến đi"
              description="Lộ trình đã dựng — sửa, thêm địa điểm theo ngày"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Tile
              href="/submit"
              icon={<MapPin size={20} />}
              title="Đóng góp"
              description="Đề xuất địa điểm mới cho cộng đồng"
            />
          </Reveal>
          <Reveal delay={0.15}>
            <Tile
              href="/explore"
              icon={<Sparkles size={20} />}
              title="Khám phá"
              description="Mở bản đồ và tìm trải nghiệm mới"
            />
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-10 rounded-2xl border border-dashed border-border p-6 text-center">
            <User size={20} className="mx-auto text-text-muted" />
            <p className="mt-2 font-display text-h3 text-text">Tài khoản đầy đủ</p>
            <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
              Sign-in qua Google / Email, đồng bộ giữa nhiều thiết bị, theo dõi review của
              bạn — sẽ có trong Phase 2.
            </p>
            <Button variant="secondary" disabled className="mt-4">
              Sắp ra mắt
            </Button>
          </div>
        </Reveal>
      </div>
    </article>
  );
}

function Tile({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-700">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-h3 text-text">{title}</p>
        <p className="mt-0.5 text-body-sm text-text-muted">{description}</p>
      </div>
    </Link>
  );
}
