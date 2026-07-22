import type {
  Alert,
  Animal,
  Breed,
  HerdGroup,
  InventoryItem,
  InventoryStatus,
  InventoryTransaction,
  Lead,
  MilkProductionEntry,
  Task,
} from "@/types";
import { HERD_GROUPS } from "@/types";
import { TODAY, addDays, daysUntil, isPast, isPastOrToday } from "@/lib/date";
import type { AppState } from "./AppDataContext";

// ---------- Herd ----------

export interface HerdSummary {
  total: number;
  lactating: number;
  dry: number;
  pregnant: number;
  calves: number;
  underTreatment: number;
}

export function computeHerdSummary(animals: Animal[]): HerdSummary {
  const underTreatment = animals.filter((a) => a.healthStatus === "Treatment Required").length;
  const rest = animals.filter((a) => a.healthStatus !== "Treatment Required");
  return {
    total: animals.length,
    lactating: rest.filter((a) => a.lactationStatus === "Lactating").length,
    dry: rest.filter((a) => a.lactationStatus === "Dry").length,
    pregnant: rest.filter((a) => a.lactationStatus === "Pregnant").length,
    calves: rest.filter((a) => a.lactationStatus === "Calf").length,
    underTreatment,
  };
}

// ---------- Milk production ----------

export function computeDailyTotals(entries: MilkProductionEntry[]): { date: string; litres: number }[] {
  const byDate = new Map<string, number>();
  for (const e of entries) {
    byDate.set(e.date, (byDate.get(e.date) ?? 0) + e.morningYield + e.eveningYield);
  }
  return Array.from(byDate.entries())
    .map(([date, litres]) => ({ date, litres }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function computeMilkToday(entries: MilkProductionEntry[]): number {
  return entries.filter((e) => e.date === TODAY).reduce((sum, e) => sum + e.morningYield + e.eveningYield, 0);
}

export function computeWeeklyTrend(entries: MilkProductionEntry[]): { day: string; date: string; litres: number }[] {
  const daily = computeDailyTotals(entries).filter((d) => d.date > addDays(TODAY, -7) && d.date <= TODAY);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return daily.map((d, i) => ({ day: labels[i] ?? d.date, date: d.date, litres: d.litres }));
}

export function computeAvgYieldPerAnimal(milkToday: number, lactatingCount: number): number {
  if (lactatingCount <= 0) return 0;
  return Math.round((milkToday / lactatingCount) * 10) / 10;
}

export function computeBreedProductivity(
  entries: MilkProductionEntry[],
  animals: Animal[],
  fromDate: string,
  toDate: string
): { breed: Breed; avgYield: number }[] {
  const herdToBreed: Record<HerdGroup, Breed> = {
    "Gir Herd": "Gir",
    "Sahiwal Herd": "Sahiwal",
    "Holstein Friesian Herd": "Holstein Friesian",
    "Murrah Buffalo Herd": "Murrah Buffalo",
    "Jersey Herd": "Jersey",
  };
  const inRange = entries.filter((e) => e.date >= fromDate && e.date <= toDate);
  return HERD_GROUPS.map((herd) => {
    const breed = herdToBreed[herd];
    const herdEntries = inRange.filter((e) => e.herdGroup === herd);
    const days = new Set(herdEntries.map((e) => e.date)).size || 1;
    const total = herdEntries.reduce((sum, e) => sum + e.morningYield + e.eveningYield, 0);
    // Per-animal average uses the actual count of lactating animals of this breed from
    // Herd & Health, so this ties directly to real herd records rather than a guessed size.
    const herdSize = Math.max(1, animals.filter((a) => a.breed === breed && a.lactationStatus === "Lactating").length);
    const avgYield = total / days / herdSize;
    return { breed, avgYield: Math.round(avgYield * 10) / 10 };
  });
}

export function computeYieldDeclines(animals: Animal[]): { animal: Animal; changePercent: number }[] {
  const results: { animal: Animal; changePercent: number }[] = [];
  for (const a of animals) {
    if (a.recentYield.length < 2) continue;
    const first = a.recentYield[0].litres;
    const last = a.recentYield[a.recentYield.length - 1].litres;
    if (first <= 0) continue;
    const changePercent = Math.round(((last - first) / first) * 1000) / 10;
    if (changePercent <= -10) results.push({ animal: a, changePercent });
  }
  return results.sort((a, b) => a.changePercent - b.changePercent);
}

// ---------- Inventory ----------

export function computeInventoryStatus(item: Pick<InventoryItem, "currentStock" | "minRequired" | "expiryDate">): InventoryStatus {
  if (item.currentStock <= 0) return "Out of Stock";
  if (item.currentStock <= item.minRequired) return "Low Stock";
  if (item.expiryDate) {
    const days = daysUntil(item.expiryDate);
    if (days !== null && days >= 0 && days <= 30) return "Expiring Soon";
  }
  return "In Stock";
}

export function computeInventoryAttentionCount(items: InventoryItem[]): number {
  return items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock" || i.status === "Expiring Soon").length;
}

export function computeInventoryConsumption(
  transactions: InventoryTransaction[],
  items: InventoryItem[],
  fromDate: string,
  toDate: string
): { category: string; quantity: number }[] {
  const inRange = transactions.filter(
    (t) => t.date >= fromDate && t.date <= toDate && (t.type === "Consumed" || t.type === "Wastage" || t.type === "Expired")
  );
  const byCategory = new Map<string, number>();
  for (const t of inRange) {
    const item = items.find((i) => i.id === t.itemId);
    if (!item) continue;
    byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + t.quantity);
  }
  return Array.from(byCategory.entries()).map(([category, quantity]) => ({ category, quantity }));
}

// ---------- Leads ----------

export function computeActiveLeadsCount(leads: Lead[]): number {
  return leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
}

export function computePipelineValue(leads: Lead[]): number {
  return leads.filter((l) => l.stage !== "Lost").reduce((sum, l) => sum + l.estimatedMonthlyValue, 0);
}

export function computeFollowUpsDue(leads: Lead[]): number {
  return leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost" && l.nextFollowUp && isPastOrToday(l.nextFollowUp)).length;
}

export function computeRequiredLitresPerDay(leads: Lead[]): number {
  return leads.filter((l) => l.stage !== "Lost").reduce((sum, l) => sum + l.requiredQuantity, 0);
}

export function computeLeadConversion(leads: Lead[], fromDate: string, toDate: string) {
  const inRange = leads.filter((l) => l.lastInteraction >= fromDate && l.lastInteraction <= toDate);
  const won = inRange.filter((l) => l.stage === "Won").length;
  const lost = inRange.filter((l) => l.stage === "Lost").length;
  const closed = won + lost;
  return { won, lost, rate: closed > 0 ? Math.round((won / closed) * 100) : 0, engagedCount: inRange.length };
}

// ---------- Available to sell / capacity ----------

export interface CapacitySnapshot {
  milkToday: number;
  reservedForProcessing: number;
  committedToWonLeads: number;
  availableToSell: number;
  advancedStageDemand: number;
  capacityGap: number; // positive = shortfall (demand exceeds supply)
}

export function computeCapacity(milkToday: number, leads: Lead[]): CapacitySnapshot {
  const reservedForProcessing = Math.round(milkToday * 0.12);
  const committedToWonLeads = leads.filter((l) => l.stage === "Won").reduce((sum, l) => sum + l.requiredQuantity, 0);
  const availableToSell = Math.max(0, milkToday - reservedForProcessing - committedToWonLeads);
  const advancedStageDemand = leads
    .filter((l) => l.stage === "Proposal Sent" || l.stage === "Negotiation")
    .reduce((sum, l) => sum + l.requiredQuantity, 0);
  return {
    milkToday,
    reservedForProcessing,
    committedToWonLeads,
    availableToSell,
    advancedStageDemand,
    capacityGap: advancedStageDemand - availableToSell,
  };
}

// ---------- Alerts (derived, not stored) ----------

let alertCounter = 0;
function nextAlertId() {
  alertCounter += 1;
  return `AL-${alertCounter}`;
}

export function computeAlerts(state: AppState): Alert[] {
  alertCounter = 0;
  const alerts: Alert[] = [];

  for (const a of state.animals) {
    const daysToCheckup = daysUntil(a.nextCheckup);
    if (daysToCheckup !== null && daysToCheckup >= 0 && daysToCheckup <= 2) {
      alerts.push({
        id: nextAlertId(),
        severity: daysToCheckup === 0 ? "critical" : "warning",
        kind: "vaccination-due",
        message: `Cattle ID ${a.id} vaccination/check-up due ${daysToCheckup === 0 ? "today" : daysToCheckup === 1 ? "tomorrow" : `in ${daysToCheckup} days`}`,
        module: "Herd & Health",
        timestamp: `${TODAY}T07:30:00`,
        linkedAnimalId: a.id,
      });
    }

    if (a.recentYield.length >= 2) {
      const first = a.recentYield[0].litres;
      const last = a.recentYield[a.recentYield.length - 1].litres;
      if (first > 0) {
        const changePercent = Math.round(((last - first) / first) * 100);
        if (changePercent <= -12) {
          alerts.push({
            id: nextAlertId(),
            severity: changePercent <= -18 ? "critical" : "warning",
            kind: "yield-decline",
            message: `Cattle ID ${a.id} milk yield dropped by ${Math.abs(changePercent)}%`,
            module: "Herd & Health",
            timestamp: `${TODAY}T06:50:00`,
            linkedAnimalId: a.id,
          });
        }
      }
    }

    if (a.healthStatus === "Treatment Required") {
      alerts.push({
        id: nextAlertId(),
        severity: "critical",
        kind: "health-issue",
        message: `Cattle ID ${a.id} requires ongoing veterinary treatment`,
        module: "Herd & Health",
        timestamp: `${TODAY}T06:15:00`,
        linkedAnimalId: a.id,
      });
    }
  }

  for (const item of state.inventory) {
    if (item.status === "Out of Stock") {
      alerts.push({
        id: nextAlertId(),
        severity: "critical",
        kind: "out-of-stock",
        message: `${item.name} is out of stock`,
        module: "Inventory",
        timestamp: `${TODAY}T06:10:00`,
        linkedInventoryId: item.id,
      });
    } else if (item.status === "Low Stock") {
      alerts.push({
        id: nextAlertId(),
        severity: "warning",
        kind: "low-stock",
        message: `${item.name} stock is below minimum level`,
        module: "Inventory",
        timestamp: `${TODAY}T06:12:00`,
        linkedInventoryId: item.id,
      });
    } else if (item.status === "Expiring Soon" && item.expiryDate) {
      const days = daysUntil(item.expiryDate);
      alerts.push({
        id: nextAlertId(),
        severity: "warning",
        kind: "expiring-soon",
        message: `${item.name} expiring in ${days} day${days === 1 ? "" : "s"}`,
        module: "Inventory",
        timestamp: `${TODAY}T18:00:00`,
        linkedInventoryId: item.id,
      });
    }
  }

  for (const lead of state.leads) {
    if (lead.stage === "Won" || lead.stage === "Lost") continue;
    if (lead.nextFollowUp && isPast(lead.nextFollowUp)) {
      alerts.push({
        id: nextAlertId(),
        severity: "info",
        kind: "follow-up-overdue",
        message: `Follow-up overdue for ${lead.businessName}`,
        module: "Leads",
        timestamp: `${TODAY}T16:40:00`,
        linkedLeadId: lead.id,
      });
    }
  }

  const severityRank: Record<Alert["severity"], number> = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}

// ---------- Tasks ----------

export function computeOverdueTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status !== "Completed" && t.dueDate < TODAY);
}

// ---------- Dashboard KPIs (single source of truth) ----------

export interface DashboardKpis {
  totalCattle: number;
  lactatingCattle: number;
  milkToday: number;
  avgYield: number;
  lowStockItems: number;
  activeLeads: number;
  followUpsDue: number;
  weeklyMilkTotal: number;
  pipelineValue: number;
  inventoryAttentionCount: number;
}

export function computeDashboardKpis(state: AppState): DashboardKpis {
  const herd = computeHerdSummary(state.animals);
  const milkToday = computeMilkToday(state.milkEntries);
  const weekly = computeWeeklyTrend(state.milkEntries);
  return {
    totalCattle: herd.total,
    lactatingCattle: herd.lactating,
    milkToday,
    avgYield: computeAvgYieldPerAnimal(milkToday, herd.lactating),
    lowStockItems: state.inventory.filter((i) => i.status === "Low Stock").length,
    activeLeads: computeActiveLeadsCount(state.leads),
    followUpsDue: computeFollowUpsDue(state.leads),
    weeklyMilkTotal: weekly.reduce((sum, d) => sum + d.litres, 0),
    pipelineValue: computePipelineValue(state.leads),
    inventoryAttentionCount: computeInventoryAttentionCount(state.inventory),
  };
}

export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}
