// ---------- Farm Records (Cattle) ----------

export type Breed = "Gir" | "Sahiwal" | "Holstein Friesian" | "Jersey" | "Murrah Buffalo";

export type LactationStatus = "Lactating" | "Dry" | "Pregnant" | "Calf";

export type HealthStatus = "Healthy" | "Under Observation" | "Treatment Required";

export interface HealthRecord {
  date: string;
  note: string;
  vet?: string;
}

export interface VaccinationRecord {
  date: string;
  vaccine: string;
  nextDue?: string;
}

export interface MilkYieldPoint {
  date: string;
  litres: number;
}

export interface Animal {
  id: string; // e.g. DF-101
  name: string;
  breed: Breed;
  ageYears: number;
  gender: "Female" | "Male";
  lactationStatus: LactationStatus;
  currentMilkYield: number; // litres/day
  healthStatus: HealthStatus;
  lastVaccination: string;
  nextCheckup: string;
  photoColor: string; // used for avatar swatch
  breedingInfo: {
    lastCalvingDate?: string;
    expectedCalvingDate?: string;
    inseminationDate?: string;
    calvingCount: number;
  };
  healthHistory: HealthRecord[];
  vaccinationHistory: VaccinationRecord[];
  recentYield: MilkYieldPoint[];
  notes: string;
}

// ---------- Milk Production ----------

export type QualityStatus = "Excellent" | "Good" | "Acceptable" | "Rejected";

export interface MilkProductionEntry {
  id: string;
  date: string;
  herdGroup: string; // e.g. "Gir Herd", "Murrah Buffalo Herd", or animal id
  morningYield: number;
  eveningYield: number;
  fatPercent: number;
  snfPercent: number;
  quality: QualityStatus;
  rejectedLitres: number;
}

// ---------- Inventory ----------

export type InventoryCategory =
  | "Cattle Feed"
  | "Supplements"
  | "Medicines"
  | "Vaccines"
  | "Cleaning Supplies"
  | "Dairy Equipment";

export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Expiring Soon";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  unit: string;
  minRequired: number;
  supplier: string;
  expiryDate: string | null;
  status: InventoryStatus;
}

// ---------- Leads / CRM ----------

export type LeadStage =
  | "New Inquiry"
  | "Contacted"
  | "Visit Scheduled"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadSource =
  | "Referral"
  | "Walk-in"
  | "Phone Inquiry"
  | "Website"
  | "Field Visit"
  | "Local Ad";

export type BuyerType =
  | "Retailer"
  | "Hotel"
  | "Restaurant"
  | "Sweet Shop"
  | "Distributor"
  | "Housing Society"
  | "Institutional Buyer";

export interface Lead {
  id: string;
  businessName: string;
  buyerType: BuyerType;
  contactPerson: string;
  phone: string;
  requiredQuantity: number; // litres/day
  estimatedMonthlyValue: number; // INR
  lastInteraction: string;
  nextFollowUp: string | null;
  source: LeadSource;
  stage: LeadStage;
  notes: string;
}

// ---------- Tasks ----------

export type TaskCategory =
  | "Veterinary Visit"
  | "Vaccination"
  | "Breeding Follow-up"
  | "Inventory Purchase"
  | "Buyer Follow-up"
  | "Equipment Maintenance";

export type TaskPriority = "High" | "Medium" | "Low";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  relatedRecord: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

// ---------- Dashboard ----------

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  module: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: "milk" | "inventory" | "lead" | "vaccination" | "task";
  message: string;
  timestamp: string;
}

export interface DailyMilkPoint {
  day: string;
  litres: number;
}
