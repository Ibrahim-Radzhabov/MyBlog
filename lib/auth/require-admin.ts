import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth_required");
  }

  const userEmail = user.email?.toLowerCase() ?? "";
  const adminEmail = siteConfig.adminEmail.toLowerCase();

  if (userEmail !== adminEmail) {
    await supabase.auth.signOut();
    redirect("/login?error=not_admin_email");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    redirect("/login?error=forbidden");
  }

  return {
    user,
    profile,
    supabase,
  };
}
