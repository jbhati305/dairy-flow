import { useState } from "react";
import { Inbox } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { cn } from "@/lib/utils";
import { LeadCard } from "./LeadCard";

interface KanbanBoardProps {
  leads: Lead[];
  stages: LeadStage[];
  onOpenLead: (lead: Lead) => void;
  onMoveStage: (leadId: string, stage: LeadStage) => void;
  onMarkContacted: (leadId: string) => void;
  onRescheduleFollowUp: (leadId: string) => void;
}

export function KanbanBoard({ leads, stages, onOpenLead, onMoveStage, onMarkContacted, onRescheduleFollowUp }: KanbanBoardProps) {
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, stage: LeadStage) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) onMoveStage(leadId, stage);
    setDragOverStage(null);
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((prev) => (prev === stage ? null : prev))}
              onDrop={(e) => handleDrop(e, stage)}
              className={cn(
                "flex max-h-[calc(100vh-320px)] min-w-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-25 transition-colors",
                dragOverStage === stage && "border-brand-300 bg-brand-50/40"
              )}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <h3 className="text-sm font-semibold text-neutral-800">{stage}</h3>
                <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
                  {stageLeads.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto p-2.5 scrollbar-thin">
                {stageLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    stages={stages}
                    onOpen={onOpenLead}
                    onMoveStage={onMoveStage}
                    onMarkContacted={onMarkContacted}
                    onRescheduleFollowUp={onRescheduleFollowUp}
                    onDragStart={handleDragStart}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-neutral-200 p-5 text-center">
                    <Inbox className="h-4 w-4 text-neutral-300" />
                    <p className="text-xs text-neutral-400">No leads in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-neutral-50 to-transparent" />
    </div>
  );
}
