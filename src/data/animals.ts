import type { Animal } from "@/types";
import { TODAY, addDays } from "@/lib/date";

const swatches = ["#8bc99e", "#c8811a", "#a3a099", "#3a8d58", "#7c7a73", "#59ab75"];

export const animals: Animal[] = [
  {
    id: "DF-101",
    name: "Ganga",
    breed: "Gir",
    ageYears: 5,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 18.5,
    healthStatus: "Healthy",
    lastVaccination: "2026-05-12",
    nextCheckup: "2026-08-02",
    photoColor: swatches[0],
    breedingInfo: { lastCalvingDate: "2025-11-02", calvingCount: 2 },
    healthHistory: [
      { id: "HE-101-1", date: "2026-06-01", type: "Veterinary Check", note: "Routine checkup, normal vitals", vet: "Dr. Anjali Kulkarni" },
      { id: "HE-101-2", date: "2026-03-14", type: "Treatment", note: "Minor foot infection treated", vet: "Dr. Anjali Kulkarni" },
    ],
    vaccinationHistory: [
      { date: "2026-05-12", vaccine: "FMD Vaccine", nextDue: "2026-11-12" },
      { date: "2025-11-10", vaccine: "Brucellosis", nextDue: "2028-11-10" },
    ],
    recentYield: [
      { date: "Mon", litres: 18.1 }, { date: "Tue", litres: 18.4 }, { date: "Wed", litres: 18.6 },
      { date: "Thu", litres: 18.2 }, { date: "Fri", litres: 18.9 }, { date: "Sat", litres: 18.5 }, { date: "Sun", litres: 18.5 },
    ],
    notes: "Consistent high yielder. Prefers morning milking first in sequence.",
  },
  {
    id: "DF-102",
    name: "Yamuna",
    breed: "Sahiwal",
    ageYears: 4,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 14.2,
    healthStatus: "Healthy",
    lastVaccination: "2026-04-20",
    nextCheckup: "2026-07-28",
    photoColor: swatches[1],
    breedingInfo: { lastCalvingDate: "2026-01-15", calvingCount: 1 },
    healthHistory: [{ id: "HE-102-1", date: "2026-05-20", type: "Veterinary Check", note: "Routine checkup, normal vitals", vet: "Dr. Anjali Kulkarni" }],
    vaccinationHistory: [{ date: "2026-04-20", vaccine: "HS Vaccine", nextDue: "2026-10-20" }],
    recentYield: [
      { date: "Mon", litres: 13.8 }, { date: "Tue", litres: 14.0 }, { date: "Wed", litres: 14.5 },
      { date: "Thu", litres: 14.1 }, { date: "Fri", litres: 14.3 }, { date: "Sat", litres: 14.4 }, { date: "Sun", litres: 14.2 },
    ],
    notes: "First lactation. Good temperament, low stress during milking.",
  },
  {
    id: "DF-103",
    name: "Kaveri",
    breed: "Holstein Friesian",
    ageYears: 6,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 24.8,
    healthStatus: "Healthy",
    lastVaccination: "2026-06-02",
    nextCheckup: "2026-08-15",
    photoColor: swatches[2],
    breedingInfo: { lastCalvingDate: "2025-12-20", calvingCount: 3 },
    healthHistory: [{ id: "HE-103-1", date: "2026-06-10", type: "Veterinary Check", note: "Routine checkup, normal vitals", vet: "Dr. Sameer Deshpande" }],
    vaccinationHistory: [{ date: "2026-06-02", vaccine: "FMD Vaccine", nextDue: "2026-12-02" }],
    recentYield: [
      { date: "Mon", litres: 25.1 }, { date: "Tue", litres: 24.8 }, { date: "Wed", litres: 24.6 },
      { date: "Thu", litres: 24.9 }, { date: "Fri", litres: 25.0 }, { date: "Sat", litres: 24.7 }, { date: "Sun", litres: 24.8 },
    ],
    notes: "Top producer on the farm. Requires higher concentrate feed ratio.",
  },
  {
    id: "DF-104",
    name: "Radha",
    breed: "Jersey",
    ageYears: 3,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 12.4,
    healthStatus: "Under Observation",
    lastVaccination: "2025-12-18",
    nextCheckup: "2026-07-23",
    photoColor: swatches[3],
    breedingInfo: { lastCalvingDate: "2026-02-08", calvingCount: 1 },
    healthHistory: [
      { id: "HE-104-1", date: "2026-07-10", type: "Illness", note: "Mild lethargy observed, under monitoring", vet: "Dr. Anjali Kulkarni" },
    ],
    vaccinationHistory: [{ date: "2025-12-18", vaccine: "FMD Vaccine", nextDue: "2026-06-18" }],
    recentYield: [
      { date: "Mon", litres: 12.8 }, { date: "Tue", litres: 12.6 }, { date: "Wed", litres: 12.5 },
      { date: "Thu", litres: 12.3 }, { date: "Fri", litres: 12.2 }, { date: "Sat", litres: 12.4 }, { date: "Sun", litres: 12.4 },
    ],
    notes: "Vaccination due tomorrow (FMD booster). Flagged for vet visit.",
  },
  {
    id: "DF-105",
    name: "Chandni",
    breed: "Murrah Buffalo",
    ageYears: 7,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 10.6,
    healthStatus: "Healthy",
    lastVaccination: "2026-03-30",
    nextCheckup: "2026-09-01",
    photoColor: swatches[4],
    breedingInfo: { lastCalvingDate: "2025-10-05", calvingCount: 4 },
    healthHistory: [{ id: "HE-105-1", date: "2026-04-02", type: "Veterinary Check", note: "Routine checkup, normal vitals", vet: "Dr. Sameer Deshpande" }],
    vaccinationHistory: [{ date: "2026-03-30", vaccine: "HS Vaccine", nextDue: "2026-09-30" }],
    recentYield: [
      { date: "Mon", litres: 10.8 }, { date: "Tue", litres: 10.5 }, { date: "Wed", litres: 10.7 },
      { date: "Thu", litres: 10.6 }, { date: "Fri", litres: 10.4 }, { date: "Sat", litres: 10.6 }, { date: "Sun", litres: 10.6 },
    ],
    notes: "High fat content milk, prioritized for ghee production.",
  },
  {
    id: "DF-087",
    name: "Lakshmi",
    breed: "Gir",
    ageYears: 6,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 13.1,
    healthStatus: "Under Observation",
    lastVaccination: "2026-02-14",
    nextCheckup: "2026-07-25",
    photoColor: swatches[5],
    breedingInfo: { lastCalvingDate: "2025-09-18", calvingCount: 3 },
    healthHistory: [
      { id: "HE-087-1", date: "2026-07-15", type: "Illness", note: "Yield dropped 18% over 5 days, feed intake reduced", vet: "Dr. Anjali Kulkarni" },
    ],
    vaccinationHistory: [{ date: "2026-02-14", vaccine: "FMD Vaccine", nextDue: "2026-08-14" }],
    recentYield: [
      { date: "Mon", litres: 16.0 }, { date: "Tue", litres: 15.2 }, { date: "Wed", litres: 14.1 },
      { date: "Thu", litres: 13.6 }, { date: "Fri", litres: 13.4 }, { date: "Sat", litres: 13.2 }, { date: "Sun", litres: 13.1 },
    ],
    notes: "Milk yield dropped 18% this week — flagged for veterinary review.",
  },
  {
    id: "DF-106",
    name: "Meera",
    breed: "Sahiwal",
    ageYears: 2,
    gender: "Female",
    lactationStatus: "Pregnant",
    currentMilkYield: 0,
    healthStatus: "Healthy",
    lastVaccination: "2026-05-01",
    nextCheckup: "2026-08-10",
    photoColor: swatches[0],
    breedingInfo: { inseminationDate: "2026-04-01", expectedCalvingDate: "2027-01-10", calvingCount: 0 },
    healthHistory: [{ id: "HE-106-1", date: "2026-05-01", type: "Breeding Event", note: "Pregnancy confirmed via ultrasound", vet: "Dr. Sameer Deshpande" }],
    vaccinationHistory: [{ date: "2026-05-01", vaccine: "Brucellosis", nextDue: "2029-05-01" }],
    recentYield: [],
    notes: "First pregnancy. Expected calving Jan 2027.",
  },
  {
    id: "DF-107",
    name: "Durga",
    breed: "Holstein Friesian",
    ageYears: 8,
    gender: "Female",
    lactationStatus: "Dry",
    currentMilkYield: 0,
    healthStatus: "Healthy",
    lastVaccination: "2026-01-22",
    nextCheckup: "2026-08-05",
    photoColor: swatches[1],
    breedingInfo: { lastCalvingDate: "2025-06-14", expectedCalvingDate: "2026-08-20", calvingCount: 5 },
    healthHistory: [{ id: "HE-107-1", date: "2026-06-25", type: "Veterinary Check", note: "Dry-off checkup, healthy", vet: "Dr. Anjali Kulkarni" }],
    vaccinationHistory: [{ date: "2026-01-22", vaccine: "FMD Vaccine", nextDue: "2026-07-22" }],
    recentYield: [],
    notes: "Dried off in preparation for upcoming calving.",
  },
  {
    id: "DF-108",
    name: "Parvati",
    breed: "Jersey",
    ageYears: 1,
    gender: "Female",
    lactationStatus: "Calf",
    currentMilkYield: 0,
    healthStatus: "Healthy",
    lastVaccination: "2026-06-15",
    nextCheckup: "2026-09-15",
    photoColor: swatches[2],
    breedingInfo: { calvingCount: 0 },
    healthHistory: [],
    vaccinationHistory: [{ date: "2026-06-15", vaccine: "Calf Booster", nextDue: "2026-12-15" }],
    recentYield: [],
    notes: "Growing well, on schedule for weaning by month end.",
  },
  {
    id: "DF-109",
    name: "Saraswati",
    breed: "Murrah Buffalo",
    ageYears: 5,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 11.8,
    healthStatus: "Treatment Required",
    lastVaccination: "2026-04-05",
    nextCheckup: "2026-07-24",
    photoColor: swatches[3],
    breedingInfo: { lastCalvingDate: "2025-12-01", calvingCount: 2 },
    healthHistory: [
      { id: "HE-109-1", date: "2026-07-18", type: "Illness", note: "Signs of mastitis detected in rear left quarter", vet: "Dr. Anjali Kulkarni" },
    ],
    vaccinationHistory: [{ date: "2026-04-05", vaccine: "HS Vaccine", nextDue: "2026-10-05" }],
    recentYield: [
      { date: "Mon", litres: 13.5 }, { date: "Tue", litres: 13.0 }, { date: "Wed", litres: 12.6 },
      { date: "Thu", litres: 12.2 }, { date: "Fri", litres: 11.9 }, { date: "Sat", litres: 11.8 }, { date: "Sun", litres: 11.8 },
    ],
    notes: "Under mastitis treatment course, milk withheld from bulk supply.",
  },
  {
    id: "DF-110",
    name: "Ambika",
    breed: "Gir",
    ageYears: 4,
    gender: "Female",
    lactationStatus: "Lactating",
    currentMilkYield: 16.9,
    healthStatus: "Healthy",
    lastVaccination: "2026-05-28",
    nextCheckup: "2026-08-20",
    photoColor: swatches[4],
    breedingInfo: { lastCalvingDate: "2026-01-30", calvingCount: 2 },
    healthHistory: [{ id: "HE-110-1", date: "2026-06-01", type: "Veterinary Check", note: "Routine checkup, normal vitals", vet: "Dr. Sameer Deshpande" }],
    vaccinationHistory: [{ date: "2026-05-28", vaccine: "FMD Vaccine", nextDue: "2026-11-28" }],
    recentYield: [
      { date: "Mon", litres: 16.5 }, { date: "Tue", litres: 16.7 }, { date: "Wed", litres: 17.0 },
      { date: "Thu", litres: 16.8 }, { date: "Fri", litres: 17.1 }, { date: "Sat", litres: 16.9 }, { date: "Sun", litres: 16.9 },
    ],
    notes: "Steady performer, no health concerns.",
  },
  {
    id: "DF-111",
    name: "Ganesh",
    breed: "Murrah Buffalo",
    ageYears: 2,
    gender: "Male",
    lactationStatus: "Calf",
    currentMilkYield: 0,
    healthStatus: "Healthy",
    lastVaccination: "2026-06-20",
    nextCheckup: "2026-09-20",
    photoColor: swatches[5],
    breedingInfo: { calvingCount: 0 },
    healthHistory: [],
    vaccinationHistory: [{ date: "2026-06-20", vaccine: "Calf Booster", nextDue: "2026-12-20" }],
    recentYield: [],
    notes: "Breeding bull candidate, monitored growth chart.",
  },
];

// Generate 116 additional animals so the herd totals exactly 128 (12 hand-authored + 116 generated),
// with exact index ranges (not modulo cycling) so the herd breakdown lands precisely on our data
// story: 82 lactating, 14 dry, 16 pregnant, 12 calves, 4 under treatment.
// Hand-authored animals already contribute: 7 lactating, 1 dry, 1 pregnant, 2 calves, 1 under treatment.
// So the generated pool must contribute: 75 lactating, 13 dry, 15 pregnant, 10 calves, 3 under treatment
// (the 3 "under treatment" are drawn from the lactating pool, since sickness mostly affects milkers).
const breeds: Animal["breed"][] = ["Gir", "Sahiwal", "Holstein Friesian", "Jersey", "Murrah Buffalo"];
const names = [
  "Tulsi", "Gauri", "Kamala", "Sita", "Rukmini", "Savitri", "Anjali", "Nandini", "Kaveri Jr", "Shanti",
  "Vasudha", "Padma", "Indira", "Devi", "Champa", "Malti", "Sundari", "Kiran", "Bijli", "Chameli",
  "Rani", "Motia", "Sona", "Chandra", "Pooja", "Kesar", "Manisha", "Roopa", "Usha", "Vidya",
];

const GENERATED_COUNT = 116;
const LACTATING_END = 75; // i: 0-74
const DRY_END = LACTATING_END + 13; // i: 75-87
const PREGNANT_END = DRY_END + 15; // i: 88-102
const CALF_END = PREGNANT_END + 10; // i: 103-112
// i: 113-115 -> lactating + under treatment (3 animals)

function seedAnimal(i: number): Animal {
  const breed = breeds[i % breeds.length];
  let lactationStatus: Animal["lactationStatus"];
  let healthStatus: Animal["healthStatus"] = "Healthy";

  if (i < LACTATING_END) {
    lactationStatus = "Lactating";
    healthStatus = i % 15 === 7 ? "Under Observation" : "Healthy";
  } else if (i < DRY_END) {
    lactationStatus = "Dry";
  } else if (i < PREGNANT_END) {
    lactationStatus = "Pregnant";
  } else if (i < CALF_END) {
    lactationStatus = "Calf";
  } else {
    lactationStatus = "Lactating";
    healthStatus = "Treatment Required";
  }

  const isLactating = lactationStatus === "Lactating";
  const baseYield = breed === "Holstein Friesian" ? 22 : breed === "Gir" ? 16 : breed === "Sahiwal" ? 13 : breed === "Jersey" ? 12 : 10;
  const yieldVariance = ((i * 37) % 10) - 5;
  const sickPenalty = healthStatus === "Treatment Required" ? 0.65 : 1;
  const currentMilkYield = isLactating ? Math.max(6, (baseYield + yieldVariance * 0.4) * sickPenalty) : 0;
  const id = `DF-${112 + i}`;

  return {
    id,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""),
    breed,
    ageYears: 2 + (i % 7),
    gender: "Female",
    lactationStatus,
    currentMilkYield: Math.round(currentMilkYield * 10) / 10,
    healthStatus,
    lastVaccination: "2026-0" + (3 + (i % 4)) + "-1" + (i % 9) + "",
    // Spread 10-99 days out so only the hand-authored animals above show as "due soon" —
    // otherwise the modulo pattern here would cluster many generated check-ups near today.
    nextCheckup: addDays(TODAY, 10 + ((i * 17) % 90)),
    photoColor: swatches[i % swatches.length],
    breedingInfo: { calvingCount: i % 4 },
    healthHistory: [],
    vaccinationHistory: [],
    recentYield: isLactating
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, idx) => ({
          date: d,
          litres: Math.round((currentMilkYield + (((i + idx) % 3) - 1) * 0.3) * 10) / 10,
        }))
      : [],
    notes: healthStatus === "Treatment Required" ? "Under veterinary treatment course." : "No additional notes on file.",
  };
}

export const allAnimals: Animal[] = [
  ...animals,
  ...Array.from({ length: GENERATED_COUNT }, (_, i) => seedAnimal(i)),
];
