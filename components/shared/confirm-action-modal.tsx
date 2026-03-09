"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";

type FormAction = (formData: FormData) => void | Promise<void>;

type ConfirmActionModalProps = {
  action: FormAction;
  fields: Record<string, string>;
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel: string;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  triggerClassName?: string;
  testId?: string;
};

export function ConfirmActionModal({
  action,
  fields,
  title,
  description,
  triggerLabel,
  confirmLabel,
  triggerVariant = "destructive",
  confirmVariant = "destructive",
  triggerSize = "sm",
  triggerClassName,
  testId,
}: ConfirmActionModalProps) {
  const [open, setOpen] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const entries = useMemo(() => Object.entries(fields), [fields]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    confirmButtonRef.current?.focus();

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        size={triggerSize}
        variant={triggerVariant}
        className={triggerClassName}
        onClick={() => setOpen(true)}
        data-testid={testId ? `${testId}-trigger` : undefined}
      >
        {triggerLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
          data-testid={testId ? `${testId}-modal` : undefined}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-[color:var(--muted-foreground)]">{description}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <form action={action}>
                {entries.map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
                <Button
                  ref={confirmButtonRef}
                  type="submit"
                  variant={confirmVariant}
                  data-testid={testId ? `${testId}-confirm` : undefined}
                >
                  {confirmLabel}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
