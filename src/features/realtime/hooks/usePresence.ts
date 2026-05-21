"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useSession } from "@/features/auth/hooks/useSession";

export function usePresence(room: string) {
  const [count, setCount] = useState(1);
  const { user } = useSession();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const channel = supabase.channel(`presence:${room}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Math.max(1, Object.keys(state).length));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ uid: user?.id ?? "guest", joined_at: Date.now() });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [room, user?.id]);

  return count;
}
