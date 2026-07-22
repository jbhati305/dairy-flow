import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Table2, Users, Wallet, CalendarClock, Droplets, AlertTriangle, Plus } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { leadStages } from "@/data/leads";
import { StatCard } from "@/components/shared/StatCard";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Leads</h2>
          <p className="text-sm text-neutral-500">Track and manage your dairy sales pipeline.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Leads" value={activeLeadsCount.toString()} icon={Users} tone="brand" />
        <StatCard label="Pipeline Value" value={`${formatCurrencyCompact(totalPipelineValue)}/mo`} icon={Wallet} tone="brand" />
        <StatCard label="Required L/day" value={requiredLitresPerDay.toString()} icon={Droplets} tone="brand" />
        <StatCard
          label="Follow-ups Due"
          value={followUpsDue.toString()}
          icon={CalendarClock}
          tone={followUpsDue > 0 ? "amber" : "neutral"}
        />
        <StatCard label="Available Surplus" value={`${capacity.availableToSell} L`} icon={Droplets} tone="brand" />
        <StatCard
          label="Demand vs Capacity"
          value={capacity.capacityGap > 0 ? `+${capacity.capacityGap} L short` : "Within capacity"}
          icon={AlertTriangle}
          tone={capacity.capacityGap > 0 ? "red" : "neutral"}
        />
      </div>

      {capacity.capacityGap > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Advanced-stage demand exceeds estimated surplus</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Leads in Proposal Sent / Negotiation want {capacity.advancedStageDemand} L/day, but only {capacity.availableToSell} L/day is
              estimated as available today. Consider phasing new contracts or growing supply before closing all of them.
            </p>
          </div>
        </div>
      )}

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
