import { createClient } from "@/lib/supabase/server";

export async function getAllTags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
