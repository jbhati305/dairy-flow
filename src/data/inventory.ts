import type { InventoryItem } from "@/types";

export const inventoryItems: InventoryItem[] = [
  { id: "INV-001", name: "Concentrated Cattle Feed", category: "Cattle Feed", currentStock: 840, unit: "kg", minRequired: 500, supplier: "Krishna Agro Feeds", expiryDate: "2026-11-30", status: "In Stock" },
  { id: "INV-002", name: "Green Fodder (Napier)", category: "Cattle Feed", currentStock: 180, unit: "kg", minRequired: 300, supplier: "Local Farm Co-op", expiryDate: "2026-07-25", status: "Low Stock" },
  { id: "INV-003", name: "Mineral Mixture", category: "Supplements", currentStock: 45, unit: "kg", minRequired: 40, supplier: "VetCare Supplies", expiryDate: "2027-01-15", status: "In Stock" },
  { id: "INV-004", name: "Calcium Supplement", category: "Supplements", currentStock: 12, unit: "kg", minRequired: 20, supplier: "VetCare Supplies", expiryDate: "2026-09-10", status: "Low Stock" },
  { id: "INV-005", name: "Mastitis Medicine", category: "Medicines", currentStock: 8, unit: "vials", minRequired: 15, supplier: "Sharma Veterinary Pharma", expiryDate: "2026-08-03", status: "Low Stock" },
  { id: "INV-006", name: "Deworming Solution", category: "Medicines", currentStock: 22, unit: "bottles", minRequired: 10, supplier: "Sharma Veterinary Pharma", expiryDate: "2026-10-20", status: "In Stock" },
  { id: "INV-007", name: "Antibiotic Injections", category: "Medicines", currentStock: 0, unit: "vials", minRequired: 10, supplier: "Sharma Veterinary Pharma", expiryDate: "2026-06-01", status: "Out of Stock" },
  { id: "INV-008", name: "FMD Vaccine", category: "Vaccines", currentStock: 30, unit: "doses", minRequired: 25, supplier: "National Vet Labs", expiryDate: "2026-08-03", status: "Expiring Soon" },
  { id: "INV-009", name: "HS Vaccine", category: "Vaccines", currentStock: 18, unit: "doses", minRequired: 20, supplier: "National Vet Labs", expiryDate: "2027-02-18", status: "Low Stock" },
  { id: "INV-010", name: "Brucellosis Vaccine", category: "Vaccines", currentStock: 40, unit: "doses", minRequired: 15, supplier: "National Vet Labs", expiryDate: "2027-05-01", status: "In Stock" },
  { id: "INV-011", name: "Milking-Machine Cleaner", category: "Cleaning Supplies", currentStock: 26, unit: "litres", minRequired: 15, supplier: "PureClean Dairy Solutions", expiryDate: null, status: "In Stock" },
  { id: "INV-012", name: "Udder Disinfectant", category: "Cleaning Supplies", currentStock: 9, unit: "litres", minRequired: 10, supplier: "PureClean Dairy Solutions", expiryDate: null, status: "Low Stock" },
  { id: "INV-013", name: "Floor Sanitizer", category: "Cleaning Supplies", currentStock: 34, unit: "litres", minRequired: 12, supplier: "PureClean Dairy Solutions", expiryDate: null, status: "In Stock" },
  { id: "INV-014", name: "Milking Machine Set (Spare)", category: "Dairy Equipment", currentStock: 2, unit: "units", minRequired: 1, supplier: "DeLaval India", expiryDate: null, status: "In Stock" },
  { id: "INV-015", name: "Milk Storage Cans", category: "Dairy Equipment", currentStock: 14, unit: "units", minRequired: 10, supplier: "Steelcraft Dairy Equipment", expiryDate: null, status: "In Stock" },
  { id: "INV-016", name: "Chaff Cutter Blades", category: "Dairy Equipment", currentStock: 1, unit: "units", minRequired: 2, supplier: "Steelcraft Dairy Equipment", expiryDate: null, status: "Low Stock" },
];

export const lowStockCount = inventoryItems.filter((i) => i.status === "Low Stock").length;
