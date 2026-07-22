import { useState } from "react";
import type { BuyerType, Lead, LeadSource, LeadStage } from "@/types";
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

const buyerTypes: BuyerType[] = [
  "Retailer",
  "Hotel",
  "Restaurant",
  "Sweet Shop",
  "Distributor",
  "Housing Society",
  "Institutional Buyer",
];

const leadSources: LeadSource[] = [
  "Referral",
  "Walk-in",
  "Phone Inquiry",
  "Website",
  "Field Visit",
  "Local Ad",
];

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: LeadStage[];
  onAdd: (lead: Lead) => void;
}

const emptyForm = {
  businessName: "",
  buyerType: "Retailer" as BuyerType,
  contactPerson: "",
  phone: "",
  requiredQuantity: "",
  estimatedMonthlyValue: "",
  source: "Referral" as LeadSource,
  stage: "New Inquiry" as LeadStage,
  nextFollowUp: "",
  notes: "",
};

export function AddLeadDialog({ open, onOpenChange, stages, onAdd }: AddLeadDialogProps) {
  const [form, setForm] = useState(emptyForm);

  function reset() {
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactPerson.trim()) return;

    const newLead: Lead = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: form.businessName.trim(),
      buyerType: form.buyerType,
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      requiredQuantity: Number(form.requiredQuantity) || 0,
      estimatedMonthlyValue: Number(form.estimatedMonthlyValue) || 0,
      lastInteraction: new Date().toISOString().slice(0, 10),
      nextFollowUp: form.nextFollowUp || null,
      source: form.source,
      stage: form.stage,
      notes: form.notes.trim(),
    };

    onAdd(newLead);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
          <DialogDescription>Capture a new sales inquiry into the pipeline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              placeholder="e.g. City Fresh Retail Mart"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Buyer Type</Label>
            <Select
              value={form.buyerType}
              onValueChange={(v) => setForm((f) => ({ ...f, buyerType: v as BuyerType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buyerTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select
              value={form.source}
              onValueChange={(v) => setForm((f) => ({ ...f, source: v as LeadSource }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leadSources.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={form.contactPerson}
              onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="requiredQuantity">Required Quantity (L/day)</Label>
            <Input
              id="requiredQuantity"
              type="number"
              min={0}
              value={form.requiredQuantity}
              onChange={(e) => setForm((f) => ({ ...f, requiredQuantity: e.target.value }))}
              placeholder="e.g. 150"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estimatedMonthlyValue">Est. Monthly Value (₹)</Label>
            <Input
              id="estimatedMonthlyValue"
              type="number"
              min={0}
              value={form.estimatedMonthlyValue}
              onChange={(e) => setForm((f) => ({ ...f, estimatedMonthlyValue: e.target.value }))}
              placeholder="e.g. 63000"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select
              value={form.stage}
              onValueChange={(v) => setForm((f) => ({ ...f, stage: v as LeadStage }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextFollowUp">Next Follow-up (optional)</Label>
            <Input
              id="nextFollowUp"
              type="date"
              value={form.nextFollowUp}
              onChange={(e) => setForm((f) => ({ ...f, nextFollowUp: e.target.value }))}
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any relevant context..."
            />
          </div>

          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
