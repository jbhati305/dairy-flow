import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Table2, Users, Trophy, Wallet, CalendarClock, Plus } from "lucide-react";
import type { Lead, LeadStage } from "@/types";
import { leads as initialLeads, leadStages } from "@/data/leads";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadDetailsDialog } from "@/components/leads/LeadDetailsDialog";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { formatCurrency, isFollowUpDue } from "@/components/leads/utils";

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [view, setView] = useState<"board" | "table">("board");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const wonCount = leads.filter((l) => l.stage === "Won").length;
  const totalPipelineValue = leads
    .filter((l) => l.stage !== "Lost")
    .reduce((sum, l) => sum + l.estimatedMonthlyValue, 0);
  const followUpsDue = leads.filter((l) => isFollowUpDue(l.nextFollowUp)).length;

  function handleMoveStage(leadId: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    const lead = leads.find((l) => l.id === leadId);
    toast({
      title: "Stage updated",
      description: lead ? `${lead.businessName} moved to ${stage}.` : undefined,
      variant: "success",
    });
  }

  function handleAddLead(lead: Lead) {
    setLeads((prev) => [lead, ...prev]);
    toast({
      title: "Lead added",
      description: `${lead.businessName} has been added to the pipeline.`,
      variant: "success",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Leads</h2>
          <p className="text-sm text-neutral-500">Track and manage your sales pipeline.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active Leads" value={activeLeadsCount.toString()} icon={Users} tone="brand" />
        <StatCard label="Won This Period" value={wonCount.toString()} icon={Trophy} tone="brand" />
        <StatCard
          label="Total Pipeline Value"
          value={formatCurrency(totalPipelineValue)}
          icon={Wallet}
          tone="brand"
        />
        <StatCard
          label="Follow-ups Due"
          value={followUpsDue.toString()}
          icon={CalendarClock}
          tone={followUpsDue > 0 ? "amber" : "neutral"}
        />
      </div>

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
            onOpenLead={setSelectedLead}
            onMoveStage={handleMoveStage}
          />
        </TabsContent>

        <TabsContent value="table">
          <LeadsTable
            leads={leads}
            stages={leadStages}
            onOpenLead={setSelectedLead}
            onMoveStage={handleMoveStage}
          />
        </TabsContent>
      </Tabs>

      <LeadDetailsDialog
        lead={selectedLead}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} stages={leadStages} onAdd={handleAddLead} />
    </div>
  );
}
