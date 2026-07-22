import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "red" | "neutral";
}

const toneClasses: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function StatCard({ label, value, sublabel, icon: Icon, tone = "brand" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-neutral-500">{sublabel}</p>}
    </div>
  );
}
