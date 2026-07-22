import type { Task } from "@/types";

export const tasks: Task[] = [
  { id: "TSK-001", title: "FMD vaccination booster", category: "Vaccination", relatedRecord: "DF-104 · Radha", dueDate: "2026-07-23", priority: "High", status: "Pending" },
  { id: "TSK-002", title: "Veterinary review for yield drop", category: "Veterinary Visit", relatedRecord: "DF-087 · Lakshmi", dueDate: "2026-07-23", priority: "High", status: "Pending" },
  { id: "TSK-003", title: "Mastitis treatment follow-up", category: "Veterinary Visit", relatedRecord: "DF-109 · Saraswati", dueDate: "2026-07-24", priority: "High", status: "In Progress" },
  { id: "TSK-004", title: "Reorder green fodder", category: "Inventory Purchase", relatedRecord: "Green Fodder (Napier)", dueDate: "2026-07-23", priority: "High", status: "Pending" },
  { id: "TSK-005", title: "Order mastitis medicine", category: "Inventory Purchase", relatedRecord: "Mastitis Medicine", dueDate: "2026-07-24", priority: "Medium", status: "Pending" },
  { id: "TSK-006", title: "Follow up on contract terms", category: "Buyer Follow-up", relatedRecord: "Sunrise Dairy Distributors", dueDate: "2026-07-20", priority: "High", status: "Pending" },
  { id: "TSK-007", title: "Send proposal pricing sheet", category: "Buyer Follow-up", relatedRecord: "Ananya Sweets & Bakes", dueDate: "2026-07-24", priority: "Medium", status: "Pending" },
  { id: "TSK-008", title: "Pregnancy checkup", category: "Breeding Follow-up", relatedRecord: "DF-106 · Meera", dueDate: "2026-07-30", priority: "Medium", status: "Pending" },
  { id: "TSK-009", title: "Service milking machine #2", category: "Equipment Maintenance", relatedRecord: "Milking Machine Set", dueDate: "2026-07-26", priority: "Low", status: "Pending" },
  { id: "TSK-010", title: "Replace chaff cutter blades", category: "Equipment Maintenance", relatedRecord: "Chaff Cutter Blades", dueDate: "2026-07-28", priority: "Medium", status: "Pending" },
  { id: "TSK-011", title: "Expected calving preparation", category: "Breeding Follow-up", relatedRecord: "DF-107 · Durga", dueDate: "2026-08-18", priority: "Medium", status: "Pending" },
  { id: "TSK-012", title: "Site visit for hotel supply", category: "Buyer Follow-up", relatedRecord: "The Grand Regal Hotel", dueDate: "2026-07-27", priority: "Medium", status: "Completed" },
  { id: "TSK-013", title: "Routine deworming schedule", category: "Vaccination", relatedRecord: "Herd — Sahiwal Group", dueDate: "2026-08-01", priority: "Low", status: "Pending" },
  { id: "TSK-014", title: "Restock udder disinfectant", category: "Inventory Purchase", relatedRecord: "Udder Disinfectant", dueDate: "2026-07-25", priority: "Low", status: "Completed" },
];
