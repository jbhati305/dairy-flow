import { useState } from "react";
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
    <div className="flex gap-4 overflow-x-auto pb-2">
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
              "flex min-w-[270px] flex-1 flex-col rounded-xl border border-neutral-200 bg-neutral-25 p-2.5 transition-colors",
              dragOverStage === stage && "border-brand-300 bg-brand-50/40"
            )}
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <h3 className="text-sm font-semibold text-neutral-800">{stage}</h3>
              <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
                {stageLeads.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
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
                <p className="rounded-lg border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-400">
                  No leads
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
