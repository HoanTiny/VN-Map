import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase appends `?code=...&type=...` to the redirect.
 * We exchange the code for a session (sets auth cookies), then redirect to
 * `?next=` if provided (used to return user to where they came from).
 *
 * Supabase dashboard → Authentication → URL Configuration must include
 * `<base>/auth/callback` in "Redirect URLs".
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Prefer NEXT_PUBLIC_APP_URL to avoid http/https mismatch behind proxies/CDNs.
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
    return NextResponse.redirect(`${base}/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${base}/sign-in?error=missing-code`);
}
