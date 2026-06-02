"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-dvh flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-overline text-danger">Lỗi · Error</p>
      <h1 className="font-display text-h1">Có gì đó không ổn</h1>
      <p className="text-body text-text-muted">Something went wrong</p>
      <p className="max-w-md text-body text-text-muted">
        Đã xảy ra lỗi không mong muốn. Hãy thử tải lại trang.
      </p>
      <div className="mt-2 flex gap-3">
        <Button onClick={reset}>Thử lại · Retry</Button>
        <Button variant="secondary" asChild>
          <Link href="/">Về trang chủ · Home</Link>
        </Button>
      </div>
    </div>
  );
}
