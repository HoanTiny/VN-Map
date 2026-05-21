"use client";
import Link from "next/link";
import { Briefcase, Heart, LogIn, MapPin, Sparkles, User } from "lucide-react";
import { Reveal } from "@/components/motion";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { useSession } from "../hooks/useSession";
import { SignOutButton } from "./SignOutButton";

export function AccountPanel() {
  const { user, hydrated, disabled } = useSession();

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <div className="container max-w-3xl">
        <Reveal>
          {disabled ? (
            <Badge variant="outline" className="mb-3">Bản beta</Badge>
          ) : !hydrated ? (
            <Skeleton className="mb-3 h-6 w-24" />
          ) : user ? (
            <Badge variant="brand" className="mb-3">Đã đăng nhập</Badge>
          ) : (
            <Badge variant="outline" className="mb-3">Chưa đăng nhập</Badge>
          )}

          <h1 className="font-display text-display-lg text-text">
            {user ? `Xin chào, ${displayName(user.email, user.user_metadata)}` : "Tài khoản"}
          </h1>

          {!hydrated ? (
            <Skeleton className="mt-2 h-5 w-96 max-w-full" />
          ) : disabled ? (
            <p className="mt-2 text-body-lg text-text-muted">
              Hiện đang dùng chế độ khách — dữ liệu lưu trên trình duyệt này.
              Backend (Supabase) chưa được cấu hình.
            </p>
          ) : user ? (
            <p className="mt-2 text-body-lg text-text-muted">
              Email: <span className="text-text">{user.email}</span>. Dữ liệu được đồng bộ
              giữa các thiết bị khi bạn đăng nhập cùng email.
            </p>
          ) : (
            <p className="mt-2 text-body-lg text-text-muted">
              Đăng nhập để đồng bộ saved, trips, reviews giữa các thiết bị.
              Dùng email 1-click — không cần mật khẩu.
            </p>
          )}
        </Reveal>

        {hydrated && !user && !disabled && (
          <Reveal delay={0.05}>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/sign-in">
                  <LogIn size={16} /> Đăng nhập
                </Link>
              </Button>
            </div>
          </Reveal>
        )}

        {/* Quick tiles */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Reveal>
            <Tile href="/saved" icon={<Heart size={20} />} title="Đã lưu" description="Địa điểm bạn yêu thích — lưu bằng trái tim ♡" />
          </Reveal>
          <Reveal delay={0.05}>
            <Tile href="/trip" icon={<Briefcase size={20} />} title="Chuyến đi" description="Lộ trình đã dựng — sửa, thêm địa điểm theo ngày" />
          </Reveal>
          <Reveal delay={0.1}>
            <Tile href="/submit" icon={<MapPin size={20} />} title="Đóng góp" description="Đề xuất địa điểm mới cho cộng đồng" />
          </Reveal>
          <Reveal delay={0.15}>
            <Tile href="/explore" icon={<Sparkles size={20} />} title="Khám phá" description="Mở bản đồ và tìm trải nghiệm mới" />
          </Reveal>
        </div>

        {/* Sign-out card */}
        {hydrated && user && (
          <Reveal>
            <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-6 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-display text-h3 text-brand-700">
                  {initial(user.email)}
                </span>
                <div>
                  <p className="font-medium text-text">{displayName(user.email, user.user_metadata)}</p>
                  <p className="text-body-sm text-text-muted">{user.email}</p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </Reveal>
        )}

        {/* Disabled-mode placeholder */}
        {hydrated && disabled && (
          <Reveal>
            <div className="mt-10 rounded-2xl border border-dashed border-border p-6 text-center">
              <User size={20} className="mx-auto text-text-muted" />
              <p className="mt-2 font-display text-h3 text-text">Đăng nhập sẵn sàng khi backend wired</p>
              <p className="mx-auto mt-1 max-w-md text-body-sm text-text-muted">
                Configure Supabase env vars + chạy migration để bật chế độ đầy đủ. Xem PHASE_2_SETUP.md.
              </p>
            </div>
          </Reveal>
        )}
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

function displayName(email: string | undefined, meta: Record<string, unknown> | undefined): string {
  const fromMeta = meta?.["display_name"] as string | undefined;
  if (fromMeta) return fromMeta;
  if (!email) return "Người dùng";
  return email.split("@")[0]!;
}

function initial(email: string | undefined): string {
  return (email?.[0] ?? "?").toUpperCase();
}
