import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: "brand" | "amber" | "red" | "neutral";
  onClick?: () => void;
}

const toneText: Record<string, string> = {
  brand: "text-brand-600",
  amber: "text-amber-600",
  red: "text-red-600",
  neutral: "text-neutral-400",
};

export function StatCard({ label, value, sublabel, icon: Icon, tone = "neutral", onClick }: StatCardProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "rounded-xl border border-neutral-200 bg-white px-4 py-3.5",
        onClick && "text-left transition-colors hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={cn("h-3.5 w-3.5", toneText[tone])} />}
        <p className="text-[13px] text-neutral-500">{label}</p>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900">{value}</p>
        {sublabel && <p className={cn("text-xs", tone === "neutral" ? "text-neutral-400" : toneText[tone])}>{sublabel}</p>}
      </div>
    </Comp>
  );
}

interface MetricStripItem {
  label: string;
  value: string;
  tone?: "brand" | "amber" | "red" | "neutral";
}

const stripToneClasses: Record<string, string> = {
  brand: "text-brand-700",
  amber: "text-amber-700",
  red: "text-red-700",
  neutral: "text-neutral-900",
};

export function MetricStrip({ items }: { items: MetricStripItem[] }) {
  return (
    <p className="text-sm text-neutral-500">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-2 text-neutral-300">·</span>}
          <span className={cn("font-medium", stripToneClasses[item.tone ?? "neutral"])}>{item.value}</span>{" "}
          {item.label}
        </span>
      ))}
    </p>
  );
}
