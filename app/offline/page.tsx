import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline · Map-VN" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
        <WifiOff size={28} className="text-text-muted" />
      </div>
      <h1 className="mt-5 font-display text-display-sm text-text">Không có mạng</h1>
      <p className="mx-auto mt-2 max-w-xs text-body text-text-muted">
        Kiểm tra kết nối internet rồi thử lại — nội dung đã xem trước sẽ vẫn hoạt động.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-body-sm font-medium text-white hover:bg-brand-700"
      >
        Thử lại
      </Link>
    </div>
  );
}
