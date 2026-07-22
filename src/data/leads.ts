import type { BuyerType, DeliveryTiming, Lead, LeadStage, ProductType } from "@/types";

export const leadStages: LeadStage[] = [
  "New Inquiry",
  "Contacted",
  "Visit Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];

// ₹ per litre expected, by buyer type — bulk distributors pay less, specialty/food-service pays more.
const PRICE_BY_BUYER_TYPE: Record<BuyerType, number> = {
  Distributor: 13,
  Retailer: 14,
  "Housing Society": 14,
  "Institutional Buyer": 13.5,
  Hotel: 16,
  Restaurant: 15,
  "Sweet Shop": 16,
};

function monthlyValue(requiredQuantity: number, pricePerLitre: number): number {
  return Math.round(requiredQuantity * pricePerLitre * 30);
}

interface SeedLead {
  id: string;
  businessName: string;
  buyerType: BuyerType;
  contactPerson: string;
  phone: string;
  requiredQuantity: number;
  productType: ProductType;
  deliveryLocation: string;
  deliveryDistanceKm: number;
  preferredDeliveryTiming: DeliveryTiming;
  trialOrderStatus: Lead["trialOrderStatus"];
  lastInteraction: string;
  nextFollowUp: string | null;
  source: Lead["source"];
  stage: LeadStage;
  notes: string;
}

const seedLeads: SeedLead[] = [
  { id: "LD-001", businessName: "Sunrise Dairy Distributors", buyerType: "Distributor", contactPerson: "Vikram Joshi", phone: "+91 98220 11223", requiredQuantity: 400, productType: "Mixed / Standardized", deliveryLocation: "Basni Industrial Area, Jodhpur", deliveryDistanceKm: 8, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Completed", lastInteraction: "2026-07-10", nextFollowUp: "2026-07-20", source: "Referral", stage: "Negotiation", notes: "Wants long-term supply contract with fixed pricing. Follow-up overdue." },
  { id: "LD-002", businessName: "Ananya Sweets & Bakes", buyerType: "Sweet Shop", contactPerson: "Ananya Patil", phone: "+91 99870 44521", requiredQuantity: 60, productType: "Buffalo Milk", deliveryLocation: "Sardarpura, Jodhpur", deliveryDistanceKm: 5, preferredDeliveryTiming: "Morning (7–9 AM)", trialOrderStatus: "Completed", lastInteraction: "2026-07-18", nextFollowUp: "2026-07-24", source: "Walk-in", stage: "Proposal Sent", notes: "Needs high-fat milk for mawa production." },
  { id: "LD-003", businessName: "The Grand Regal Hotel", buyerType: "Hotel", contactPerson: "Rohit Menon", phone: "+91 98765 33210", requiredQuantity: 150, productType: "Cow Milk", deliveryLocation: "Airport Road, Jodhpur", deliveryDistanceKm: 12, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Scheduled", lastInteraction: "2026-07-15", nextFollowUp: "2026-07-27", source: "Field Visit", stage: "Visit Scheduled", notes: "Kitchen manager requested quality certification documents." },
  { id: "LD-004", businessName: "Green Meadows Housing Society", buyerType: "Housing Society", contactPerson: "Sunita Rao", phone: "+91 90210 87654", requiredQuantity: 200, productType: "Mixed / Standardized", deliveryLocation: "Shastri Nagar, Jodhpur", deliveryDistanceKm: 6, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Not Started", lastInteraction: "2026-07-12", nextFollowUp: "2026-07-22", source: "Website", stage: "Contacted", notes: "Society committee to vote on vendor next week." },
  { id: "LD-005", businessName: "Spice Route Restaurant", buyerType: "Restaurant", contactPerson: "Farhan Sheikh", phone: "+91 91234 56789", requiredQuantity: 40, productType: "Cow Milk", deliveryLocation: "Ratanada, Jodhpur", deliveryDistanceKm: 7, preferredDeliveryTiming: "Morning (7–9 AM)", trialOrderStatus: "Not Started", lastInteraction: "2026-07-17", nextFollowUp: "2026-07-21", source: "Phone Inquiry", stage: "New Inquiry", notes: "First-time inquiry, requested sample delivery." },
  { id: "LD-006", businessName: "City Fresh Retail Mart", buyerType: "Retailer", contactPerson: "Nikhil Bansal", phone: "+91 99887 12340", requiredQuantity: 300, productType: "Mixed / Standardized", deliveryLocation: "Paota, Jodhpur", deliveryDistanceKm: 9, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Not Applicable", lastInteraction: "2026-07-08", nextFollowUp: "2026-07-23", source: "Local Ad", stage: "Contacted", notes: "Comparing quotes with 2 other suppliers." },
  { id: "LD-007", businessName: "Om Sai Milk Distributors", buyerType: "Distributor", contactPerson: "Prakash Iyer", phone: "+91 98220 99887", requiredQuantity: 500, productType: "Mixed / Standardized", deliveryLocation: "MIA, Jodhpur", deliveryDistanceKm: 14, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Completed", lastInteraction: "2026-06-30", nextFollowUp: "2026-07-25", source: "Referral", stage: "Won", notes: "Contract signed, deliveries begin Aug 1." },
  { id: "LD-008", businessName: "Heritage Institute Hostel", buyerType: "Institutional Buyer", contactPerson: "Dr. Meenal Kulkarni", phone: "+91 90212 34567", requiredQuantity: 350, productType: "Cow Milk", deliveryLocation: "University Road, Jodhpur", deliveryDistanceKm: 11, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "In Progress", lastInteraction: "2026-07-05", nextFollowUp: "2026-07-28", source: "Field Visit", stage: "Proposal Sent", notes: "Requires FSSAI compliance documentation." },
  { id: "LD-009", businessName: "Blue Orchid Sweets", buyerType: "Sweet Shop", contactPerson: "Deepak Shah", phone: "+91 98192 44112", requiredQuantity: 80, productType: "Buffalo Milk", deliveryLocation: "Nai Sarak, Jodhpur", deliveryDistanceKm: 4, preferredDeliveryTiming: "Morning (7–9 AM)", trialOrderStatus: "Completed", lastInteraction: "2026-06-20", nextFollowUp: null, source: "Walk-in", stage: "Lost", notes: "Chose a supplier closer to their location." },
  { id: "LD-010", businessName: "Riverside Cafe & Bistro", buyerType: "Restaurant", contactPerson: "Priya Nair", phone: "+91 99001 22334", requiredQuantity: 25, productType: "A2 Cow Milk", deliveryLocation: "Shastri Circle, Jodhpur", deliveryDistanceKm: 6, preferredDeliveryTiming: "Flexible", trialOrderStatus: "Not Started", lastInteraction: "2026-07-19", nextFollowUp: "2026-07-26", source: "Website", stage: "New Inquiry", notes: "Interested in A2 milk for specialty coffee." },
  { id: "LD-011", businessName: "Palm Grove Resort", buyerType: "Hotel", contactPerson: "Arjun Kapoor", phone: "+91 98450 67890", requiredQuantity: 120, productType: "Cow Milk", deliveryLocation: "Mandore, Jodhpur", deliveryDistanceKm: 16, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Scheduled", lastInteraction: "2026-07-14", nextFollowUp: "2026-07-25", source: "Referral", stage: "Visit Scheduled", notes: "Site visit scheduled for chef tasting." },
  { id: "LD-012", businessName: "Shree Krishna Retail", buyerType: "Retailer", contactPerson: "Manoj Gupta", phone: "+91 90112 33445", requiredQuantity: 180, productType: "Mixed / Standardized", deliveryLocation: "Chopasni Road, Jodhpur", deliveryDistanceKm: 5, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Not Applicable", lastInteraction: "2026-07-11", nextFollowUp: "2026-07-22", source: "Local Ad", stage: "Negotiation", notes: "Negotiating volume discount for bulk orders." },
  { id: "LD-013", businessName: "Sunshine Public School Canteen", buyerType: "Institutional Buyer", contactPerson: "Kavita Joshi", phone: "+91 98220 55667", requiredQuantity: 90, productType: "Cow Milk", deliveryLocation: "Sardarpura, Jodhpur", deliveryDistanceKm: 5, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Not Started", lastInteraction: "2026-07-16", nextFollowUp: "2026-07-29", source: "Phone Inquiry", stage: "Contacted", notes: "Needs delivery before 7 AM daily." },
  { id: "LD-014", businessName: "Lotus Housing Complex", buyerType: "Housing Society", contactPerson: "Ramesh Iyer", phone: "+91 99223 44556", requiredQuantity: 250, productType: "Mixed / Standardized", deliveryLocation: "Pal Road, Jodhpur", deliveryDistanceKm: 10, preferredDeliveryTiming: "Early Morning (5–7 AM)", trialOrderStatus: "Not Started", lastInteraction: "2026-07-09", nextFollowUp: "2026-07-23", source: "Field Visit", stage: "Proposal Sent", notes: "Awaiting society AGM approval." },
];

export const leads: Lead[] = seedLeads.map((l) => {
  const pricePerLitre = PRICE_BY_BUYER_TYPE[l.buyerType];
  return {
    ...l,
    pricePerLitre,
    estimatedMonthlyValue: monthlyValue(l.requiredQuantity, pricePerLitre),
  };
});
