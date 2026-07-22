import { MoreHorizontal, Droplets, Wallet, Clock } from "lucide-react";
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

      <p className="mt-1 text-xs text-neutral-500">{lead.buyerType}</p>

      <div className="mt-2.5 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
          <Droplets className="h-3.5 w-3.5 text-brand-600" />
          {lead.requiredQuantity} L/day
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
          <Wallet className="h-3.5 w-3.5 text-brand-600" />
          {formatCurrency(lead.estimatedMonthlyValue)}/mo
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-neutral-100 pt-2">
        <span className="flex items-center gap-1 text-xs text-neutral-400">
          <Clock className="h-3 w-3" />
          Next: {formatDate(lead.nextFollowUp)}
        </span>
        {overdue && <Badge variant="danger">Overdue</Badge>}
      </div>
    </div>
  );
}
