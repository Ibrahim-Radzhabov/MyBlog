"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { siteConfig } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
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
      error: parsed.error.issues[0]?.message ?? "Неверные учетные данные",
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
      error: "Не удалось выполнить вход. Попробуйте еще раз.",
    };
  }

  if ((user.email ?? "").toLowerCase() !== siteConfig.adminEmail.toLowerCase()) {
    await supabase.auth.signOut();
    return {
      error: "Этот аккаунт не имеет доступа к админке.",
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
      error: "Профиль не авторизован как администратор.",
    };
  }

  redirect("/admin?toast=login_success");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?toast=signed_out");
}
