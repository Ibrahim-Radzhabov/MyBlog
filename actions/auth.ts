"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { siteConfig } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthActionState = {
  error?: string;
};

export async function signInAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid credentials",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sign-in failed. Try again.",
    };
  }

  if ((user.email ?? "").toLowerCase() !== siteConfig.adminEmail.toLowerCase()) {
    await supabase.auth.signOut();
    return {
      error: "This account cannot access admin.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error: "Profile is not authorized as admin.",
    };
  }

  redirect("/admin?toast=login_success");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?toast=signed_out");
}
