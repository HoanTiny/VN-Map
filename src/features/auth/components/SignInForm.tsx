"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/ui/button";
import { spring, transition } from "@/lib/motion";

export function SignInForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  const [method, setMethod] = useState<"options" | "email" | "sent">("options");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  const redirectUrl = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase chưa được cấu hình — xem PHASE_2_SETUP.md.");
      return;
    }
    setError(null);
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl() },
      });
      if (err) throw err;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập Google thất bại.");
      setOauthLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setError("Supabase chưa được cấu hình — xem PHASE_2_SETUP.md.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectUrl() },
      });
      if (err) throw err;
      setMethod("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {method === "options" && (
          <m.div
            key="options"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={spring.default}
            className="space-y-4"
          >
            {/* Google OAuth — primary fast path */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={oauthLoading}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-surface text-body-sm font-medium text-text shadow-sm transition-all hover:bg-surface-2 hover:border-text/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />
              <span>{oauthLoading ? "Đang chuyển hướng…" : "Tiếp tục bằng Google"}</span>
            </button>

            {/* Facebook OAuth — Mock/Aesthetic */}
            <button
              type="button"
              onClick={() => setError("Đăng nhập bằng Facebook hiện đang bảo trì.")}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-surface text-body-sm font-medium text-text shadow-sm transition-all hover:bg-surface-2 hover:border-text/20 active:scale-[0.99]"
            >
              <FacebookIcon />
              <span>Tiếp tục bằng Facebook</span>
            </button>

            {/* Apple OAuth — Mock/Aesthetic */}
            <button
              type="button"
              onClick={() => setError("Đăng nhập bằng Apple hiện đang bảo trì.")}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-surface text-body-sm font-medium text-text shadow-sm transition-all hover:bg-surface-2 hover:border-text/20 active:scale-[0.99]"
            >
              <AppleIcon />
              <span>Tiếp tục bằng Apple</span>
            </button>

            <div className="flex items-center gap-3 py-2">
              <span className="h-px flex-1 bg-border/60" />
              <span className="text-caption uppercase tracking-wider text-text-muted/80 text-[10px] font-bold">Hoặc</span>
              <span className="h-px flex-1 bg-border/60" />
            </div>

            {/* Email Magic Link Option */}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMethod("email");
              }}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-zinc-950 text-body-sm font-medium text-white shadow-md transition-all hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 active:scale-[0.99]"
            >
              <Mail size={16} />
              <span>Đăng ký bằng email</span>
            </button>

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-center text-body-sm text-danger animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </p>
            )}
          </m.div>
        )}

        {method === "email" && (
          <m.form
            key="email"
            onSubmit={submit}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={spring.default}
            className="space-y-4"
          >
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMethod("options");
              }}
              className="inline-flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Quay lại các lựa chọn</span>
            </button>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-body-sm font-medium text-text">
                Email của bạn
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  className="h-12 w-full rounded-full border border-border bg-bg pl-11 pr-4 text-bodyoutline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-body-sm text-danger">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full h-12 font-medium"
              loading={submitting}
              disabled={!email}
            >
              Gửi link đăng nhập
            </Button>

            <p className="text-center text-caption text-text-muted leading-relaxed">
              Chúng tôi sẽ gửi link đăng nhập 1-click qua email — không cần mật khẩu.
            </p>
          </m.form>
        )}

        {method === "sent" && (
          <m.div
            key="sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={transition.base}
            className="text-center py-4"
          >
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="font-display text-h2 text-text">Kiểm tra email</h2>
            <p className="mx-auto mt-2 max-w-sm text-body-sm text-text-muted leading-relaxed">
              Chúng tôi đã gửi link đăng nhập tới{" "}
              <strong className="text-text">{email}</strong>. Click vào link trong email để
              hoàn tất.
            </p>
            <Button
              variant="ghost"
              className="mt-6 rounded-full"
              onClick={() => {
                setMethod("options");
                setEmail("");
              }}
            >
              Dùng phương thức khác
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Official Google "G" mark for OAuth button (4-colour SVG). */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

/** Official Facebook SVG icon */
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** Official Apple SVG icon */
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current text-black dark:text-white" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.62.71-1.16 1.85-1.02 2.96 1.12.09 2.27-.58 2.97-1.4z" />
    </svg>
  );
}
