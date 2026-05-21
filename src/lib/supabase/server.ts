import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Reads cookies for auth (PKCE flow).
 *
 * Usage:
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("places").select("*");
 *
 * Note: Always create per-request; never share across requests because cookies
 * are request-scoped.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars — see PHASE_2_SETUP.md to configure."
    );
  }
  let cookieStore: Awaited<ReturnType<typeof cookies>> | undefined;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request scope (e.g. build time static generation)
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — setAll is no-op there.
          // Middleware refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client — full DB access, bypasses RLS. ONLY for trusted
 * server-side admin operations (seeding, moderation jobs).
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Service-role Supabase client requires SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createServerClient<Database>(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
