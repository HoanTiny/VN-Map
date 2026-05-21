"use client";
import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface SessionState {
  /** Current Supabase session — null when signed-out. */
  session: Session | null;
  /** Convenience: just the user. */
  user: User | null;
  /** True once initial getSession() resolves. Use to gate UI flash. */
  hydrated: boolean;
  /** True when Supabase isn't configured (env vars missing). */
  disabled: boolean;
}

/**
 * Subscribe to Supabase auth state. Single source of truth across the app.
 * - First render: hydrated=false (avoid showing signed-out UI to a signed-in user briefly)
 * - After getSession() resolves: hydrated=true with current state
 * - Re-renders on auth events (sign-in, sign-out, token refresh)
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const disabled = !isSupabaseConfigured();

  useEffect(() => {
    if (disabled) {
      setHydrated(true);
      return;
    }
    const supabase = createClient();

    // 1) Hydrate from cookie
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setHydrated(true);
    });

    // 2) Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => subscription.unsubscribe();
  }, [disabled]);

  return {
    session,
    user: session?.user ?? null,
    hydrated,
    disabled,
  };
}
