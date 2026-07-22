import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Table2, AlertTriangle, Plus } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { leadStages } from "@/data/leads";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDetailsDialog } from "@/components/leads/LeadDetailsDialog";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { useAppData } from "@/store/AppDataContext";
import {
  computeActiveLeadsCount,
  computeCapacity,
  computeDashboardKpis,
  computeFollowUpsDue,
  computePipelineValue,
  computeRequiredLitresPerDay,
  formatCurrencyCompact,
} from "@/store/selectors";
import { TODAY, addDays } from "@/lib/date";

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { state, addLead, moveLeadStage, markLeadContacted, markLeadTrialStatus, updateLead } = useAppData();

  const [view, setView] = useState<"board" | "table">("board");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Derive from live state so quick actions (mark contacted, reschedule, etc.) taken while
  // the details dialog is open are reflected immediately instead of showing a stale snapshot.
  const selectedLead = state.leads.find((l) => l.id === selectedLeadId) ?? null;

  useEffect(() => {
    const newFlag = searchParams.get("new") === "1";
    const openId = searchParams.get("open");
    if (newFlag) setAddOpen(true);
    if (openId) {
      const lead = state.leads.find((l) => l.id === openId);
      if (lead) setSelectedLeadId(lead.id);
    }
    if (newFlag || openId) {
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leads = state.leads;
  const activeLeadsCount = computeActiveLeadsCount(leads);
  const totalPipelineValue = computePipelineValue(leads);
  const followUpsDue = computeFollowUpsDue(leads);
  const requiredLitresPerDay = computeRequiredLitresPerDay(leads);
  const kpis = computeDashboardKpis(state);
  const capacity = computeCapacity(kpis.milkToday, leads);

  function handleMoveStage(leadId: string, stage: LeadStage) {
    moveLeadStage(leadId, stage);
    const lead = leads.find((l) => l.id === leadId);
    toast({ title: "Stage updated", description: lead ? `${lead.businessName} moved to ${stage}.` : undefined, variant: "success" });
  }

  function handleMarkContacted(leadId: string) {
    markLeadContacted(leadId);
    toast({ title: "Marked as contacted", variant: "success" });
  }

  function handleRescheduleFollowUp(leadId: string) {
    updateLead(leadId, { nextFollowUp: addDays(TODAY, 3) });
    toast({ title: "Follow-up rescheduled", description: "Moved out by 3 days.", variant: "info" });
  }

  function handleMarkTrialComplete(leadId: string) {
    markLeadTrialStatus(leadId, "Completed");
    toast({ title: "Trial order marked complete", variant: "success" });
  }

  function handleAddLead(lead: Lead) {
    addLead(lead);
    toast({ title: "Lead added", description: `${lead.businessName} has been added to the pipeline.`, variant: "success" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Leads</h2>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add lead
        </Button>
      </div>

      <p className="text-sm text-neutral-500">
        {activeLeadsCount} active · {formatCurrencyCompact(totalPipelineValue)} pipeline · {followUpsDue} follow-up{followUpsDue === 1 ? "" : "s"} due · {requiredLitresPerDay} L/day required
      </p>

      <p className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-600">
        <span>
          Available supply <span className="font-medium text-neutral-900">{capacity.availableToSell} L/day</span>
        </span>
        <span className="text-neutral-300">·</span>
        <span>
          Advanced demand <span className="font-medium text-neutral-900">{capacity.advancedStageDemand} L/day</span>
        </span>
        <span className="text-neutral-300">·</span>
        {capacity.capacityGap > 0 ? (
          <span className="flex items-center gap-1 font-medium text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {capacity.capacityGap} L short
          </span>
        ) : (
          <span className="font-medium text-brand-700">Within capacity</span>
        )}
      </p>

      <Tabs value={view} onValueChange={(v) => setView(v as "board" | "table")}>
        <TabsList>
          <TabsTrigger value="board">
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </TabsTrigger>
          <TabsTrigger value="table">
            <Table2 className="h-3.5 w-3.5" />
            Table
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <KanbanBoard
            leads={leads}
            stages={leadStages}
            onOpenLead={(lead) => setSelectedLeadId(lead.id)}
            onMoveStage={handleMoveStage}
            onMarkContacted={handleMarkContacted}
            onRescheduleFollowUp={handleRescheduleFollowUp}
          />
        </TabsContent>

        <TabsContent value="table">
          <LeadsTable
            leads={leads}
            stages={leadStages}
            onOpenLead={(lead) => setSelectedLeadId(lead.id)}
            onMoveStage={handleMoveStage}
            onMarkContacted={handleMarkContacted}
            onRescheduleFollowUp={handleRescheduleFollowUp}
          />
        </TabsContent>
      </Tabs>

      <LeadDetailsDialog
        lead={selectedLead}
        stages={leadStages}
        onOpenChange={(open) => {
          if (!open) setSelectedLeadId(null);
        }}
        onMoveStage={handleMoveStage}
        onMarkContacted={handleMarkContacted}
        onRescheduleFollowUp={handleRescheduleFollowUp}
        onMarkTrialComplete={handleMarkTrialComplete}
      />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} stages={leadStages} onAdd={handleAddLead} />
    </div>
  );
}
