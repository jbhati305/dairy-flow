import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Stethoscope, Syringe, Heart, Milk, ClipboardPlus, CheckCircle2 } from "lucide-react";
import { HealthBadge, LactationBadge } from "./badges";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Animal, HealthEventType, Task } from "@/types";
import { formatDate } from "@/lib/date";

interface AnimalDetailsDialogProps {
  animal: Animal | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (animal: Animal) => void;
  onQuickAction: (type: "health" | "vaccination" | "breeding" | "yield", animal: Animal) => void;
  onCreateVetTask: (animal: Animal) => void;
  linkedTasks: Task[];
  onCompleteTask: (taskId: string) => void;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}

const eventTypeIcon: Record<HealthEventType, typeof Stethoscope> = {
  Vaccination: Syringe,
  "Veterinary Check": Stethoscope,
  Treatment: ClipboardPlus,
  Illness: Stethoscope,
  Recovery: CheckCircle2,
  "Breeding Event": Heart,
};

export function AnimalDetailsDialog({
  animal,
  onOpenChange,
  onEdit,
  onQuickAction,
  onCreateVetTask,
  linkedTasks,
  onCompleteTask,
}: AnimalDetailsDialogProps) {
  return (
    <Dialog open={!!animal} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-2xl">
        {animal && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback style={{ backgroundColor: animal.photoColor }} className="text-white">
                      {animal.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>
                      {animal.name} <span className="text-neutral-400 font-normal">· {animal.id}</span>
                    </DialogTitle>
                    <DialogDescription>{animal.breed}</DialogDescription>
                  </div>
                </div>
                {onEdit && (
                  <Button variant="secondary" size="sm" onClick={() => onEdit(animal)} aria-label={`Edit details for ${animal.name}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onQuickAction("health", animal)}>
                <Stethoscope className="h-3.5 w-3.5" />
                Log health event
              </Button>
              <Button size="sm" variant="outline" onClick={() => onQuickAction("vaccination", animal)}>
                <Syringe className="h-3.5 w-3.5" />
                Record vaccination
              </Button>
              <Button size="sm" variant="outline" onClick={() => onQuickAction("breeding", animal)}>
                <Heart className="h-3.5 w-3.5" />
                Add breeding event
              </Button>
              <Button size="sm" variant="outline" onClick={() => onQuickAction("yield", animal)}>
                <Milk className="h-3.5 w-3.5" />
                Record milk yield
              </Button>
              <Button size="sm" variant="outline" onClick={() => onCreateVetTask(animal)}>
                <ClipboardPlus className="h-3.5 w-3.5" />
                Create veterinary task
              </Button>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="breeding">Breeding</TabsTrigger>
                <TabsTrigger value="yield">Yield</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoField label="Animal ID" value={animal.id} />
                  <InfoField label="Breed" value={animal.breed} />
                  <InfoField label="Age" value={`${animal.ageYears} yrs`} />
                  <InfoField label="Gender" value={animal.gender} />
                  <InfoField label="Current yield" value={`${animal.currentMilkYield} L/day`} />
                  <InfoField label="Next check-up" value={formatDate(animal.nextCheckup)} />
                </div>
                <Separator />
                <div className="flex flex-wrap items-center gap-2">
                  <LactationBadge status={animal.lactationStatus} />
                  <HealthBadge status={animal.healthStatus} />
                </div>
                {animal.notes && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Notes</p>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{animal.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="health" className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Current status:</span>
                  <HealthBadge status={animal.healthStatus} />
                </div>

                {linkedTasks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-neutral-700 mb-2">Open tasks for this animal</p>
                    <ul className="flex flex-col gap-2">
                      {linkedTasks.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 p-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-900">{t.title}</p>
                            <p className="text-xs text-neutral-500">Due {formatDate(t.dueDate)}</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => onCompleteTask(t.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <Separator className="mt-3" />
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-neutral-700 mb-2">Health timeline</p>
                  {animal.healthHistory.length === 0 ? (
                    <p className="text-sm text-neutral-500">No health history recorded.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {animal.healthHistory.map((h) => {
                        const Icon = eventTypeIcon[h.type];
                        return (
                          <li key={h.id} className="flex gap-3 rounded-lg border border-neutral-200 p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="outline">{h.type}</Badge>
                                <span className="text-xs text-neutral-400">{formatDate(h.date)}</span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-neutral-900">{h.note}</p>
                              {h.vet && <p className="mt-0.5 text-xs text-neutral-500">Vet: {h.vet}</p>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-700 mb-2">Vaccination history</p>
                  {animal.vaccinationHistory.length === 0 ? (
                    <p className="text-sm text-neutral-500">No vaccination history recorded.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {animal.vaccinationHistory.map((v, i) => (
                        <li key={i} className="rounded-lg border border-neutral-200 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-neutral-900">{v.vaccine}</p>
                            <span className="text-xs text-neutral-400">{formatDate(v.date)}</span>
                          </div>
                          {v.nextDue && <p className="text-xs text-neutral-500 mt-1">Next due: {formatDate(v.nextDue)}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="breeding" className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Calving count" value={String(animal.breedingInfo.calvingCount)} />
                  {animal.breedingInfo.lastCalvingDate && (
                    <InfoField label="Last calving date" value={formatDate(animal.breedingInfo.lastCalvingDate)} />
                  )}
                  {animal.breedingInfo.expectedCalvingDate && (
                    <InfoField label="Expected calving date" value={formatDate(animal.breedingInfo.expectedCalvingDate)} />
                  )}
                  {animal.breedingInfo.inseminationDate && (
                    <InfoField label="Insemination date" value={formatDate(animal.breedingInfo.inseminationDate)} />
                  )}
                </div>
                {!animal.breedingInfo.lastCalvingDate &&
                  !animal.breedingInfo.expectedCalvingDate &&
                  !animal.breedingInfo.inseminationDate && (
                    <p className="text-sm text-neutral-500">No breeding records available.</p>
                  )}
              </TabsContent>

              <TabsContent value="yield">
                {animal.recentYield.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={animal.recentYield} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }} />
                        <YAxis tick={{ fontSize: 12, fill: "var(--color-neutral-500)" }} width={36} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid var(--color-neutral-200)",
                            fontSize: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="litres" stroke="var(--color-brand-600)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No yield data — not currently lactating.</p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
