import { MoreHorizontal, MapPin, Phone } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, isFollowUpOverdue } from "./utils";

interface LeadCardProps {
  lead: Lead;
  stages: LeadStage[];
  onOpen: (lead: Lead) => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
  onMarkContacted: (leadId: string) => void;
  onRescheduleFollowUp: (leadId: string) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function LeadCard({ lead, stages, onOpen, onMoveStage, onMarkContacted, onRescheduleFollowUp, onDragStart }: LeadCardProps) {
  const overdue = isFollowUpOverdue(lead.nextFollowUp);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={() => onOpen(lead)}
      className="cursor-pointer rounded-lg border border-neutral-200 bg-white p-3 shadow-[var(--shadow-card)] transition-colors hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-neutral-900 leading-snug">{lead.businessName}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Lead actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMarkContacted(lead.id)}>Mark contacted</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRescheduleFollowUp(lead.id)}>Reschedule follow-up (+3d)</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to...</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {stages.map((s) => (
                  <DropdownMenuItem key={s} disabled={s === lead.stage} onClick={() => onMoveStage(lead.id, s)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={lead.stage === "Won"} onClick={() => onMoveStage(lead.id, "Won")}>
              Mark Won
            </DropdownMenuItem>
            <DropdownMenuItem disabled={lead.stage === "Lost"} onClick={() => onMoveStage(lead.id, "Lost")}>
              Mark Lost
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{lead.buyerType}</Badge>
        <Badge variant="neutral">{lead.requiredQuantity} L/day</Badge>
      </div>

      <div className="mt-2.5 space-y-1 text-xs text-neutral-500">
        <p className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 shrink-0" />
          {lead.contactPerson}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          {formatCurrency(lead.estimatedMonthlyValue)}/mo
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px]">
        <span className="text-neutral-400">Last: {formatDate(lead.lastInteraction)}</span>
        <span className={cn("font-medium", overdue ? "text-red-600" : "text-neutral-500")}>
          Next: {formatDate(lead.nextFollowUp)}
        </span>
      </div>
    </div>
  );
}
