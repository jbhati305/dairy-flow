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
import type { InventoryItem, InventoryTransactionType } from "@/types";
import { TODAY } from "@/lib/date";

const transactionTypes: InventoryTransactionType[] = ["Stock In", "Consumed", "Wastage", "Expired", "Correction"];

const transactionHints: Record<InventoryTransactionType, string> = {
  "Stock In": "Adds to current stock (e.g. a delivery arrived).",
  Consumed: "Subtracts from current stock through routine use.",
  Wastage: "Subtracts stock lost to spillage or handling damage.",
  Expired: "Subtracts stock discarded past its expiry date.",
  Correction: "Sets a signed adjustment (+/-) to fix a count discrepancy.",
};

interface AdjustStockDialogProps {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (args: { transactionType: InventoryTransactionType; quantity: number; date: string; notes?: string; supplier?: string }) => void;
}

export function AdjustStockDialog({ item, onOpenChange, onSubmit }: AdjustStockDialogProps) {
  const [transactionType, setTransactionType] = useState<InventoryTransactionType>("Stock In");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(TODAY);
  const [notes, setNotes] = useState("");
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    if (item) {
      setTransactionType("Stock In");
      setQuantity("");
      setDate(TODAY);
      setNotes("");
      setSupplier(item.supplier);
    }
  }, [item]);

  if (!item) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!quantity || (transactionType !== "Correction" && qty <= 0)) return;
    onSubmit({ transactionType, quantity: qty, date, notes: notes.trim() || undefined, supplier: supplier.trim() || undefined });
  }

  const projectedStock =
    transactionType === "Stock In"
      ? item.currentStock + (Number(quantity) || 0)
      : transactionType === "Correction"
        ? item.currentStock + (Number(quantity) || 0)
        : Math.max(0, item.currentStock - (Number(quantity) || 0));

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock — {item.name}</DialogTitle>
          <DialogDescription>
            Current stock: {item.currentStock} {item.unit} · Minimum required: {item.minRequired} {item.unit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Transaction Type</Label>
            <Select value={transactionType} onValueChange={(v) => setTransactionType(v as InventoryTransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-500">{transactionHints[transactionType]}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">
                {transactionType === "Correction" ? `Adjustment (${item.unit})` : `Quantity (${item.unit})`}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={transactionType === "Correction" ? "e.g. -5 or 5" : "e.g. 50"}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="txn-date">Date</Label>
              <Input id="txn-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>

          {transactionType === "Stock In" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="supplier">Supplier (optional)</Label>
              <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context for this transaction" />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-25 p-3 text-sm">
            <span className="text-neutral-500">Projected stock after this transaction: </span>
            <span className="font-medium text-neutral-900">
              {projectedStock} {item.unit}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
