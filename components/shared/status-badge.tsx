import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: "draft" | "published";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "published") {
    return <Badge variant="success">Published</Badge>;
  }

  return <Badge variant="warning">Draft</Badge>;
}
