import { Badge } from "@/components/ui/badge";
import type { HealthStatus, LactationStatus } from "@/types";

export function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === "Healthy") {
    return <span className="text-sm text-neutral-500">Healthy</span>;
  }
  const variant = status === "Under Observation" ? "warning" : "danger";
  return <Badge variant={variant}>{status}</Badge>;
}

export function LactationBadge({ status }: { status: LactationStatus }) {
  return <span className="text-sm text-neutral-700">{status}</span>;
}
