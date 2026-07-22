import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { InventoryItem, InventoryStatus, InventoryTransaction } from "@/types";
import { formatDate, daysUntil } from "@/lib/date";

const statusBadgeVariant: Record<InventoryStatus, "success" | "warning" | "danger"> = {
  "In Stock": "success",
  "Low Stock": "warning",
  "Out of Stock": "danger",
  "Expiring Soon": "warning",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  );
}

interface ItemDetailsDialogProps {
  item: InventoryItem | null;
  transactions: InventoryTransaction[];
  onOpenChange: (open: boolean) => void;
  onAdjustStock: (item: InventoryItem) => void;
  onCreateRestockTask: (item: InventoryItem) => void;
}

export function ItemDetailsDialog({ item, transactions, onOpenChange, onAdjustStock, onCreateRestockTask }: ItemDetailsDialogProps) {
  if (!item) return null;
  const recentTxns = transactions
    .filter((t) => t.itemId === item.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
  const expiringDays = item.expiryDate ? daysUntil(item.expiryDate) : null;
  const needsAttention = item.status === "Low Stock" || item.status === "Out of Stock";

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{item.name}</DialogTitle>
            <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
          </div>
          <DialogDescription>{item.category}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Current Stock" value={`${item.currentStock} ${item.unit}`} />
          <Field label="Minimum Required" value={`${item.minRequired} ${item.unit}`} />
          <Field label="Supplier" value={item.supplier} />
          <Field
            label="Expiry"
            value={
              item.expiryDate
                ? `${formatDate(item.expiryDate)}${expiringDays !== null && expiringDays >= 0 ? ` (${expiringDays}d left)` : ""}`
                : "No expiry"
            }
          />
        </div>

        {item.status === "Expiring Soon" && item.currentStock <= item.minRequired * 1.3 && (
          <p className="rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-700">
            Also running low on stock — restocking soon avoids both an expiry write-off and a shortage.
          </p>
        )}

        <Separator />

        <div>
          <p className="mb-2 text-xs font-medium text-neutral-700">Recent transactions</p>
          {recentTxns.length === 0 ? (
            <p className="text-sm text-neutral-500">No transactions recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recentTxns.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-1.5 text-xs">
                  <span className="text-neutral-700">
                    {t.type} · {t.quantity} {item.unit}
                  </span>
                  <span className="text-neutral-400">{formatDate(t.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {needsAttention ? (
            <Button variant="secondary" onClick={() => onCreateRestockTask(item)}>
              Create restock task
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={() => onAdjustStock(item)}>Adjust Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
