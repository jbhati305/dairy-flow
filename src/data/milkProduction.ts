import type { MilkProductionEntry, QualityStatus, HerdGroup } from "@/types";
import { HERD_GROUPS } from "@/types";
import { TODAY, addDays } from "@/lib/date";

// Deterministic pseudo-random hash in [0, 1) — same output every run, no Math.random().
function hash(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface HerdBaseline {
  morning: number;
  evening: number;
  fat: number;
  snf: number;
}

// Today's (2026-07-22) exact figures — the anchor for all downstream KPIs.
// Total today = 1758 L across 82 lactating animals ⇒ 21.4 L/animal average.
const BASELINES: Record<HerdGroup, HerdBaseline> = {
  "Gir Herd": { morning: 312, evening: 268, fat: 4.6, snf: 8.7 },
  "Holstein Friesian Herd": { morning: 268, evening: 231, fat: 3.9, snf: 8.5 },
  "Sahiwal Herd": { morning: 158, evening: 134, fat: 4.4, snf: 8.6 },
  "Murrah Buffalo Herd": { morning: 112, evening: 95, fat: 6.8, snf: 9.2 },
  "Jersey Herd": { morning: 98, evening: 82, fat: 5.1, snf: 8.8 },
};

function computeQuality(fatPercent: number, rejectedLitres: number): QualityStatus {
  if (rejectedLitres > 3) return "Rejected";
  if (fatPercent >= 4.5) return "Excellent";
  if (fatPercent >= 4.0) return "Good";
  return "Acceptable";
}

/**
 * Generates `days` of history ending today (inclusive), for all herd groups.
 * Day 0 (today) is exact; earlier days apply a deterministic seasonal wave plus
 * a gentle long-term uptrend (the herd's yield has improved ~8% over 90 days),
 * so "vs previous period" comparisons in Reports are meaningful, not random noise.
 */
function generateHistory(days: number): MilkProductionEntry[] {
  const entries: MilkProductionEntry[] = [];

  HERD_GROUPS.forEach((herd, herdIdx) => {
    const base = BASELINES[herd];
    for (let offset = 0; offset < days; offset++) {
      const date = addDays(TODAY, -offset);
      const dayIdx = offset;

      // Long-term trend: production was ~8% lower 90 days ago than today.
      const trend = 1 - 0.08 * (dayIdx / 90);
      // Short-term wave + deterministic noise for a realistic week-to-week wiggle.
      const wave = 1 + 0.035 * Math.sin(dayIdx / 3.1 + herdIdx) + (hash(dayIdx, herdIdx) - 0.5) * 0.03;
      const factor = dayIdx === 0 ? 1 : trend * wave;

      const morningYield = Math.round(base.morning * factor);
      const eveningYield = Math.round(base.evening * factor);
      const fatPercent = dayIdx === 0 ? base.fat : Math.round((base.fat + (hash(dayIdx, herdIdx + 10) - 0.5) * 0.4) * 10) / 10;
      const snfPercent = dayIdx === 0 ? base.snf : Math.round((base.snf + (hash(dayIdx, herdIdx + 20) - 0.5) * 0.3) * 10) / 10;
      const rejectedRoll = hash(dayIdx, herdIdx + 30);
      const rejectedLitres = dayIdx === 0 ? 0 : rejectedRoll > 0.88 ? Math.round(rejectedRoll * 6) : 0;

      entries.push({
        id: `MP-${date.replace(/-/g, "")}-${herdIdx}`,
        date,
        herdGroup: herd,
        morningYield,
        eveningYield,
        fatPercent,
        snfPercent,
        quality: computeQuality(fatPercent, rejectedLitres),
        rejectedLitres,
      });
    }
  });

  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.herdGroup.localeCompare(b.herdGroup)));
}

// 90 days of history backs the Reports period selector (7 / 30 / 90 days).
export const milkProductionEntries: MilkProductionEntry[] = generateHistory(90);
