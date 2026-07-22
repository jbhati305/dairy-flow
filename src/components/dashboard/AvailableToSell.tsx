import { useNavigate } from "react-router-dom";
import { Droplets, Factory, Handshake, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/store/AppDataContext";
import { computeCapacity, computeDashboardKpis } from "@/store/selectors";

function Row({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="flex items-center gap-2 text-xs text-neutral-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export function AvailableToSell() {
  const { state } = useAppData();
  const navigate = useNavigate();
  const kpis = computeDashboardKpis(state);
  const capacity = computeCapacity(kpis.milkToday, state.leads);
  const hasGap = capacity.capacityGap > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available to Sell</CardTitle>
        <CardDescription>Estimated surplus for new buyers today</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <Row icon={Droplets} label="Production today" value={`${capacity.milkToday.toLocaleString()} L`} />
        <Row icon={Factory} label="Reserved (processing, est.)" value={`− ${capacity.reservedForProcessing.toLocaleString()} L`} />
        <Row icon={Handshake} label="Committed to signed buyers" value={`− ${capacity.committedToWonLeads.toLocaleString()} L`} />
        <div className="my-2 h-px bg-neutral-100" />
        <Row icon={TrendingUp} label="Available to sell (estimate)" value={`${capacity.availableToSell.toLocaleString()} L`} />

        {hasGap ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              Advanced-stage leads want {capacity.advancedStageDemand.toLocaleString()} L/day — {capacity.capacityGap.toLocaleString()} L more
              than today&apos;s estimated surplus. Consider phasing new contracts.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-500">
            Advanced-stage leads want {capacity.advancedStageDemand.toLocaleString()} L/day — comfortably within today&apos;s surplus.
          </p>
        )}

        <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => navigate("/leads")}>
          Review lead pipeline
        </Button>
      </CardContent>
    </Card>
  );
}
