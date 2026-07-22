import type { Alert, ActivityItem } from "@/types";

export const alerts: Alert[] = [
  { id: "AL-001", severity: "warning", message: "Cattle ID DF-104 vaccination due tomorrow", module: "Farm Records", timestamp: "2026-07-22T07:30:00" },
  { id: "AL-002", severity: "critical", message: "Cattle ID DF-087 milk yield dropped by 18%", module: "Farm Records", timestamp: "2026-07-22T06:50:00" },
  { id: "AL-003", severity: "critical", message: "Cattle feed stock below minimum level", module: "Inventory", timestamp: "2026-07-22T06:15:00" },
  { id: "AL-004", severity: "warning", message: "Veterinary medicine expiring in 12 days", module: "Inventory", timestamp: "2026-07-21T18:00:00" },
  { id: "AL-005", severity: "info", message: "Follow-up overdue for Sunrise Dairy Distributors", module: "Leads", timestamp: "2026-07-21T16:40:00" },
  { id: "AL-006", severity: "critical", message: "Cattle ID DF-109 showing signs of mastitis", module: "Farm Records", timestamp: "2026-07-21T14:20:00" },
];

export const recentActivity: ActivityItem[] = [
  { id: "AC-001", type: "milk", message: "Morning milk production logged for Gir Herd — 312 L", timestamp: "2026-07-22T07:15:00" },
  { id: "AC-002", type: "inventory", message: "Inventory stock updated: Concentrated Cattle Feed +200 kg", timestamp: "2026-07-22T06:40:00" },
  { id: "AC-003", type: "lead", message: "New buyer lead added: Riverside Cafe & Bistro", timestamp: "2026-07-21T19:10:00" },
  { id: "AC-004", type: "vaccination", message: "Vaccination completed for DF-106 · Meera (Brucellosis)", timestamp: "2026-07-21T15:30:00" },
  { id: "AC-005", type: "lead", message: "Lead moved to \"Visit Scheduled\": The Grand Regal Hotel", timestamp: "2026-07-21T12:05:00" },
  { id: "AC-006", type: "task", message: "Task completed: Site visit for hotel supply", timestamp: "2026-07-20T17:45:00" },
];

export const kpis = {
  totalCattle: 128,
  lactatingCattle: 82,
  milkToday: 1246,
  avgYield: 15.2,
  lowStockItems: 6,
  activeLeads: 14,
};
