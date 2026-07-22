import { useNavigate } from "react-router-dom";
import {
  Beef,
  Droplets,
  Gauge,
  PackageX,
  Users,
  AlertTriangle,
  AlertCircle,
  Info,
  Milk,
  Boxes,
  UserPlus,
  Syringe,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { AssistantPanel } from "@/components/dashboard/AssistantPanel";
import { kpis, alerts, recentActivity } from "@/data/dashboard";
import { weeklyMilkTrend } from "@/data/milkProduction";
import { herdSummary } from "@/data/animals";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: { icon: AlertCircle, classes: "text-red-600 bg-red-50 border-red-100" },
  warning: { icon: AlertTriangle, classes: "text-amber-600 bg-amber-50 border-amber-100" },
  info: { icon: Info, classes: "text-blue-600 bg-blue-50 border-blue-100" },
};

const activityIcon = {
  milk: Milk,
  inventory: Boxes,
  lead: UserPlus,
  vaccination: Syringe,
  task: ClipboardList,
};

const herdGroups = [
  { label: "Lactating", value: herdSummary.lactating, color: "bg-brand-600" },
  { label: "Dry", value: herdSummary.dry, color: "bg-neutral-400" },
  { label: "Pregnant", value: herdSummary.pregnant, color: "bg-blue-500" },
  { label: "Calves", value: herdSummary.calves, color: "bg-amber-500" },
  { label: "Under treatment", value: herdSummary.underTreatment, color: "bg-red-500" },
];

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

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Good morning, Jitesh</h2>
        <p className="text-sm text-neutral-500">Here's what's happening at Bhati Dairy Farm today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Cattle" value={kpis.totalCattle.toString()} icon={Beef} tone="brand" />
        <StatCard
          label="Lactating Cattle"
          value={kpis.lactatingCattle.toString()}
          sublabel={`${Math.round((kpis.lactatingCattle / kpis.totalCattle) * 100)}% of herd`}
          icon={Droplets}
          tone="brand"
        />
        <StatCard
          label="Milk Produced Today"
          value={`${kpis.milkToday.toLocaleString()} L`}
          icon={Milk}
          tone="brand"
        />
        <StatCard label="Avg. Yield / Animal" value={`${kpis.avgYield} L`} icon={Gauge} tone="brand" />
        <StatCard
          label="Low-Stock Items"
          value={kpis.lowStockItems.toString()}
          icon={PackageX}
          tone="amber"
        />
        <StatCard label="Active Sales Leads" value={kpis.activeLeads.toString()} icon={Users} tone="brand" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Milk Production — Last 7 Days</CardTitle>
              <CardDescription>Daily total across all herds, in litres</CardDescription>
            </div>
            <Badge variant="brand">+4.0% vs last week</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyMilkTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="milkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3a8d58" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#3a8d58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7c7a73", fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#7c7a73", fontSize: 12 }}
                    width={48}
                    domain={["dataMin - 40", "dataMax + 40"]}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e1dc",
                      fontSize: 12,
                      boxShadow: "var(--shadow-panel)",
                    }}
                    formatter={(value) => [`${Number(value).toLocaleString()} L`, "Production"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="litres"
                    stroke="#205838"
                    strokeWidth={2}
                    fill="url(#milkFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Herd Overview</CardTitle>
            <CardDescription>128 animals across statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {herdGroups.map((g) => (
              <div key={g.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-700">{g.label}</span>
                  <span className="text-neutral-500">{g.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn("h-full rounded-full", g.color)}
                    style={{ width: `${(g.value / herdSummary.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full"
              onClick={() => navigate("/farm-records")}
            >
              View farm records
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Alerts across health, inventory, and leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => {
              const cfg = severityConfig[a.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-25 p-3"
                >
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", cfg.classes)}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-800">{a.message}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {a.module} · {timeAgo(a.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across the farm</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recentActivity.map((item, idx) => {
                const Icon = activityIcon[item.type];
                return (
                  <li key={item.id} className="relative flex gap-3 pl-1">
                    <div className="flex flex-col items-center">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <Icon className="h-3 w-3" />
                      </span>
                      {idx < recentActivity.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-neutral-100" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-xs text-neutral-700 leading-snug">{item.message}</p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">{timeAgo(item.timestamp)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(`${action.path}?new=1`)}
              className="flex flex-col items-start gap-3 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <action.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-neutral-800">{action.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>

    <div className="w-full shrink-0 xl:w-[340px]">
      <AssistantPanel />
    </div>
    </div>
  );
}
