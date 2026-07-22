import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Milk, TrendingDown, TrendingUp } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/store/AppDataContext";
import { computeAvgYieldPerAnimal, computeDailyTotals, computeHerdSummary, computeMilkToday, computeYieldDeclines } from "@/store/selectors";
import { TODAY, addDays, formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { HERD_GROUPS } from "@/types";
import type { MilkProductionEntry, QualityStatus } from "@/types";

const qualityBadgeVariant: Record<QualityStatus, "success" | "warning" | "danger"> = {
  Excellent: "success",
  Good: "success",
  Acceptable: "warning",
  Rejected: "danger",
};

function computeQuality(fatPercent: number, rejectedLitres: number): QualityStatus {
  if (rejectedLitres > 3) return "Rejected";
  if (fatPercent >= 4.5) return "Excellent";
  if (fatPercent >= 4.0) return "Good";
  return "Acceptable";
}

interface FormState {
  date: string;
  herdGroup: string;
  morningYield: string;
  eveningYield: string;
  fatPercent: string;
  snfPercent: string;
  rejectedLitres: string;
}

function emptyForm(): FormState {
  return {
    date: TODAY,
    herdGroup: HERD_GROUPS[0],
    morningYield: "",
    eveningYield: "",
    fatPercent: "",
    snfPercent: "",
    rejectedLitres: "0",
  };
}

export default function MilkProduction() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state, addMilkEntry } = useAppData();

  const [search, setSearch] = useState("");
  const [herdFilter, setHerdFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setDialogOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = state.milkEntries;
  const herd = computeHerdSummary(state.animals);
  const milkToday = computeMilkToday(entries);
  const avgYield = computeAvgYieldPerAnimal(milkToday, herd.lactating);

  const todaysEntries = useMemo(() => entries.filter((e) => e.date === TODAY), [entries]);
  const yesterdaysEntries = useMemo(() => entries.filter((e) => e.date === addDays(TODAY, -1)), [entries]);

  const summary = useMemo(() => {
    const morning = todaysEntries.reduce((sum, e) => sum + e.morningYield, 0);
    const evening = todaysEntries.reduce((sum, e) => sum + e.eveningYield, 0);
    const rejected = todaysEntries.reduce((sum, e) => sum + e.rejectedLitres, 0);
    const avgFat = todaysEntries.length ? todaysEntries.reduce((s, e) => s + e.fatPercent, 0) / todaysEntries.length : 0;
    const avgSnf = todaysEntries.length ? todaysEntries.reduce((s, e) => s + e.snfPercent, 0) / todaysEntries.length : 0;
    return { morning, evening, rejected, avgFat: Math.round(avgFat * 10) / 10, avgSnf: Math.round(avgSnf * 10) / 10 };
  }, [todaysEntries]);

  const insight = useMemo(() => {
    const yesterdayTotal = yesterdaysEntries.reduce((s, e) => s + e.morningYield + e.eveningYield, 0);
    const changePercent = yesterdayTotal > 0 ? Math.round(((milkToday - yesterdayTotal) / yesterdayTotal) * 1000) / 10 : 0;

    const best = [...todaysEntries].sort((a, b) => b.morningYield + b.eveningYield - (a.morningYield + a.eveningYield))[0];
    const declines = computeYieldDeclines(state.animals);

    return { changePercent, best, declines: declines.slice(0, 3) };
  }, [todaysEntries, yesterdaysEntries, milkToday, state.animals]);

  const dailyTotals = useMemo(() => computeDailyTotals(entries).slice(-14), [entries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter((e) => e.date > addDays(TODAY, -14))
      .filter((e) => (herdFilter === "all" ? true : e.herdGroup === herdFilter))
      .filter((e) => (q ? e.herdGroup.toLowerCase().includes(q) || e.date.includes(q) : true))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [entries, herdFilter, search]);

  function handleFormChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetAndClose() {
    setForm(emptyForm());
    setDialogOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const morningYield = Number(form.morningYield) || 0;
    const eveningYield = Number(form.eveningYield) || 0;
    const fatPercent = Number(form.fatPercent) || 0;
    const snfPercent = Number(form.snfPercent) || 0;
    const rejectedLitres = Number(form.rejectedLitres) || 0;
    const quality = computeQuality(fatPercent, rejectedLitres);

    const newEntry: MilkProductionEntry = {
      id: `MP-${Date.now()}`,
      date: form.date,
      herdGroup: form.herdGroup,
      morningYield,
      eveningYield,
      fatPercent,
      snfPercent,
      quality,
      rejectedLitres,
    };

    addMilkEntry(newEntry);
    toast({
      title: "Production recorded",
      description: `${form.herdGroup} — ${morningYield + eveningYield} L logged for ${form.date}.`,
      variant: "success",
    });
    resetAndClose();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Milk production</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Milk className="h-4 w-4" />
          Record production
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <p className="text-[13px] text-neutral-500">Milk today</p>
          <p className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900">{milkToday.toLocaleString()} L</p>
          <span className={cn("text-sm font-medium", insight.changePercent >= 0 ? "text-brand-600" : "text-red-600")}>
            {insight.changePercent >= 0 ? "+" : ""}
            {insight.changePercent}%
          </span>
        </div>
        <p className="text-sm text-neutral-500">
          Morning {summary.morning.toLocaleString()} L · Evening {summary.evening.toLocaleString()} L · Average {avgYield} L
        </p>
        <p className="text-sm text-neutral-500">
          Fat {summary.avgFat}% · SNF {summary.avgSnf}% ·{" "}
          <span className={summary.rejected > 0 ? "font-medium text-red-600" : ""}>
            Rejected {summary.rejected.toLocaleString()} L
          </span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTotals} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="milkTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3a8d58" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#3a8d58" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e1dc" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7c7a73", fontSize: 11 }}
                  tickFormatter={(d) => formatDate(d).slice(0, 6)}
                />
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
                  labelFormatter={(d) => formatDate(String(d))}
                  formatter={(value) => [`${Number(value).toLocaleString()} L`, "Production"]}
                />
                <Area type="monotone" dataKey="litres" stroke="#205838" strokeWidth={2} fill="url(#milkTrendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-100 pt-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              {insight.changePercent >= 0 ? (
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              ) : (
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <p className="text-xs text-neutral-600">
                <span className="font-medium text-neutral-900">
                  {insight.changePercent >= 0 ? "+" : ""}
                  {insight.changePercent}%
                </span>{" "}
                vs yesterday
              </p>
            </div>
            {insight.best && (
              <div className="flex items-start gap-2">
                <Milk className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-xs text-neutral-600">
                  Best today: <span className="font-medium text-neutral-900">{insight.best.herdGroup}</span> (
                  {insight.best.morningYield + insight.best.eveningYield} L)
                </p>
              </div>
            )}
            {insight.declines.length > 0 ? (
              <button onClick={() => navigate(`/farm-records?open=${insight.declines[0].animal.id}`)} className="flex items-start gap-2 text-left hover:underline">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-neutral-600">
                  <span className="font-medium text-neutral-900">
                    {insight.declines.length} {insight.declines.length === 1 ? "animal" : "animals"}
                  </span>{" "}
                  with a meaningful yield decline — view {insight.declines[0].animal.name}
                </p>
              </button>
            ) : (
              <div className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-xs text-neutral-600">No animals with a meaningful yield decline this week.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Production Log</CardTitle>
            <CardDescription>{filteredEntries.length} records — last 14 days</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input placeholder="Search herd or date..." value={search} onChange={(e) => setSearch(e.target.value)} className="sm:w-56" />
            <Select value={herdFilter} onValueChange={setHerdFilter}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="All herd groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All herd groups</SelectItem>
                {HERD_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Date</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Herd Group</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Morning (L)</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Evening (L)</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Total (L)</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Fat %</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">SNF %</th>
                  <th className="whitespace-nowrap py-2 pr-4 font-medium">Quality</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-25">
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.date}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-neutral-800">{entry.herdGroup}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.morningYield}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.eveningYield}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-neutral-900">{entry.morningYield + entry.eveningYield}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.fatPercent.toFixed(1)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.snfPercent.toFixed(1)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <Badge variant={qualityBadgeVariant[entry.quality]}>{entry.quality}</Badge>
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-neutral-400">
                      No production records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setForm(emptyForm());
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Production</DialogTitle>
            <DialogDescription>Log morning and evening yield along with quality parameters.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="herdGroup">Herd Group</Label>
                <Select value={form.herdGroup} onValueChange={(v) => handleFormChange("herdGroup", v)}>
                  <SelectTrigger id="herdGroup">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HERD_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="morningYield">Morning Yield (L)</Label>
                <Input id="morningYield" type="number" min={0} step="0.1" required value={form.morningYield} onChange={(e) => handleFormChange("morningYield", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eveningYield">Evening Yield (L)</Label>
                <Input id="eveningYield" type="number" min={0} step="0.1" required value={form.eveningYield} onChange={(e) => handleFormChange("eveningYield", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatPercent">Fat %</Label>
                <Input id="fatPercent" type="number" min={0} step="0.1" required value={form.fatPercent} onChange={(e) => handleFormChange("fatPercent", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="snfPercent">SNF %</Label>
                <Input id="snfPercent" type="number" min={0} step="0.1" required value={form.snfPercent} onChange={(e) => handleFormChange("snfPercent", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rejectedLitres">Rejected (L)</Label>
                <Input id="rejectedLitres" type="number" min={0} step="0.1" value={form.rejectedLitres} onChange={(e) => handleFormChange("rejectedLitres", e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
              <Button type="submit">Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
