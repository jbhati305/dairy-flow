import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets, Gauge, Users, IndianRupee, TrendingUp, TrendingDown, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard, MetricStrip } from "@/components/shared/StatCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAppData } from "@/store/AppDataContext";
import {
  computeAvgYieldPerAnimal,
  computeBreedProductivity,
  computeDailyTotals,
  computeHerdSummary,
  computeInventoryAttentionCount,
  computeInventoryConsumption,
  computeLeadConversion,
  computeMilkToday,
  computePipelineValue,
  formatCurrencyCompact,
} from "@/store/selectors";
import { TODAY, addDays, formatDate } from "@/lib/date";
import type { InventoryStatus } from "@/types";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e1dc",
  fontSize: 12,
  boxShadow: "var(--shadow-panel)",
};

const axisTick = { fill: "#7c7a73", fontSize: 12 };

const statusColors: Record<InventoryStatus, string> = {
  "In Stock": "#3a8d58",
  "Low Stock": "#c8811a",
  "Out of Stock": "#c0392b",
  "Expiring Soon": "#3172b6",
};

const PERIODS = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
];

export default function Reports() {
  const { state } = useAppData();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("7");
  const days = Number(period);

  const fromDate = addDays(TODAY, -(days - 1));
  const prevFromDate = addDays(TODAY, -(days * 2 - 1));
  const prevToDate = addDays(fromDate, -1);

  const herd = computeHerdSummary(state.animals);
  const milkToday = computeMilkToday(state.milkEntries);
  const avgYieldPerAnimal = computeAvgYieldPerAnimal(milkToday, herd.lactating);

  const dailyTotals = useMemo(() => computeDailyTotals(state.milkEntries), [state.milkEntries]);
  const periodTrend = useMemo(
    () => dailyTotals.filter((d) => d.date >= fromDate && d.date <= TODAY),
    [dailyTotals, fromDate]
  );
  const totalMilkPeriod = periodTrend.reduce((sum, d) => sum + d.litres, 0);
  const prevPeriodTotal = useMemo(
    () => dailyTotals.filter((d) => d.date >= prevFromDate && d.date <= prevToDate).reduce((sum, d) => sum + d.litres, 0),
    [dailyTotals, prevFromDate, prevToDate]
  );
  const periodChangePercent = prevPeriodTotal > 0 ? Math.round(((totalMilkPeriod - prevPeriodTotal) / prevPeriodTotal) * 1000) / 10 : 0;

  const herdProductivityIndex = Math.round((herd.lactating / herd.total) * 100);

  const leadConversion = useMemo(() => computeLeadConversion(state.leads, fromDate, TODAY), [state.leads, fromDate]);

  const inventoryAttentionCount = computeInventoryAttentionCount(state.inventory);

  const breedProductivity = useMemo(
    () => computeBreedProductivity(state.milkEntries, state.animals, fromDate, TODAY),
    [state.milkEntries, state.animals, fromDate]
  );
  const topBreed = [...breedProductivity].sort((a, b) => b.avgYield - a.avgYield)[0];

  const inventoryByStatus = useMemo(() => {
    const statuses: InventoryStatus[] = ["In Stock", "Low Stock", "Out of Stock", "Expiring Soon"];
    return statuses.map((status) => ({ status, count: state.inventory.filter((i) => i.status === status).length }));
  }, [state.inventory]);

  const inventoryConsumption = useMemo(
    () => computeInventoryConsumption(state.inventoryTransactions, state.inventory, fromDate, TODAY),
    [state.inventoryTransactions, state.inventory, fromDate]
  );
  const topConsumedCategory = [...inventoryConsumption].sort((a, b) => b.quantity - a.quantity)[0];

  const leadFunnelAll = useMemo(() => {
    const stages = ["New Inquiry", "Contacted", "Visit Scheduled", "Proposal Sent", "Negotiation", "Won", "Lost"] as const;
    return stages.map((stage) => ({ stage, count: state.leads.filter((l) => l.stage === stage).length }));
  }, [state.leads]);

  const totalPipelineValue = computePipelineValue(state.leads);

  const overdueFollowUps = state.leads.filter(
    (l) => l.stage !== "Won" && l.stage !== "Lost" && l.nextFollowUp && l.nextFollowUp < TODAY
  ).length;

  const hasClosedLeads = leadConversion.won + leadConversion.lost > 0;

  type InsightKind = "positive" | "risk" | "operational" | "action";
  interface Insight {
    kind: InsightKind;
    text: string;
    action?: { label: string; path: string };
  }

  const insights = useMemo(() => {
    const list: Insight[] = [];
    if (prevPeriodTotal > 0) {
      list.push({
        kind: periodChangePercent >= 0 ? "positive" : "risk",
        text: `Milk production ${periodChangePercent >= 0 ? "increased" : "decreased"} ${Math.abs(periodChangePercent)}% compared with the previous ${days}-day period.`,
        action: { label: "View trend", path: "/milk-production" },
      });
    } else {
      list.push({ kind: "operational", text: `Not enough historical data yet to compare against the previous ${days}-day period.` });
    }
    if (topBreed) {
      list.push({ kind: "positive", text: `${topBreed.breed} animals had the highest average yield (${topBreed.avgYield} L/day) this period.` });
    }
    if (topConsumedCategory) {
      list.push({
        kind: "operational",
        text: `${topConsumedCategory.category} is being consumed fastest — ${topConsumedCategory.quantity} units used this period.`,
        action: { label: "Review inventory", path: "/inventory" },
      });
    }
    if (overdueFollowUps > 0) {
      list.push({
        kind: "action",
        text: `${overdueFollowUps} sales follow-up${overdueFollowUps > 1 ? "s are" : " is"} overdue — reach out before leads go cold.`,
        action: { label: "Open Leads", path: "/leads" },
      });
    }
    if (hasClosedLeads) {
      list.push({ kind: "positive", text: `${leadConversion.rate}% of leads engaged this period converted to Won.` });
    }
    return list.slice(0, 4);
  }, [periodChangePercent, prevPeriodTotal, days, topBreed, topConsumedCategory, overdueFollowUps, hasClosedLeads, leadConversion]);

  const insightStyles: Record<InsightKind, { icon: typeof TrendingUp; classes: string }> = {
    positive: { icon: TrendingUp, classes: "border-brand-100 bg-brand-50/50 text-brand-700" },
    risk: { icon: TrendingDown, classes: "border-red-100 bg-red-50/50 text-red-700" },
    operational: { icon: Sparkles, classes: "border-blue-100 bg-blue-50/50 text-blue-700" },
    action: { icon: AlertTriangle, classes: "border-amber-100 bg-amber-50/50 text-amber-700" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Reports & Analytics</h2>
          <p className="text-sm text-neutral-500">Farm-wide performance across production, herd, inventory, and sales.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`Total Milk (${days}d)`} value={`${totalMilkPeriod.toLocaleString()} L`} icon={Droplets} tone="brand" />
        <StatCard label="Avg. Yield / Animal" value={`${avgYieldPerAnimal} L`} sublabel="Today" icon={Gauge} tone="brand" />
        <StatCard
          label="Lead Conversion"
          value={hasClosedLeads ? `${leadConversion.rate}%` : "No closed leads yet"}
          sublabel={hasClosedLeads ? `${leadConversion.won} won of ${leadConversion.won + leadConversion.lost} closed` : "Nothing to measure this period"}
          icon={Users}
          tone="brand"
        />
        <StatCard label="Pipeline Value" value={formatCurrencyCompact(totalPipelineValue)} sublabel="Active pipeline" icon={IndianRupee} tone="brand" />
      </div>

      <MetricStrip
        items={[
          { label: "herd productivity (lactating share)", value: `${herdProductivityIndex}%` },
          { label: "inventory items need attention", value: inventoryAttentionCount.toString(), tone: inventoryAttentionCount > 0 ? "amber" : "neutral" },
        ]}
      />

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Insights</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => {
            const style = insightStyles[insight.kind];
            const Icon = style.icon;
            return (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${style.classes}`}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{insight.text}</p>
                  {insight.action && (
                    <button
                      onClick={() => navigate(insight.action!.path)}
                      className="mt-1.5 flex items-center gap-1 text-xs font-medium hover:underline"
                    >
                      {insight.action.label}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Milk Production Trend</CardTitle>
            <CardDescription>Daily total across all herds, in litres — last {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportsMilkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a8d58" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#3a8d58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                    tickFormatter={(d) => formatDate(d).slice(0, 6)}
                    minTickGap={24}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={48} domain={["dataMin - 40", "dataMax + 40"]} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(d) => formatDate(String(d))}
                    formatter={(value) => [`${Number(value).toLocaleString()} L`, "Production"]}
                  />
                  <Area type="monotone" dataKey="litres" stroke="#205838" strokeWidth={2} fill="url(#reportsMilkFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Herd Productivity by Breed</CardTitle>
            <CardDescription>Average daily yield per animal, litres — last {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breedProductivity} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} />
                  <YAxis type="category" dataKey="breed" tickLine={false} axisLine={false} tick={axisTick} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} L/day`, "Avg. Yield"]} />
                  <Bar dataKey="avgYield" fill="#205838" radius={[0, 4, 4, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Stock Health</CardTitle>
            <CardDescription>Number of items by stock status (current)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryByStatus} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={32} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} items`, "Count"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {inventoryByStatus.map((entry) => (
                      <Cell key={entry.status} fill={statusColors[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Consumption</CardTitle>
            <CardDescription>Consumed + wastage + expired, by category — last {days} days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryConsumption} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} units`, "Consumed"]} />
                  <Bar dataKey="quantity" fill="#c8811a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Sales Lead Conversion</CardTitle>
            <CardDescription>Current leads by pipeline stage, including closed outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadFunnelAll} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={32} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} leads`, "Count"]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                    {leadFunnelAll.map((entry) => (
                      <Cell key={entry.stage} fill={entry.stage === "Won" ? "#3a8d58" : entry.stage === "Lost" ? "#c0392b" : "#3172b6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
