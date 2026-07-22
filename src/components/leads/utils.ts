import type { LeadStage, TrialOrderStatus } from "@/types";
import { TODAY, formatDate, isPast, isPastOrToday } from "@/lib/date";

export { TODAY, formatDate };

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function isFollowUpOverdue(nextFollowUp: string | null): boolean {
  return isPast(nextFollowUp);
}

export function isFollowUpDue(nextFollowUp: string | null): boolean {
  return isPastOrToday(nextFollowUp);
}

export const stageBadgeVariant: Record<
  LeadStage,
  "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "outline"
> = {
  "New Inquiry": "info",
  Contacted: "neutral",
  "Visit Scheduled": "info",
  "Proposal Sent": "warning",
  Negotiation: "warning",
  Won: "success",
  Lost: "outline",
};

export const trialBadgeVariant: Record<TrialOrderStatus, "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "outline"> = {
  "Not Started": "neutral",
  Scheduled: "info",
  "In Progress": "warning",
  Completed: "success",
  "Not Applicable": "outline",
};
