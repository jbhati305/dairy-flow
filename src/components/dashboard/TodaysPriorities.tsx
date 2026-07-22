import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, Info, Syringe, TrendingDown, PackageX, UserX, CheckCircle2 } from "lucide-react";
import type { Alert, AlertKind } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/store/AppDataContext";
import { computeAlerts } from "@/store/selectors";
import { useToast } from "@/components/ui/toast";
import { TODAY, addDays } from "@/lib/date";
import { cn } from "@/lib/utils";

const severityConfig: Record<Alert["severity"], { icon: typeof AlertCircle; classes: string }> = {
  critical: { icon: AlertCircle, classes: "text-red-600 bg-red-50 border-red-100" },
  warning: { icon: AlertTriangle, classes: "text-amber-600 bg-amber-50 border-amber-100" },
  info: { icon: Info, classes: "text-blue-600 bg-blue-50 border-blue-100" },
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

export function TodaysPriorities() {
  const { state, recordVaccination, updateAnimal, addTask, adjustInventory, markLeadContacted, updateLead } = useAppData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const alerts = computeAlerts(state).slice(0, 6);

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

  function renderActions(alert: Alert) {
    if (alert.kind === "vaccination-due") {
      return (
        <>
          <Button size="sm" variant="secondary" onClick={() => handleAction(alert, "open-animal")}>Open animal</Button>
          <Button size="sm" onClick={() => handleAction(alert, "mark-vaccinated")}>Mark completed</Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction(alert, "create-vet-task")}>Create task</Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction(alert, "snooze-checkup")}>Snooze</Button>
        </>
      );
    }
    if (alert.kind === "yield-decline" || alert.kind === "health-issue") {
      return (
        <>
          <Button size="sm" variant="secondary" onClick={() => handleAction(alert, "open-animal")}>View animal</Button>
          <Button size="sm" onClick={() => handleAction(alert, "create-vet-task")}>Schedule vet review</Button>
        </>
      );
    }
    if (alert.kind === "low-stock" || alert.kind === "out-of-stock" || alert.kind === "expiring-soon") {
      return (
        <>
          <Button size="sm" variant="secondary" onClick={() => handleAction(alert, "open-inventory")}>Open item</Button>
          {alert.kind !== "expiring-soon" && (
            <Button size="sm" onClick={() => handleAction(alert, "quick-restock")}>Adjust stock</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => handleAction(alert, "restock-task")}>Create restock task</Button>
        </>
      );
    }
    if (alert.kind === "follow-up-overdue") {
      return (
        <>
          <Button size="sm" variant="secondary" onClick={() => handleAction(alert, "open-lead")}>Open lead</Button>
          <Button size="sm" onClick={() => handleAction(alert, "mark-contacted")}>Mark contacted</Button>
          <Button size="sm" variant="ghost" onClick={() => handleAction(alert, "reschedule-follow-up")}>Reschedule</Button>
        </>
      );
    }
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Priorities</CardTitle>
        <CardDescription>What needs your attention right now, with one-tap actions</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {alerts.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-brand-100 bg-brand-50/50 p-4">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
            <p className="text-sm text-brand-800">Nothing urgent today — herd, stock, and follow-ups are all on track.</p>
          </div>
        )}
        {alerts.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const Icon = kindIcon[alert.kind];
          return (
            <div key={alert.id} className="rounded-lg border border-neutral-200 p-3">
              <div className="flex items-start gap-3">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border", cfg.classes)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900">{alert.message}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">{alert.module}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 pl-11">{renderActions(alert)}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
