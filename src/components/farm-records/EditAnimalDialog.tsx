import { useEffect, useState } from "react";
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

interface EditAnimalDialogProps {
  animal: Animal | null;
  onOpenChange: (open: boolean) => void;
  onSave: (animal: Animal) => void;
}

type FormState = {
  name: string;
  breed: Breed;
  ageYears: string;
  gender: "Female" | "Male";
  lactationStatus: LactationStatus;
  currentMilkYield: string;
  healthStatus: HealthStatus;
  lastVaccination: string;
  nextCheckup: string;
  notes: string;
};

function toForm(animal: Animal): FormState {
  return {
    name: animal.name,
    breed: animal.breed,
    ageYears: String(animal.ageYears),
    gender: animal.gender,
    lactationStatus: animal.lactationStatus,
    currentMilkYield: String(animal.currentMilkYield),
    healthStatus: animal.healthStatus,
    lastVaccination: animal.lastVaccination,
    nextCheckup: animal.nextCheckup,
    notes: animal.notes,
  };
}

export function EditAnimalDialog({ animal, onOpenChange, onSave }: EditAnimalDialogProps) {
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (animal) {
      setForm(toForm(animal));
      setErrors({});
    }
  }, [animal]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal || !form) return;

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

    const updated: Animal = {
      ...animal,
      name: form.name.trim(),
      breed: form.breed,
      ageYears: Number(form.ageYears),
      gender: form.gender,
      lactationStatus: form.lactationStatus,
      currentMilkYield: Number(form.currentMilkYield),
      healthStatus: form.healthStatus,
      lastVaccination: form.lastVaccination,
      nextCheckup: form.nextCheckup,
      notes: form.notes.trim(),
    };

    onSave(updated);
    toast({ title: "Animal record updated", description: `${updated.name} (${updated.id}) has been updated.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={!!animal} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit animal record</DialogTitle>
          <DialogDescription>
            Update details for {animal?.name} ({animal?.id}).
          </DialogDescription>
        </DialogHeader>
        {form && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Kaveri"
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-breed">Breed</Label>
                <Select value={form.breed} onValueChange={(v) => update("breed", v as Breed)}>
                  <SelectTrigger id="edit-breed">
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
                <Label htmlFor="edit-age">Age (years)</Label>
                <Input
                  id="edit-age"
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
                <Label htmlFor="edit-gender">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v as "Female" | "Male")}>
                  <SelectTrigger id="edit-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-lactationStatus">Lactation status</Label>
                <Select
                  value={form.lactationStatus}
                  onValueChange={(v) => update("lactationStatus", v as LactationStatus)}
                >
                  <SelectTrigger id="edit-lactationStatus">
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
                <Label htmlFor="edit-yield">Current milk yield (L/day)</Label>
                <Input
                  id="edit-yield"
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
                <Label htmlFor="edit-healthStatus">Health status</Label>
                <Select
                  value={form.healthStatus}
                  onValueChange={(v) => update("healthStatus", v as HealthStatus)}
                >
                  <SelectTrigger id="edit-healthStatus">
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
                <Label htmlFor="edit-lastVaccination">Last vaccination</Label>
                <Input
                  id="edit-lastVaccination"
                  type="date"
                  value={form.lastVaccination}
                  onChange={(e) => update("lastVaccination", e.target.value)}
                />
                {errors.lastVaccination && (
                  <p className="text-xs text-red-600">{errors.lastVaccination}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-nextCheckup">Next check-up</Label>
                <Input
                  id="edit-nextCheckup"
                  type="date"
                  value={form.nextCheckup}
                  onChange={(e) => update("nextCheckup", e.target.value)}
                />
                {errors.nextCheckup && <p className="text-xs text-red-600">{errors.nextCheckup}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any additional notes about this animal"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
