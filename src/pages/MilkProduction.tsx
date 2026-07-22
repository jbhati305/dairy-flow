import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Droplets, Sun, Moon, Milk, Gauge, Ban } from "lucide-react";
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
import { StatCard } from "@/components/shared/StatCard";
import { useToast } from "@/components/ui/toast";
import {
  weeklyMilkTrend,
  milkProductionEntries,
  productionQualityMetrics,
} from "@/data/milkProduction";
import type { MilkProductionEntry, QualityStatus } from "@/types";

const HERD_GROUPS = [
  "Gir Herd",
  "Holstein Friesian Herd",
  "Sahiwal Herd",
  "Murrah Buffalo Herd",
  "Jersey Herd",
];

const LACTATING_ANIMALS = 82;

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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
    date: todayISO(),
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

  const [entries, setEntries] = useState<MilkProductionEntry[]>(milkProductionEntries);
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

  const today = useMemo(() => {
    return entries.reduce((max, e) => (e.date > max ? e.date : max), entries[0]?.date ?? todayISO());
  }, [entries]);

  const todaysEntries = useMemo(() => entries.filter((e) => e.date === today), [entries, today]);

  const summary = useMemo(() => {
    const morning = todaysEntries.reduce((sum, e) => sum + e.morningYield, 0);
    const evening = todaysEntries.reduce((sum, e) => sum + e.eveningYield, 0);
    const rejected = todaysEntries.reduce((sum, e) => sum + e.rejectedLitres, 0);
    const total = morning + evening;
    const avgPerAnimal = total / LACTATING_ANIMALS;
    return { morning, evening, total, rejected, avgPerAnimal };
  }, [todaysEntries]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
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

    setEntries((prev) => [newEntry, ...prev]);
    toast({
      title: "Production recorded",
      description: `${form.herdGroup} — ${morningYield + eveningYield} L logged for ${form.date}.`,
      variant: "success",
    });
    resetAndClose();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Milk Production</h2>
          <p className="text-sm text-neutral-500">
            Track daily yield, quality, and rejections across herds.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Milk className="h-4 w-4" />
          Record Production
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Morning Production"
          value={`${summary.morning.toLocaleString()} L`}
          icon={Sun}
          tone="brand"
        />
        <StatCard
          label="Evening Production"
          value={`${summary.evening.toLocaleString()} L`}
          icon={Moon}
          tone="brand"
        />
        <StatCard
          label="Total Production"
          value={`${summary.total.toLocaleString()} L`}
          sublabel="Today, all herds"
          icon={Droplets}
          tone="brand"
        />
        <StatCard
          label="Avg Yield / Animal"
          value={`${summary.avgPerAnimal.toFixed(1)} L`}
          sublabel={`${LACTATING_ANIMALS} lactating animals`}
          icon={Gauge}
          tone="brand"
        />
        <StatCard
          label="Rejected / Spoiled"
          value={`${summary.rejected.toLocaleString()} L`}
          sublabel={`${productionQualityMetrics.rejectedPercent}% of total`}
          icon={Ban}
          tone="red"
        />
        <StatCard
          label="Avg Fat / SNF"
          value={`${productionQualityMetrics.avgFat}% / ${productionQualityMetrics.avgSnf}%`}
          sublabel="Herd-wide average"
          icon={Gauge}
          tone="amber"
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Production Trend — Last 7 Days</CardTitle>
            <CardDescription>Daily total across all herds, in litres</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyMilkTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="milkTrendFill" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#milkTrendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Production Log</CardTitle>
            <CardDescription>{filteredEntries.length} records</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search herd or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-56"
            />
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
                  <tr
                    key={entry.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-25"
                  >
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">{entry.date}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-neutral-800">
                      {entry.herdGroup}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">
                      {entry.morningYield}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">
                      {entry.eveningYield}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 font-medium text-neutral-900">
                      {entry.morningYield + entry.eveningYield}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">
                      {entry.fatPercent.toFixed(1)}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-neutral-700">
                      {entry.snfPercent.toFixed(1)}
                    </td>
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
            <DialogDescription>
              Log morning and evening yield along with quality parameters.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="herdGroup">Herd Group</Label>
                <Select
                  value={form.herdGroup}
                  onValueChange={(v) => handleFormChange("herdGroup", v)}
                >
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
                <Input
                  id="morningYield"
                  type="number"
                  min={0}
                  step="0.1"
                  required
                  value={form.morningYield}
                  onChange={(e) => handleFormChange("morningYield", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eveningYield">Evening Yield (L)</Label>
                <Input
                  id="eveningYield"
                  type="number"
                  min={0}
                  step="0.1"
                  required
                  value={form.eveningYield}
                  onChange={(e) => handleFormChange("eveningYield", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fatPercent">Fat %</Label>
                <Input
                  id="fatPercent"
                  type="number"
                  min={0}
                  step="0.1"
                  required
                  value={form.fatPercent}
                  onChange={(e) => handleFormChange("fatPercent", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="snfPercent">SNF %</Label>
                <Input
                  id="snfPercent"
                  type="number"
                  min={0}
                  step="0.1"
                  required
                  value={form.snfPercent}
                  onChange={(e) => handleFormChange("snfPercent", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rejectedLitres">Rejected (L)</Label>
                <Input
                  id="rejectedLitres"
                  type="number"
                  min={0}
                  step="0.1"
                  value={form.rejectedLitres}
                  onChange={(e) => handleFormChange("rejectedLitres", e.target.value)}
                />
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
