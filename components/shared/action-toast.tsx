"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const defaults: Record<string, string> = {
  created: "Prompt created",
  updated: "Prompt updated",
  deleted: "Prompt deleted",
  status_changed: "Status updated",
  login_success: "Welcome back",
  signed_out: "Signed out",
  form_error: "Please fix the form errors",
  delete_error: "Failed to delete prompt",
  publish_error: "Failed to change prompt status",
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
    const message = rawMessage ?? defaults[key] ?? "Done";
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
