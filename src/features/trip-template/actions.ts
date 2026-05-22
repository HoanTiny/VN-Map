"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Deep-copy a trip template into the signed-in user's own `trips` table.
 * Returns the new trip id on success. Redirects to /sign-in if unauthenticated.
 */
export async function forkTripTemplate(slug: string): Promise<{ id: string } | undefined> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/trips/${slug}`);
  }

  const { data: template, error: fetchErr } = await supabase
    .from("trip_templates")
    .select("title, summary, cover, destinations, days")
    .eq("slug", slug)
    .eq("enabled", true)
    .single();

  if (fetchErr || !template) {
    throw new Error("Không tìm thấy lịch trình mẫu.");
  }

  const t = template as {
    title: string;
    summary: string;
    cover: string;
    destinations: string[];
    days: unknown[];
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("trips")
    .insert({
      owner_id: user.id,
      name: t.title,
      description: t.summary,
      cover: t.cover,
      destinations: t.destinations,
      days: t.days,
    } as never)
    .select("id")
    .single();

  if (insertErr || !inserted) {
    throw new Error("Lỗi sao chép lịch trình: " + (insertErr?.message ?? ""));
  }

  revalidatePath("/trip");
  return { id: (inserted as { id: string }).id };
}
