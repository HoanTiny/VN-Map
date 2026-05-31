export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-overline text-text-subtle">404</p>
      <h1 className="font-display text-display-lg">Không tìm thấy trang</h1>
      <p className="max-w-md text-body text-text-muted">
        Trang bạn tìm có thể đã bị di chuyển hoặc chưa từng tồn tại.
      </p>
      <div className="mt-4 flex gap-3">
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/explore">Mở bản đồ</Link>
        </Button>
      </div>
    </div>
  );
}
