import type { Lead } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, isFollowUpOverdue, stageBadgeVariant } from "./utils";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  );
}

export function LeadDetailsDialog({ lead, onOpenChange }: LeadDetailsDialogProps) {
  if (!lead) return null;
  const overdue = isFollowUpOverdue(lead.nextFollowUp);

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{lead.businessName}</DialogTitle>
            <Badge variant={stageBadgeVariant[lead.stage]}>{lead.stage}</Badge>
          </div>
          <DialogDescription>{lead.id}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Buyer Type" value={lead.buyerType} />
          <Field label="Source" value={lead.source} />
          <Field label="Contact Person" value={lead.contactPerson} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Required Quantity" value={`${lead.requiredQuantity} L/day`} />
          <Field label="Est. Monthly Value" value={formatCurrency(lead.estimatedMonthlyValue)} />
          <Field label="Last Interaction" value={formatDate(lead.lastInteraction)} />
          <Field
            label="Next Follow-up"
            value={
              <span className={overdue ? "font-medium text-red-600" : undefined}>
                {formatDate(lead.nextFollowUp)}
                {overdue && " (overdue)"}
              </span>
            }
          />
        </div>

        <Separator />

        <div>
          <p className="text-xs text-neutral-400">Notes</p>
          <p className="mt-1 text-sm text-neutral-700 leading-relaxed">{lead.notes || "No notes."}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
