import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - Static assets (_next/static, _next/image, favicon, etc.)
     * - Image optimization output
     * - Public files in /images, /og
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|og/|.*\\..*).*)",
  ],
};
