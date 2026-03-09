import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[color:var(--foreground)] text-[color:var(--background)]",
        secondary: "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]",
        success: "border-[color:var(--success)]/30 bg-[color:var(--success)]/10 text-[color:var(--success)]",
        warning: "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
        destructive: "border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 text-[color:var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
