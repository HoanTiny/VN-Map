import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

// Paths that live OUTSIDE app/[locale] and must not be touched by the
// next-intl locale rewriter (otherwise it would rewrite "/auth/callback"
// to "/vi/auth/callback" and 404 because the file is at app/auth/callback).
const NON_LOCALIZED_PREFIXES = ["/auth/", "/offline"];

function isNonLocalized(pathname: string) {
  return NON_LOCALIZED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Non-localized routes still need Supabase cookie refresh, but skip intl.
  if (isNonLocalized(pathname)) {
    return updateSession(request);
  }

  // 1. Let next-intl resolve the locale (may rewrite to /vi/... internally
  //    or redirect /vi -> / since default locale uses no prefix).
  const response = intlMiddleware(request);

  // 2. Pipe Supabase session-refresh cookies onto the same response so the
  //    SSR auth helpers keep working.
  return updateSession(request, response);
}

export const config = {
  // Run on every path except static assets, image optimizer output, og/api routes.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|og/|api/|.*\\..*).*)"],
};
