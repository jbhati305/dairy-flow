// ---------- Farm Records (Cattle) ----------

export type Breed = "Gir" | "Sahiwal" | "Holstein Friesian" | "Jersey" | "Murrah Buffalo";

export type LactationStatus = "Lactating" | "Dry" | "Pregnant" | "Calf";

export type HealthStatus = "Healthy" | "Under Observation" | "Treatment Required";

export type HealthEventType =
  | "Vaccination"
  | "Veterinary Check"
  | "Treatment"
  | "Illness"
  | "Recovery"
  | "Breeding Event";

export interface HealthRecord {
  id: string;
  date: string;
  type: HealthEventType;
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

export const HERD_GROUPS = [
  "Gir Herd",
  "Holstein Friesian Herd",
  "Sahiwal Herd",
  "Murrah Buffalo Herd",
  "Jersey Herd",
] as const;

export type HerdGroup = (typeof HERD_GROUPS)[number];

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

export type InventoryTransactionType = "Stock In" | "Consumed" | "Wastage" | "Expired" | "Correction";

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: InventoryTransactionType;
  quantity: number; // magnitude for In/Consumed/Wastage/Expired; signed delta for Correction
  date: string;
  notes?: string;
  supplier?: string;
  relatedTaskId?: string;
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

export type ProductType = "Cow Milk" | "Buffalo Milk" | "Mixed / Standardized" | "A2 Cow Milk" | "Ghee" | "Paneer";

export type DeliveryTiming = "Early Morning (5–7 AM)" | "Morning (7–9 AM)" | "Evening (5–7 PM)" | "Flexible";

export type TrialOrderStatus = "Not Started" | "Scheduled" | "In Progress" | "Completed" | "Not Applicable";

export interface Lead {
  id: string;
  businessName: string;
  buyerType: BuyerType;
  contactPerson: string;
  phone: string;
  requiredQuantity: number; // litres/day
  productType: ProductType;
  pricePerLitre: number; // ₹ expected price per litre
  estimatedMonthlyValue: number; // derived as requiredQuantity * pricePerLitre * 30, stored for override flexibility
  deliveryLocation: string;
  deliveryDistanceKm: number;
  preferredDeliveryTiming: DeliveryTiming;
  trialOrderStatus: TrialOrderStatus;
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
  linkedAnimalId?: string;
  linkedInventoryId?: string;
  linkedLeadId?: string;
}

// ---------- Alerts & activity (derived / logged) ----------

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertKind =
  | "vaccination-due"
  | "yield-decline"
  | "health-issue"
  | "low-stock"
  | "out-of-stock"
  | "expiring-soon"
  | "follow-up-overdue";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  kind: AlertKind;
  message: string;
  module: string;
  timestamp: string;
  linkedAnimalId?: string;
  linkedInventoryId?: string;
  linkedLeadId?: string;
  linkedTaskId?: string;
}

export interface ActivityItem {
  id: string;
  type: "milk" | "inventory" | "lead" | "vaccination" | "task" | "health";
  message: string;
  timestamp: string;
}

export interface DailyMilkPoint {
  day: string;
  date: string;
  litres: number;
}
