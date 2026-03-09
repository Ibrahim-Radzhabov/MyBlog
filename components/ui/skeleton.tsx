import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[color:var(--surface)]", className)} />;
}

export { Skeleton };
