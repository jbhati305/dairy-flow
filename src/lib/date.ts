export const TODAY = "2026-07-22";

function toUtcMidnight(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((toUtcMidnight(toIso) - toUtcMidnight(fromIso)) / (1000 * 60 * 60 * 24));
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isPastOrToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return iso <= TODAY;
}

export function isPast(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return iso < TODAY;
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return daysBetween(TODAY, iso);
}
