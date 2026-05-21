"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser-side Supabase client. Use this in client components and hooks.
 *
 * Auto-detects cookies from the request — supports Supabase's PKCE auth flow
 * with @supabase/ssr cookie sync. The same instance is returned on subsequent
 * calls within the same component tree thanks to React's module caching.
 *
 * Server components / actions: use `createServerClient` from `./server` instead.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars — see PHASE_2_SETUP.md to configure."
    );
  }
  return createBrowserClient<Database>(url, anonKey);
}

// Re-export so existing client-side imports keep working. Actual impl lives
// in ./env (no "use client" directive) so server modules can import too.
export { isSupabaseConfigured } from "./env";
