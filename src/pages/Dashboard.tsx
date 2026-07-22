import { useNavigate } from "react-router-dom";
import { Beef, Gauge, Users, Milk, Boxes, UserPlus, ClipboardList, Syringe, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard, MetricStrip } from "@/components/shared/StatCard";
import { TodaysPriorities } from "@/components/dashboard/TodaysPriorities";
import { AvailableToSell } from "@/components/dashboard/AvailableToSell";
import { AssistantWidget } from "@/components/dashboard/AssistantWidget";
import { useAppData } from "@/store/AppDataContext";
import { computeDashboardKpis, computeHerdSummary, computeWeeklyTrend } from "@/store/selectors";
import { cn } from "@/lib/utils";

const activityIcon = {
  milk: Milk,
  inventory: Boxes,
  lead: UserPlus,
  vaccination: Syringe,
  task: ClipboardList,
  health: Syringe,
};

const quickActions = [
  { label: "Record milk production", icon: Milk, path: "/milk-production" },
  { label: "Add cattle record", icon: Beef, path: "/farm-records" },
  { label: "Update inventory", icon: Boxes, path: "/inventory" },
  { label: "Add lead", icon: UserPlus, path: "/leads" },
];

function timeAgo(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useAppData();

  const kpis = computeDashboardKpis(state);
  const herd = computeHerdSummary(state.animals);
  const weeklyTrend = computeWeeklyTrend(state.milkEntries);
  const weekChangePercent = (() => {
    if (weeklyTrend.length < 2) return 0;
    const first = weeklyTrend[0].litres;
    const last = weeklyTrend[weeklyTrend.length - 1].litres;
    return first > 0 ? Math.round(((last - first) / first) * 1000) / 10 : 0;
  })();

  const herdGroups = [
    { label: "Lactating", value: herd.lactating, color: "bg-brand-600" },
    { label: "Dry", value: herd.dry, color: "bg-neutral-400" },
    { label: "Pregnant", value: herd.pregnant, color: "bg-blue-500" },
    { label: "Calves", value: herd.calves, color: "bg-amber-500" },
    { label: "Under treatment", value: herd.underTreatment, color: "bg-red-500" },
  ];

  const recentActivity = state.activity.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Good morning, Jitesh</h2>
        <p className="text-sm text-neutral-500">Here&apos;s what&apos;s happening at Bhati Dairy Farm today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Herd Size"
          value={kpis.totalCattle.toString()}
          sublabel={`${kpis.lactatingCattle} lactating (${Math.round((kpis.lactatingCattle / kpis.totalCattle) * 100)}%)`}
          icon={Beef}
          tone="brand"
        />
        <StatCard label="Milk Produced Today" value={`${kpis.milkToday.toLocaleString()} L`} icon={Milk} tone="brand" />
        <StatCard label="Avg. Yield / Animal" value={`${kpis.avgYield} L`} icon={Gauge} tone="brand" />
        <StatCard label="Active Sales Leads" value={kpis.activeLeads.toString()} icon={Users} tone="brand" />
      </div>

      <MetricStrip
        items={[
          { label: "low-stock items", value: kpis.lowStockItems.toString(), tone: kpis.lowStockItems > 0 ? "amber" : "neutral" },
          { label: "week-over-week production", value: `${weekChangePercent >= 0 ? "+" : ""}${weekChangePercent}%`, tone: weekChangePercent >= 0 ? "brand" : "red" },
          { label: "herd on record", value: `${herd.total} animals` },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Milk Production — Last 7 Days</CardTitle>
              <CardDescription>Daily total across all herds, in litres</CardDescription>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                weekChangePercent >= 0 ? "border-brand-200 bg-brand-50 text-brand-700" : "border-red-100 bg-red-50 text-red-600"
              )}
            >
              {weekChangePercent >= 0 ? "+" : ""}
              {weekChangePercent}% vs last week
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a8d58" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#3a8d58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#7c7a73", fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7c7a73", fontSize: 12 }}
                    width={48}
                    domain={["dataMin - 40", "dataMax + 40"]}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e1dc", fontSize: 12, boxShadow: "var(--shadow-panel)" }}
                    formatter={(value) => [`${Number(value).toLocaleString()} L`, "Production"]}
                  />
                  <Area type="monotone" dataKey="litres" stroke="#205838" strokeWidth={2} fill="url(#milkFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-2">
              {herdGroups.slice(0, 4).map((g) => (
                <div key={g.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">{g.label}</span>
                    <span className="text-neutral-500">{g.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className={cn("h-full rounded-full", g.color)} style={{ width: `${(g.value / herd.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <TodaysPriorities />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AvailableToSell />

        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across the farm</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/farm-records")}>
              View Herd & Health
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <ol className="divide-y divide-neutral-100">
              {recentActivity.map((item) => {
                const Icon = activityIcon[item.type];
                return (
                  <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-neutral-700 leading-snug">{item.message}</p>
                    </div>
                    <p className="shrink-0 text-[11px] text-neutral-400">{timeAgo(item.timestamp)}</p>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(`${action.path}?new=1`)}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 text-left shadow-[var(--shadow-card)] transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <action.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-neutral-800">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AssistantWidget />
    </div>
  );
}
