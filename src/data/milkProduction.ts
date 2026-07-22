import type { MilkProductionEntry, DailyMilkPoint } from "@/types";

export const weeklyMilkTrend: DailyMilkPoint[] = [
  { day: "Mon", litres: 1198 },
  { day: "Tue", litres: 1215 },
  { day: "Wed", litres: 1174 },
  { day: "Thu", litres: 1232 },
  { day: "Fri", litres: 1189 },
  { day: "Sat", litres: 1256 },
  { day: "Sun", litres: 1246 },
];

export const milkProductionEntries: MilkProductionEntry[] = [
  { id: "MP-2201", date: "2026-07-22", herdGroup: "Gir Herd", morningYield: 312, eveningYield: 268, fatPercent: 4.6, snfPercent: 8.7, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2202", date: "2026-07-22", herdGroup: "Holstein Friesian Herd", morningYield: 268, eveningYield: 231, fatPercent: 3.9, snfPercent: 8.5, quality: "Good", rejectedLitres: 0 },
  { id: "MP-2203", date: "2026-07-22", herdGroup: "Sahiwal Herd", morningYield: 158, eveningYield: 134, fatPercent: 4.4, snfPercent: 8.6, quality: "Good", rejectedLitres: 2 },
  { id: "MP-2204", date: "2026-07-22", herdGroup: "Murrah Buffalo Herd", morningYield: 112, eveningYield: 95, fatPercent: 6.8, snfPercent: 9.2, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2205", date: "2026-07-22", herdGroup: "Jersey Herd", morningYield: 98, eveningYield: 82, fatPercent: 5.1, snfPercent: 8.8, quality: "Good", rejectedLitres: 0 },
  { id: "MP-2101", date: "2026-07-21", herdGroup: "Gir Herd", morningYield: 305, eveningYield: 263, fatPercent: 4.5, snfPercent: 8.6, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2102", date: "2026-07-21", herdGroup: "Holstein Friesian Herd", morningYield: 271, eveningYield: 235, fatPercent: 3.8, snfPercent: 8.4, quality: "Good", rejectedLitres: 4 },
  { id: "MP-2103", date: "2026-07-21", herdGroup: "Sahiwal Herd", morningYield: 154, eveningYield: 130, fatPercent: 4.3, snfPercent: 8.5, quality: "Good", rejectedLitres: 0 },
  { id: "MP-2104", date: "2026-07-21", herdGroup: "Murrah Buffalo Herd", morningYield: 108, eveningYield: 91, fatPercent: 6.7, snfPercent: 9.1, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2105", date: "2026-07-21", herdGroup: "Jersey Herd", morningYield: 95, eveningYield: 79, fatPercent: 5.0, snfPercent: 8.7, quality: "Acceptable", rejectedLitres: 3 },
  { id: "MP-2001", date: "2026-07-20", herdGroup: "Gir Herd", morningYield: 298, eveningYield: 260, fatPercent: 4.5, snfPercent: 8.6, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2002", date: "2026-07-20", herdGroup: "Holstein Friesian Herd", morningYield: 275, eveningYield: 240, fatPercent: 3.9, snfPercent: 8.5, quality: "Good", rejectedLitres: 0 },
  { id: "MP-2003", date: "2026-07-20", herdGroup: "Sahiwal Herd", morningYield: 150, eveningYield: 128, fatPercent: 4.4, snfPercent: 8.6, quality: "Good", rejectedLitres: 0 },
  { id: "MP-2004", date: "2026-07-20", herdGroup: "Murrah Buffalo Herd", morningYield: 110, eveningYield: 93, fatPercent: 6.8, snfPercent: 9.2, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-2005", date: "2026-07-20", herdGroup: "Jersey Herd", morningYield: 96, eveningYield: 80, fatPercent: 5.0, snfPercent: 8.8, quality: "Good", rejectedLitres: 0 },
  { id: "MP-1901", date: "2026-07-19", herdGroup: "Gir Herd", morningYield: 302, eveningYield: 258, fatPercent: 4.4, snfPercent: 8.5, quality: "Good", rejectedLitres: 0 },
  { id: "MP-1902", date: "2026-07-19", herdGroup: "Holstein Friesian Herd", morningYield: 260, eveningYield: 228, fatPercent: 3.8, snfPercent: 8.4, quality: "Good", rejectedLitres: 5 },
  { id: "MP-1903", date: "2026-07-19", herdGroup: "Murrah Buffalo Herd", morningYield: 105, eveningYield: 90, fatPercent: 6.6, snfPercent: 9.0, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-1801", date: "2026-07-18", herdGroup: "Gir Herd", morningYield: 295, eveningYield: 252, fatPercent: 4.5, snfPercent: 8.6, quality: "Excellent", rejectedLitres: 0 },
  { id: "MP-1802", date: "2026-07-18", herdGroup: "Sahiwal Herd", morningYield: 148, eveningYield: 125, fatPercent: 4.3, snfPercent: 8.5, quality: "Acceptable", rejectedLitres: 6 },
];

export const productionQualityMetrics = {
  avgFat: 4.9,
  avgSnf: 8.7,
  rejectedToday: 2,
  rejectedPercent: 0.16,
};
