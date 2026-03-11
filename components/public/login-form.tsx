"use client";

import { useActionState } from "react";

import { signInAction, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {state.error ? (
        <p className="rounded-md border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 p-2 text-sm text-[color:var(--danger)]">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Выполняем вход..." : "Войти"}
      </Button>
    </form>
  );
}
