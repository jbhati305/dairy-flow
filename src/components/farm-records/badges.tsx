import { Badge } from "@/components/ui/badge";
import type { HealthStatus, LactationStatus } from "@/types";

export function HealthBadge({ status }: { status: HealthStatus }) {
  const variant =
    status === "Healthy" ? "success" : status === "Under Observation" ? "warning" : "danger";
  return <Badge variant={variant}>{status}</Badge>;
}

export function LactationBadge({ status }: { status: LactationStatus }) {
  const variant =
    status === "Lactating"
      ? "success"
      : status === "Pregnant"
        ? "info"
        : status === "Dry"
          ? "warning"
          : "neutral";
  return <Badge variant={variant}>{status}</Badge>;
}
