import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Animal, HealthEventType, HealthStatus } from "@/types";
import { TODAY, addDays } from "@/lib/date";

const healthEventTypes: HealthEventType[] = ["Veterinary Check", "Treatment", "Illness", "Recovery"];
const healthStatuses: HealthStatus[] = ["Healthy", "Under Observation", "Treatment Required"];

interface BaseProps {
  animal: Animal | null;
  onOpenChange: (open: boolean) => void;
}

export function LogHealthEventDialog({
  animal,
  onOpenChange,
  onSubmit,
}: BaseProps & { onSubmit: (args: { eventType: HealthEventType; note: string; vet?: string; date: string; newHealthStatus?: HealthStatus }) => void }) {
  const [eventType, setEventType] = useState<HealthEventType>("Veterinary Check");
  const [note, setNote] = useState("");
  const [vet, setVet] = useState("");
  const [date, setDate] = useState(TODAY);
  const [newHealthStatus, setNewHealthStatus] = useState<HealthStatus | "">("");

  if (!animal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onSubmit({ eventType, note: note.trim(), vet: vet.trim() || undefined, date, newHealthStatus: newHealthStatus || undefined });
    setNote("");
    setVet("");
    setNewHealthStatus("");
  }

  return (
    <Dialog open={!!animal} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Health Event — {animal.name}</DialogTitle>
          <DialogDescription>Record a health timeline entry for {animal.id}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as HealthEventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {healthEventTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-date">Date</Label>
              <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-note">Note</Label>
            <Textarea id="event-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened?" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-vet">Vet (optional)</Label>
              <Input id="event-vet" value={vet} onChange={(e) => setVet(e.target.value)} placeholder="Dr. ..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Update health status (optional)</Label>
              <Select value={newHealthStatus} onValueChange={(v) => setNewHealthStatus(v as HealthStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="No change" />
                </SelectTrigger>
                <SelectContent>
                  {healthStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RecordVaccinationDialog({
  animal,
  onOpenChange,
  onSubmit,
}: BaseProps & { onSubmit: (args: { vaccine: string; date: string; nextDue?: string }) => void }) {
  const [vaccine, setVaccine] = useState("");
  const [date, setDate] = useState(TODAY);
  const [nextDue, setNextDue] = useState(addDays(TODAY, 180));

  if (!animal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vaccine.trim()) return;
    onSubmit({ vaccine: vaccine.trim(), date, nextDue: nextDue || undefined });
    setVaccine("");
  }

  return (
    <Dialog open={!!animal} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Vaccination — {animal.name}</DialogTitle>
          <DialogDescription>Updates last vaccination and next check-up for {animal.id}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vaccine-name">Vaccine</Label>
            <Input id="vaccine-name" value={vaccine} onChange={(e) => setVaccine(e.target.value)} placeholder="e.g. FMD Vaccine" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vaccine-date">Date Given</Label>
              <Input id="vaccine-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vaccine-next">Next Due (optional)</Label>
              <Input id="vaccine-next" type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Vaccination</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBreedingEventDialog({
  animal,
  onOpenChange,
  onSubmit,
}: BaseProps & {
  onSubmit: (args: { field: "inseminationDate" | "lastCalvingDate" | "expectedCalvingDate"; value: string; date: string; note: string }) => void;
}) {
  const [field, setField] = useState<"inseminationDate" | "lastCalvingDate" | "expectedCalvingDate">("inseminationDate");
  const [value, setValue] = useState(TODAY);
  const [note, setNote] = useState("");

  if (!animal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ field, value, date: TODAY, note: note.trim() || `${field} recorded` });
    setNote("");
  }

  return (
    <Dialog open={!!animal} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Breeding Event — {animal.name}</DialogTitle>
          <DialogDescription>Updates breeding information for {animal.id}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Event</Label>
            <Select value={field} onValueChange={(v) => setField(v as typeof field)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inseminationDate">Insemination</SelectItem>
                <SelectItem value="lastCalvingDate">Calving</SelectItem>
                <SelectItem value="expectedCalvingDate">Expected Calving Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="breeding-date">Date</Label>
            <Input id="breeding-date" type="date" value={value} onChange={(e) => setValue(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="breeding-note">Note (optional)</Label>
            <Textarea id="breeding-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any details" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RecordYieldDialog({
  animal,
  onOpenChange,
  onSubmit,
}: BaseProps & { onSubmit: (args: { date: string; litres: number }) => void }) {
  const [date, setDate] = useState(TODAY);
  const [litres, setLitres] = useState("");

  if (!animal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(litres);
    if (!litres || value < 0) return;
    onSubmit({ date, litres: value });
    setLitres("");
  }

  return (
    <Dialog open={!!animal} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Milk Yield — {animal.name}</DialogTitle>
          <DialogDescription>Adds a data point to {animal.id}&apos;s recent yield trend.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="yield-date">Date</Label>
              <Input id="yield-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="yield-litres">Litres</Label>
              <Input id="yield-litres" type="number" min={0} step="0.1" value={litres} onChange={(e) => setLitres(e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Yield</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
