import type { Lead, LeadStage } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency, formatDate, isFollowUpOverdue, stageBadgeVariant, trialBadgeVariant } from "./utils";

interface LeadDetailsDialogProps {
  lead: Lead | null;
  stages: LeadStage[];
  onOpenChange: (open: boolean) => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
  onMarkContacted: (leadId: string) => void;
  onRescheduleFollowUp: (leadId: string) => void;
  onMarkTrialComplete: (leadId: string) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <div className="text-sm text-neutral-800">{value}</div>
    </div>
  );
}

export function LeadDetailsDialog({
  lead,
  stages,
  onOpenChange,
  onMoveStage,
  onMarkContacted,
  onRescheduleFollowUp,
  onMarkTrialComplete,
}: LeadDetailsDialogProps) {
  if (!lead) return null;
  const overdue = isFollowUpOverdue(lead.nextFollowUp);

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{lead.businessName}</DialogTitle>
            <Badge variant={stageBadgeVariant[lead.stage]}>{lead.stage}</Badge>
          </div>
          <DialogDescription>{lead.id}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Buyer Type" value={lead.buyerType} />
          <Field label="Product" value={lead.productType} />
          <Field label="Source" value={lead.source} />
          <Field label="Contact Person" value={lead.contactPerson} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Required Quantity" value={`${lead.requiredQuantity} L/day`} />
          <Field label="Price / Litre" value={`₹${lead.pricePerLitre}`} />
          <Field label="Est. Monthly Value" value={formatCurrency(lead.estimatedMonthlyValue)} />
          <Field label="Delivery Location" value={`${lead.deliveryLocation} (${lead.deliveryDistanceKm} km)`} />
          <Field label="Preferred Timing" value={lead.preferredDeliveryTiming} />
          <Field label="Trial Order" value={<Badge variant={trialBadgeVariant[lead.trialOrderStatus]}>{lead.trialOrderStatus}</Badge>} />
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

        <Separator />

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onMarkContacted(lead.id)}>
            Mark contacted
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onRescheduleFollowUp(lead.id)}>
            Reschedule follow-up
          </Button>
          {lead.trialOrderStatus !== "Completed" && lead.trialOrderStatus !== "Not Applicable" && (
            <Button size="sm" variant="secondary" onClick={() => onMarkTrialComplete(lead.id)}>
              Mark trial complete
            </Button>
          )}
        </div>

        <DialogFooter className="items-center gap-3 sm:justify-between">
          <Select value={lead.stage} onValueChange={(v) => onMoveStage(lead.id, v as LeadStage)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={lead.stage === "Lost"} onClick={() => onMoveStage(lead.id, "Lost")}>
              Mark Lost
            </Button>
            <Button size="sm" disabled={lead.stage === "Won"} onClick={() => onMoveStage(lead.id, "Won")}>
              Mark Won
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
