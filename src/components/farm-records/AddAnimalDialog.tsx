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
import { useToast } from "@/components/ui/toast";
import type { Animal, Breed, HealthStatus, LactationStatus } from "@/types";

const breeds: Breed[] = ["Gir", "Sahiwal", "Holstein Friesian", "Jersey", "Murrah Buffalo"];
const lactationStatuses: LactationStatus[] = ["Lactating", "Dry", "Pregnant", "Calf"];
const healthStatuses: HealthStatus[] = ["Healthy", "Under Observation", "Treatment Required"];
const swatches = ["#8bc99e", "#c8811a", "#a3a099", "#3a8d58", "#7c7a73", "#59ab75"];

interface AddAnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (animal: Animal) => void;
  nextId: string;
}

const emptyForm = {
  name: "",
  breed: "Gir" as Breed,
  ageYears: "",
  gender: "Female" as "Female" | "Male",
  lactationStatus: "Lactating" as LactationStatus,
  currentMilkYield: "",
  healthStatus: "Healthy" as HealthStatus,
  lastVaccination: "",
  nextCheckup: "",
  notes: "",
};

export function AddAnimalDialog({ open, onOpenChange, onAdd, nextId }: AddAnimalDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.ageYears || Number(form.ageYears) <= 0) nextErrors.ageYears = "Enter a valid age";
    if (!form.currentMilkYield || Number(form.currentMilkYield) < 0)
      nextErrors.currentMilkYield = "Enter a valid yield";
    if (!form.lastVaccination) nextErrors.lastVaccination = "Required";
    if (!form.nextCheckup) nextErrors.nextCheckup = "Required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const animal: Animal = {
      id: nextId,
      name: form.name.trim(),
      breed: form.breed,
      ageYears: Number(form.ageYears),
      gender: form.gender,
      lactationStatus: form.lactationStatus,
      currentMilkYield: Number(form.currentMilkYield),
      healthStatus: form.healthStatus,
      lastVaccination: form.lastVaccination,
      nextCheckup: form.nextCheckup,
      photoColor: swatches[Math.floor(Math.random() * swatches.length)],
      breedingInfo: { calvingCount: 0 },
      healthHistory: [],
      vaccinationHistory: [],
      recentYield: [],
      notes: form.notes.trim(),
    };

    onAdd(animal);
    toast({ title: "Animal record added", description: `${animal.name} (${animal.id}) has been added to the herd.` });
    setForm(emptyForm);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setForm(emptyForm);
          setErrors({});
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add animal record</DialogTitle>
          <DialogDescription>Enter details for the new cattle record ({nextId}).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Kaveri"
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="breed">Breed</Label>
              <Select value={form.breed} onValueChange={(v) => update("breed", v as Breed)}>
                <SelectTrigger id="breed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breeds.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                step="0.5"
                value={form.ageYears}
                onChange={(e) => update("ageYears", e.target.value)}
                placeholder="e.g. 4"
              />
              {errors.ageYears && <p className="text-xs text-red-600">{errors.ageYears}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gender">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v as "Female" | "Male")}>
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lactationStatus">Lactation status</Label>
              <Select
                value={form.lactationStatus}
                onValueChange={(v) => update("lactationStatus", v as LactationStatus)}
              >
                <SelectTrigger id="lactationStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lactationStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="yield">Current milk yield (L/day)</Label>
              <Input
                id="yield"
                type="number"
                min={0}
                step="0.1"
                value={form.currentMilkYield}
                onChange={(e) => update("currentMilkYield", e.target.value)}
                placeholder="e.g. 12.5"
              />
              {errors.currentMilkYield && (
                <p className="text-xs text-red-600">{errors.currentMilkYield}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="healthStatus">Health status</Label>
              <Select
                value={form.healthStatus}
                onValueChange={(v) => update("healthStatus", v as HealthStatus)}
              >
                <SelectTrigger id="healthStatus">
                  <SelectValue />
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastVaccination">Last vaccination</Label>
              <Input
                id="lastVaccination"
                type="date"
                value={form.lastVaccination}
                onChange={(e) => update("lastVaccination", e.target.value)}
              />
              {errors.lastVaccination && (
                <p className="text-xs text-red-600">{errors.lastVaccination}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nextCheckup">Next check-up</Label>
              <Input
                id="nextCheckup"
                type="date"
                value={form.nextCheckup}
                onChange={(e) => update("nextCheckup", e.target.value)}
              />
              {errors.nextCheckup && <p className="text-xs text-red-600">{errors.nextCheckup}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Any additional notes about this animal"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add animal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
