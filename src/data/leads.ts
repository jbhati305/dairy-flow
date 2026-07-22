import type { Lead, LeadStage } from "@/types";

export const leadStages: LeadStage[] = [
  "New Inquiry",
  "Contacted",
  "Visit Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

export const leads: Lead[] = [
  { id: "LD-001", businessName: "Sunrise Dairy Distributors", buyerType: "Distributor", contactPerson: "Vikram Joshi", phone: "+91 98220 11223", requiredQuantity: 400, estimatedMonthlyValue: 168000, lastInteraction: "2026-07-10", nextFollowUp: "2026-07-20", source: "Referral", stage: "Negotiation", notes: "Wants long-term supply contract with fixed pricing. Follow-up overdue." },
  { id: "LD-002", businessName: "Ananya Sweets & Bakes", buyerType: "Sweet Shop", contactPerson: "Ananya Patil", phone: "+91 99870 44521", requiredQuantity: 60, estimatedMonthlyValue: 25200, lastInteraction: "2026-07-18", nextFollowUp: "2026-07-24", source: "Walk-in", stage: "Proposal Sent", notes: "Needs high-fat milk for mawa production." },
  { id: "LD-003", businessName: "The Grand Regal Hotel", buyerType: "Hotel", contactPerson: "Rohit Menon", phone: "+91 98765 33210", requiredQuantity: 150, estimatedMonthlyValue: 63000, lastInteraction: "2026-07-15", nextFollowUp: "2026-07-27", source: "Field Visit", stage: "Visit Scheduled", notes: "Kitchen manager requested quality certification documents." },
  { id: "LD-004", businessName: "Green Meadows Housing Society", buyerType: "Housing Society", contactPerson: "Sunita Rao", phone: "+91 90210 87654", requiredQuantity: 200, estimatedMonthlyValue: 84000, lastInteraction: "2026-07-12", nextFollowUp: "2026-07-22", source: "Website", stage: "Contacted", notes: "Society committee to vote on vendor next week." },
  { id: "LD-005", businessName: "Spice Route Restaurant", buyerType: "Restaurant", contactPerson: "Farhan Sheikh", phone: "+91 91234 56789", requiredQuantity: 40, estimatedMonthlyValue: 16800, lastInteraction: "2026-07-17", nextFollowUp: "2026-07-21", source: "Phone Inquiry", stage: "New Inquiry", notes: "First-time inquiry, requested sample delivery." },
  { id: "LD-006", businessName: "City Fresh Retail Mart", buyerType: "Retailer", contactPerson: "Nikhil Bansal", phone: "+91 99887 12340", requiredQuantity: 300, estimatedMonthlyValue: 126000, lastInteraction: "2026-07-08", nextFollowUp: "2026-07-23", source: "Local Ad", stage: "Contacted", notes: "Comparing quotes with 2 other suppliers." },
  { id: "LD-007", businessName: "Om Sai Milk Distributors", buyerType: "Distributor", contactPerson: "Prakash Iyer", phone: "+91 98220 99887", requiredQuantity: 500, estimatedMonthlyValue: 210000, lastInteraction: "2026-06-30", nextFollowUp: "2026-07-25", source: "Referral", stage: "Won", notes: "Contract signed, deliveries begin Aug 1." },
  { id: "LD-008", businessName: "Heritage Institute Hostel", buyerType: "Institutional Buyer", contactPerson: "Dr. Meenal Kulkarni", phone: "+91 90212 34567", requiredQuantity: 350, estimatedMonthlyValue: 147000, lastInteraction: "2026-07-05", nextFollowUp: "2026-07-28", source: "Field Visit", stage: "Proposal Sent", notes: "Requires FSSAI compliance documentation." },
  { id: "LD-009", businessName: "Blue Orchid Sweets", buyerType: "Sweet Shop", contactPerson: "Deepak Shah", phone: "+91 98192 44112", requiredQuantity: 80, estimatedMonthlyValue: 33600, lastInteraction: "2026-06-20", nextFollowUp: null, source: "Walk-in", stage: "Lost", notes: "Chose a supplier closer to their location." },
  { id: "LD-010", businessName: "Riverside Cafe & Bistro", buyerType: "Restaurant", contactPerson: "Priya Nair", phone: "+91 99001 22334", requiredQuantity: 25, estimatedMonthlyValue: 10500, lastInteraction: "2026-07-19", nextFollowUp: "2026-07-26", source: "Website", stage: "New Inquiry", notes: "Interested in A2 milk for specialty coffee." },
  { id: "LD-011", businessName: "Palm Grove Resort", buyerType: "Hotel", contactPerson: "Arjun Kapoor", phone: "+91 98450 67890", requiredQuantity: 120, estimatedMonthlyValue: 50400, lastInteraction: "2026-07-14", nextFollowUp: "2026-07-25", source: "Referral", stage: "Visit Scheduled", notes: "Site visit scheduled for chef tasting." },
  { id: "LD-012", businessName: "Shree Krishna Retail", buyerType: "Retailer", contactPerson: "Manoj Gupta", phone: "+91 90112 33445", requiredQuantity: 180, estimatedMonthlyValue: 75600, lastInteraction: "2026-07-11", nextFollowUp: "2026-07-22", source: "Local Ad", stage: "Negotiation", notes: "Negotiating volume discount for bulk orders." },
  { id: "LD-013", businessName: "Sunshine Public School Canteen", buyerType: "Institutional Buyer", contactPerson: "Kavita Joshi", phone: "+91 98220 55667", requiredQuantity: 90, estimatedMonthlyValue: 37800, lastInteraction: "2026-07-16", nextFollowUp: "2026-07-29", source: "Phone Inquiry", stage: "Contacted", notes: "Needs delivery before 7 AM daily." },
  { id: "LD-014", businessName: "Lotus Housing Complex", buyerType: "Housing Society", contactPerson: "Ramesh Iyer", phone: "+91 99223 44556", requiredQuantity: 250, estimatedMonthlyValue: 105000, lastInteraction: "2026-07-09", nextFollowUp: "2026-07-23", source: "Field Visit", stage: "Proposal Sent", notes: "Awaiting society AGM approval." },
];

export const activeLeadsCount = leads.filter(
  (l) => l.stage !== "Won" && l.stage !== "Lost"
).length;

export const totalPipelineValue = leads
  .filter((l) => l.stage !== "Lost")
  .reduce((sum, l) => sum + l.estimatedMonthlyValue, 0);
