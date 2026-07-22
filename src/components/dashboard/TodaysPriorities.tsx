import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, Info, Syringe, TrendingDown, PackageX, UserX, CheckCircle2, MoreHorizontal } from "lucide-react";
import type { Alert, AlertKind } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAppData } from "@/store/AppDataContext";
import { computeAlerts } from "@/store/selectors";
import { useToast } from "@/components/ui/toast";
import { TODAY, addDays } from "@/lib/date";
import { cn } from "@/lib/utils";

const severityConfig: Record<Alert["severity"], { icon: typeof AlertCircle; classes: string; label: string }> = {
  critical: { icon: AlertCircle, classes: "text-red-600 bg-red-50 border-red-100", label: "Critical" },
  warning: { icon: AlertTriangle, classes: "text-amber-600 bg-amber-50 border-amber-100", label: "Warning" },
  info: { icon: Info, classes: "text-blue-600 bg-blue-50 border-blue-100", label: "Info" },
};

const kindIcon: Record<AlertKind, typeof Syringe> = {
  "vaccination-due": Syringe,
  "yield-decline": TrendingDown,
  "health-issue": AlertCircle,
  "low-stock": PackageX,
  "out-of-stock": PackageX,
  "expiring-soon": PackageX,
  "follow-up-overdue": UserX,
};

const VISIBLE_COUNT = 4;

export function TodaysPriorities() {
  const { state, recordVaccination, updateAnimal, addTask, adjustInventory, markLeadContacted, updateLead } = useAppData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const allAlerts = computeAlerts(state);
  const alerts = showAll ? allAlerts : allAlerts.slice(0, VISIBLE_COUNT);
  const criticalCount = allAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = allAlerts.filter((a) => a.severity === "warning").length;

  function handleAction(alert: Alert, action: string) {
    switch (action) {
      case "open-animal":
        navigate(`/farm-records?open=${alert.linkedAnimalId}`);
        return;
      case "mark-vaccinated": {
        if (!alert.linkedAnimalId) return;
        recordVaccination({ animalId: alert.linkedAnimalId, vaccine: "Scheduled vaccination", date: TODAY, nextDue: addDays(TODAY, 180) });
        toast({ title: "Vaccination recorded", description: `${alert.linkedAnimalId} marked complete.`, variant: "success" });
        return;
      }
      case "snooze-checkup": {
        if (!alert.linkedAnimalId) return;
        const animal = state.animals.find((a) => a.id === alert.linkedAnimalId);
        if (!animal) return;
        updateAnimal({ ...animal, nextCheckup: addDays(TODAY, 3) });
        toast({ title: "Snoozed 3 days", description: `${animal.name}'s check-up moved out.`, variant: "info" });
        return;
      }
      case "create-vet-task": {
        if (!alert.linkedAnimalId) return;
        const animal = state.animals.find((a) => a.id === alert.linkedAnimalId);
        addTask({
          id: `TSK-${Date.now()}`,
          title: `Veterinary review — ${animal?.name ?? alert.linkedAnimalId}`,
          category: "Veterinary Visit",
          relatedRecord: `${alert.linkedAnimalId} · ${animal?.name ?? ""}`,
          dueDate: addDays(TODAY, 1),
          priority: "High",
          status: "Pending",
          linkedAnimalId: alert.linkedAnimalId,
        });
        toast({ title: "Task created", description: "Veterinary review scheduled for tomorrow.", variant: "success" });
        return;
      }
      case "open-inventory":
        navigate(`/inventory?open=${alert.linkedInventoryId}`);
        return;
      case "restock-task": {
        if (!alert.linkedInventoryId) return;
        const item = state.inventory.find((i) => i.id === alert.linkedInventoryId);
        addTask({
          id: `TSK-${Date.now()}`,
          title: `Reorder ${item?.name ?? "inventory item"}`,
          category: "Inventory Purchase",
          relatedRecord: item?.name ?? "",
          dueDate: addDays(TODAY, 1),
          priority: "High",
          status: "Pending",
          linkedInventoryId: alert.linkedInventoryId,
        });
        toast({ title: "Restock task created", variant: "success" });
        return;
      }
      case "quick-restock": {
        if (!alert.linkedInventoryId) return;
        const item = state.inventory.find((i) => i.id === alert.linkedInventoryId);
        if (!item) return;
        adjustInventory({
          itemId: item.id,
          transactionType: "Stock In",
          quantity: Math.max(item.minRequired, 10),
          date: TODAY,
          supplier: item.supplier,
          notes: "Quick restock from Today's Priorities",
        });
        toast({ title: "Stock added", description: `${item.name} restocked.`, variant: "success" });
        return;
      }
      case "open-lead":
        navigate(`/leads?open=${alert.linkedLeadId}`);
        return;
      case "mark-contacted": {
        if (!alert.linkedLeadId) return;
        markLeadContacted(alert.linkedLeadId);
        toast({ title: "Marked as contacted", variant: "success" });
        return;
      }
      case "reschedule-follow-up": {
        if (!alert.linkedLeadId) return;
        updateLead(alert.linkedLeadId, { nextFollowUp: addDays(TODAY, 3) });
        toast({ title: "Follow-up rescheduled", description: "Moved out by 3 days.", variant: "info" });
        return;
      }
      default:
        return;
    }
  }

  function primaryAction(alert: Alert): { label: string; action: string } {
    switch (alert.kind) {
      case "vaccination-due":
        return { label: "Mark completed", action: "mark-vaccinated" };
      case "yield-decline":
      case "health-issue":
        return { label: "View animal", action: "open-animal" };
      case "low-stock":
      case "out-of-stock":
        return { label: "Adjust stock", action: "quick-restock" };
      case "expiring-soon":
        return { label: "Open item", action: "open-inventory" };
      case "follow-up-overdue":
        return { label: "Mark contacted", action: "mark-contacted" };
    }
  }

  function secondaryActions(alert: Alert): { label: string; action: string }[] {
    switch (alert.kind) {
      case "vaccination-due":
        return [
          { label: "Open animal", action: "open-animal" },
          { label: "Create task", action: "create-vet-task" },
          { label: "Snooze 3 days", action: "snooze-checkup" },
        ];
      case "yield-decline":
      case "health-issue":
        return [{ label: "Schedule vet review", action: "create-vet-task" }];
      case "low-stock":
      case "out-of-stock":
        return [
          { label: "Open item", action: "open-inventory" },
          { label: "Create restock task", action: "restock-task" },
        ];
      case "expiring-soon":
        return [{ label: "Create restock task", action: "restock-task" }];
      case "follow-up-overdue":
        return [
          { label: "Open lead", action: "open-lead" },
          { label: "Reschedule", action: "reschedule-follow-up" },
        ];
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Today&apos;s Priorities</CardTitle>
          <CardDescription>What needs your attention, with one-tap actions</CardDescription>
        </div>
        {allAlerts.length > 0 && (
          <div className="flex shrink-0 items-center gap-1.5">
            {criticalCount > 0 && (
              <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                {criticalCount} critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {warningCount} warning
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {allAlerts.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50/50 p-4">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
            <p className="text-sm text-brand-800">Nothing urgent today — herd, stock, and follow-ups are all on track.</p>
          </div>
        )}
        <ul className="flex-1 divide-y divide-neutral-100">
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            const Icon = kindIcon[alert.kind];
            const primary = primaryAction(alert);
            const secondary = secondaryActions(alert);
            return (
              <li key={alert.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", cfg.classes)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{alert.message}</p>
                  <p className="text-xs text-neutral-400">{alert.module}</p>
                </div>
                <Button size="sm" variant="secondary" className="shrink-0" onClick={() => handleAction(alert, primary.action)}>
                  {primary.label}
                </Button>
                {secondary.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {secondary.map((s) => (
                        <DropdownMenuItem key={s.action} onSelect={() => handleAction(alert, s.action)}>
                          {s.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            );
          })}
        </ul>
        {allAlerts.length > VISIBLE_COUNT && (
          <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show fewer" : `View all ${allAlerts.length} priorities`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
