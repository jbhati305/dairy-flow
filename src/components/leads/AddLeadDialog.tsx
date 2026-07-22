import { useState } from "react";
import type { BuyerType, DeliveryTiming, Lead, LeadSource, LeadStage, ProductType, TrialOrderStatus } from "@/types";
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
import { TODAY } from "@/lib/date";

const buyerTypes: BuyerType[] = [
  "Retailer",
  "Hotel",
  "Restaurant",
  "Sweet Shop",
  "Distributor",
  "Housing Society",
  "Institutional Buyer",
];

const productTypes: ProductType[] = ["Cow Milk", "Buffalo Milk", "Mixed / Standardized", "A2 Cow Milk", "Ghee", "Paneer"];

const deliveryTimings: DeliveryTiming[] = ["Early Morning (5–7 AM)", "Morning (7–9 AM)", "Evening (5–7 PM)", "Flexible"];

const trialStatuses: TrialOrderStatus[] = ["Not Started", "Scheduled", "In Progress", "Completed", "Not Applicable"];

const leadSources: LeadSource[] = ["Referral", "Walk-in", "Phone Inquiry", "Website", "Field Visit", "Local Ad"];

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
  productType: "Mixed / Standardized" as ProductType,
  pricePerLitre: "14",
  deliveryLocation: "",
  deliveryDistanceKm: "",
  preferredDeliveryTiming: "Early Morning (5–7 AM)" as DeliveryTiming,
  trialOrderStatus: "Not Started" as TrialOrderStatus,
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

    const requiredQuantity = Number(form.requiredQuantity) || 0;
    const pricePerLitre = Number(form.pricePerLitre) || 0;

    const newLead: Lead = {
      id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: form.businessName.trim(),
      buyerType: form.buyerType,
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      requiredQuantity,
      productType: form.productType,
      pricePerLitre,
      estimatedMonthlyValue: Math.round(requiredQuantity * pricePerLitre * 30),
      deliveryLocation: form.deliveryLocation.trim() || "Jodhpur",
      deliveryDistanceKm: Number(form.deliveryDistanceKm) || 0,
      preferredDeliveryTiming: form.preferredDeliveryTiming,
      trialOrderStatus: form.trialOrderStatus,
      lastInteraction: TODAY,
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
      <DialogContent className="max-w-2xl">
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
            <Select value={form.buyerType} onValueChange={(v) => setForm((f) => ({ ...f, buyerType: v as BuyerType }))}>
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
            <Label>Product Type</Label>
            <Select value={form.productType} onValueChange={(v) => setForm((f) => ({ ...f, productType: v as ProductType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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
            <Label htmlFor="requiredQuantity">Required Litres / Day</Label>
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
            <Label htmlFor="pricePerLitre">Expected Price (₹/L)</Label>
            <Input
              id="pricePerLitre"
              type="number"
              min={0}
              step="0.5"
              value={form.pricePerLitre}
              onChange={(e) => setForm((f) => ({ ...f, pricePerLitre: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input
              id="deliveryLocation"
              value={form.deliveryLocation}
              onChange={(e) => setForm((f) => ({ ...f, deliveryLocation: e.target.value }))}
              placeholder="e.g. Sardarpura, Jodhpur"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryDistanceKm">Delivery Distance (km)</Label>
            <Input
              id="deliveryDistanceKm"
              type="number"
              min={0}
              value={form.deliveryDistanceKm}
              onChange={(e) => setForm((f) => ({ ...f, deliveryDistanceKm: e.target.value }))}
              placeholder="e.g. 8"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Preferred Delivery Timing</Label>
            <Select
              value={form.preferredDeliveryTiming}
              onValueChange={(v) => setForm((f) => ({ ...f, preferredDeliveryTiming: v as DeliveryTiming }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {deliveryTimings.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Trial Order Status</Label>
            <Select
              value={form.trialOrderStatus}
              onValueChange={(v) => setForm((f) => ({ ...f, trialOrderStatus: v as TrialOrderStatus }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trialStatuses.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v as LeadSource }))}>
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
            <Label>Stage</Label>
            <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v as LeadStage }))}>
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
