import { MoveRight, MapPin, Phone } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate, isFollowUpOverdue } from "./utils";

interface LeadCardProps {
  lead: Lead;
  stages: LeadStage[];
  onOpen: (lead: Lead) => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}

export function LeadCard({ lead, stages, onOpen, onMoveStage, onDragStart }: LeadCardProps) {
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
              aria-label="Move to stage"
            >
              <MoveRight className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Move to...</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {stages.map((s) => (
              <DropdownMenuItem
                key={s}
                disabled={s === lead.stage}
                onClick={() => onMoveStage(lead.id, s)}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{lead.buyerType}</Badge>
        <Badge variant="neutral">{lead.source}</Badge>
      </div>

      <div className="mt-2.5 space-y-1 text-xs text-neutral-500">
        <p className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 shrink-0" />
          {lead.contactPerson}
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 shrink-0" />
          {lead.requiredQuantity} L/day &middot; {formatCurrency(lead.estimatedMonthlyValue)}/mo
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
