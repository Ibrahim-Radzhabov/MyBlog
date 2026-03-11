import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: "draft" | "published";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return <Badge variant="success">Опубликовано</Badge>;
  }

  return <Badge variant="warning">Черновик</Badge>;
}
