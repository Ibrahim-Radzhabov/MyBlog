import { Badge } from "@/components/ui/badge";

type VisibilityBadgeProps = {
  visibility: "public" | "hidden";
};

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  if (visibility === "public") {
    return <Badge variant="success">Виден</Badge>;
  }

  return <Badge variant="secondary">Скрыт</Badge>;
}
