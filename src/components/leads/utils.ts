import type { LeadStage } from "@/types";

export const TODAY = "2026-07-22";

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isFollowUpOverdue(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;
  return nextFollowUp < TODAY;
}

export function isFollowUpDue(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;
  return nextFollowUp <= TODAY;
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
