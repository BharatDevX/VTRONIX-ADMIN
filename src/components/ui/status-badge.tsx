import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  value: string | boolean;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const normalized = typeof value === "boolean" ? (value ? "active" : "inactive") : value.toLowerCase();
  const tone = normalized.includes("reject") || normalized.includes("absent") || normalized.includes("inactive")
    ? "danger"
    : normalized.includes("approved") || normalized.includes("present") || normalized.includes("active")
    ? "success"
    : normalized.includes("pending") || normalized.includes("late") || normalized.includes("leave")
      ? "warning"
      : "neutral";

  return <Badge tone={tone}>{typeof value === "boolean" ? (value ? "Active" : "Inactive") : value}</Badge>;
}
