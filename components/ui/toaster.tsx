"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        className: "!border !border-[color:var(--border)] !bg-[color:var(--card)] !text-[color:var(--foreground)]",
      }}
    />
  );
}
