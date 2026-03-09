import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--foreground)] text-[color:var(--background)] hover:bg-[color:var(--foreground-soft)]",
        secondary:
          "bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-strong)] border border-[color:var(--border)]",
        outline:
          "border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface)]",
        ghost: "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]",
        destructive: "bg-[color:var(--danger)] text-white hover:bg-[color:var(--danger-soft)]",
        link: "text-[color:var(--foreground)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
