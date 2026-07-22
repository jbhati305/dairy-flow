import { useMemo, useState } from "react";
import {
  Droplets,
  Gauge,
  Users,
  IndianRupee,
  PackageX,
  TrendingUp,
} from "lucide-react";
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
import { StatCard } from "@/components/shared/StatCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { weeklyMilkTrend } from "@/data/milkProduction";
import { allAnimals, herdSummary } from "@/data/animals";
import { inventoryItems } from "@/data/inventory";
import { leads, leadStages, totalPipelineValue } from "@/data/leads";
import type { Breed, InventoryStatus, BuyerType } from "@/types";

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

function formatInr(value: number) {
  return `₹${(value / 1000).toFixed(0)}k`;
}

export default function Reports() {
  const [period, setPeriod] = useState("week");

  const totalMilkThisWeek = useMemo(
    () => weeklyMilkTrend.reduce((sum, d) => sum + d.litres, 0),
    []
  );

  const avgYieldPerAnimal = useMemo(() => {
    const lactating = allAnimals.filter((a) => a.lactationStatus === "Lactating");
    const total = lactating.reduce((sum, a) => sum + a.currentMilkYield, 0);
    return lactating.length ? total / lactating.length : 0;
  }, []);

  const herdProductivityIndex = Math.round((herdSummary.lactating / herdSummary.total) * 100);

  const wonLeads = leads.filter((l) => l.stage === "Won").length;
  const lostLeads = leads.filter((l) => l.stage === "Lost").length;
  const leadConversionRate = wonLeads + lostLeads > 0 ? Math.round((wonLeads / (wonLeads + lostLeads)) * 100) : 0;

  const inventoryAttentionCount = inventoryItems.filter(
    (i) => i.status === "Low Stock" || i.status === "Out of Stock" || i.status === "Expiring Soon"
  ).length;

  const breedProductivity = useMemo(() => {
    const breeds: Breed[] = ["Gir", "Sahiwal", "Holstein Friesian", "Jersey", "Murrah Buffalo"];
    return breeds.map((breed) => {
      const lactating = allAnimals.filter((a) => a.breed === breed && a.lactationStatus === "Lactating");
      const avg = lactating.length
        ? lactating.reduce((sum, a) => sum + a.currentMilkYield, 0) / lactating.length
        : 0;
      return { breed, avgYield: Math.round(avg * 10) / 10, count: lactating.length };
    });
  }, []);

  const inventoryByStatus = useMemo(() => {
    const statuses: InventoryStatus[] = ["In Stock", "Low Stock", "Out of Stock", "Expiring Soon"];
    return statuses.map((status) => ({
      status,
      count: inventoryItems.filter((i) => i.status === status).length,
    }));
  }, []);

  const leadFunnel = useMemo(
    () =>
      leadStages.map((stage) => ({
        stage,
        count: leads.filter((l) => l.stage === stage).length,
      })),
    []
  );

  const pipelineByBuyerType = useMemo(() => {
    const totals = new Map<BuyerType, number>();
    leads
      .filter((l) => l.stage !== "Lost")
      .forEach((l) => {
        totals.set(l.buyerType, (totals.get(l.buyerType) ?? 0) + l.estimatedMonthlyValue);
      });
    return Array.from(totals.entries())
      .map(([buyerType, value]) => ({ buyerType, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Reports & Analytics</h2>
          <p className="text-sm text-neutral-500">Farm-wide performance across production, herd, inventory, and sales.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Milk (Week)"
          value={`${totalMilkThisWeek.toLocaleString()} L`}
          icon={Droplets}
          tone="brand"
        />
        <StatCard
          label="Avg. Yield / Animal"
          value={`${avgYieldPerAnimal.toFixed(1)} L`}
          icon={Gauge}
          tone="brand"
        />
        <StatCard
          label="Herd Productivity"
          value={`${herdProductivityIndex}%`}
          sublabel="Lactating share of herd"
          icon={TrendingUp}
          tone="brand"
        />
        <StatCard
          label="Lead Conversion"
          value={`${leadConversionRate}%`}
          sublabel={`${wonLeads} won of ${wonLeads + lostLeads} closed`}
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Expected Monthly Value"
          value={formatInr(totalPipelineValue)}
          sublabel="Active pipeline"
          icon={IndianRupee}
          tone="brand"
        />
        <StatCard
          label="Inventory Needs Attention"
          value={inventoryAttentionCount.toString()}
          sublabel="Low, out of stock, or expiring"
          icon={PackageX}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Milk Production Trend</CardTitle>
            <CardDescription>Daily total across all herds, in litres — {period === "week" ? "this week" : "this month"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyMilkTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportsMilkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a8d58" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#3a8d58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTick} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                    width={48}
                    domain={["dataMin - 40", "dataMax + 40"]}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
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
            <CardDescription>Average daily yield per lactating animal, litres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breedProductivity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="breed" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value} L/day`, "Avg. Yield"]}
                  />
                  <Bar dataKey="avgYield" fill="#205838" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Stock Health</CardTitle>
            <CardDescription>Number of items by stock status</CardDescription>
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
            <CardTitle>Sales Lead Conversion</CardTitle>
            <CardDescription>Leads by pipeline stage, including closed outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadFunnel} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={32} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value} leads`, "Count"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {leadFunnel.map((entry) => (
                      <Cell
                        key={entry.stage}
                        fill={entry.stage === "Won" ? "#3a8d58" : entry.stage === "Lost" ? "#c0392b" : "#3172b6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Expected Monthly Value by Buyer Type</CardTitle>
            <CardDescription>Active pipeline value (excludes lost leads) — shows where sales effort pays off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineByBuyerType} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="buyerType" tickLine={false} axisLine={false} tick={axisTick} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} tick={axisTick} width={56} tickFormatter={formatInr} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Expected Monthly Value"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="value" name="Expected Monthly Value" fill="#c8811a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
