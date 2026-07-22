import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "brand" | "amber" | "red" | "neutral";
  onClick?: () => void;
}

const toneClasses: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function StatCard({ label, value, sublabel, icon: Icon, tone = "brand", onClick }: StatCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]",
        onClick && "text-left transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-neutral-500">{label}</p>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-neutral-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-neutral-500">{sublabel}</p>}
    </Comp>
  );
}

interface MetricStripItem {
  label: string;
  value: string;
  tone?: "brand" | "amber" | "red" | "neutral";
}

const stripToneClasses: Record<string, string> = {
  brand: "text-neutral-900",
  amber: "text-amber-700",
  red: "text-red-700",
  neutral: "text-neutral-900",
};

export function MetricStrip({ items }: { items: MetricStripItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-[var(--shadow-card)]">
      {items.map((item, i) => (
        <div key={item.label} className={cn("flex items-baseline gap-1.5", i > 0 && "border-l border-neutral-100 pl-6")}>
          <span className={cn("text-sm font-semibold", stripToneClasses[item.tone ?? "brand"])}>{item.value}</span>
          <span className="text-xs text-neutral-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
