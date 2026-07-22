import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/store/AppDataContext";
import { computeCapacity, computeDashboardKpis } from "@/store/selectors";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
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
        <CardTitle>Available to sell</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        <Row label="Produced today" value={`${capacity.milkToday.toLocaleString()} L`} />
        <Row label="Reserved for processing" value={`− ${capacity.reservedForProcessing.toLocaleString()} L`} />
        <Row label="Committed to buyers" value={`− ${capacity.committedToWonLeads.toLocaleString()} L`} />
        <div className="my-1.5 h-px bg-neutral-100" />
        <Row label="Available" value={`${capacity.availableToSell.toLocaleString()} L`} />

        {hasGap && (
          <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              Advanced-stage leads want {capacity.capacityGap.toLocaleString()} L more than today&apos;s surplus.
            </p>
          </div>
        )}

        <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate("/leads")}>
          Review pipeline
        </Button>
      </CardContent>
    </Card>
  );
}
