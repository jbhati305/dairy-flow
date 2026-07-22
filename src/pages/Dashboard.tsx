import { useNavigate } from "react-router-dom";
import { Milk, Boxes, UserPlus, ClipboardList, Syringe, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { TodaysPriorities } from "@/components/dashboard/TodaysPriorities";
import { AvailableToSell } from "@/components/dashboard/AvailableToSell";
import { AssistantWidget } from "@/components/dashboard/AssistantWidget";
import { useAppData } from "@/store/AppDataContext";
import { computeDashboardKpis, computeHerdSummary, computeWeeklyTrend } from "@/store/selectors";
import { formatDate, TODAY } from "@/lib/date";

const activityIcon = {
  milk: Milk,
  inventory: Boxes,
  lead: UserPlus,
  vaccination: Syringe,
  task: ClipboardList,
  health: Syringe,
};

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

  const healthyShare = Math.round(((herd.total - herd.underTreatment) / herd.total) * 100);
  const recentActivity = state.activity.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Good morning, Jitesh</h2>
        <p className="text-sm text-neutral-400">{formatDate(TODAY)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Milk today" value={`${kpis.milkToday.toLocaleString()} L`} sublabel={`${weekChangePercent >= 0 ? "+" : ""}${weekChangePercent}% wk`} tone={weekChangePercent >= 0 ? "brand" : "red"} />
        <StatCard label="Average yield" value={`${kpis.avgYield} L`} />
        <StatCard label="Herd health" value={`${healthyShare}%`} sublabel={herd.underTreatment > 0 ? `${herd.underTreatment} under treatment` : "all clear"} tone={herd.underTreatment > 0 ? "amber" : "brand"} />
        <StatCard label="Stock alerts" value={kpis.inventoryAttentionCount.toString()} tone={kpis.inventoryAttentionCount > 0 ? "amber" : "neutral"} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
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
                    tickFormatter={(v) => `${v} L`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e1dc", fontSize: 12, boxShadow: "var(--shadow-panel)" }}
                    formatter={(value) => [`${Number(value).toLocaleString()} L`, "Production"]}
                  />
                  <Area type="monotone" dataKey="litres" stroke="#205838" strokeWidth={2} fill="url(#milkFill)" />
                </AreaChart>
              </ResponsiveContainer>
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
            <CardTitle>Recent activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/farm-records")}>
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <ol className="divide-y divide-neutral-100">
              {recentActivity.map((item) => {
                const Icon = activityIcon[item.type];
                return (
                  <li key={item.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <p className="min-w-0 flex-1 truncate text-sm text-neutral-700">{item.message}</p>
                    <p className="shrink-0 text-xs text-neutral-400">{timeAgo(item.timestamp)}</p>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <AssistantWidget />
    </div>
  );
}
