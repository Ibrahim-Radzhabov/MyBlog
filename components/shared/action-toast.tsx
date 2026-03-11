"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const defaults: Record<string, string> = {
  created: "Промпт создан",
  updated: "Промпт обновлен",
  deleted: "Промпт удален",
  status_changed: "Статус обновлен",
  login_success: "С возвращением",
  signed_out: "Вы вышли из аккаунта",
  form_error: "Исправьте ошибки в форме",
  delete_error: "Не удалось удалить промпт",
  publish_error: "Не удалось изменить статус промпта",
};

export function ActionToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const processed = useRef<string | null>(null);

  useEffect(() => {
    const key = searchParams.get("toast");

    if (!key) {
      return;
    }

    const signature = `${pathname}:${searchParams.toString()}`;
    if (processed.current === signature) {
      return;
    }

    processed.current = signature;

    const rawMessage = searchParams.get("message");
    const message = rawMessage ?? defaults[key] ?? "Готово";
    const isError = key.includes("error") || key === "forbidden";

    if (isError) {
      toast.error(message);
    } else {
      toast.success(message);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("message");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
