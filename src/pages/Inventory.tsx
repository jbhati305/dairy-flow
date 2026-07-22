import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, Boxes, PackageX, CalendarClock, Search, Plus, SlidersHorizontal, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { StatCard } from "@/components/shared/StatCard";
import { AdjustStockDialog } from "@/components/inventory/AdjustStockDialog";
import { ItemDetailsDialog } from "@/components/inventory/ItemDetailsDialog";
import { useAppData } from "@/store/AppDataContext";
import { computeInventoryStatus } from "@/store/selectors";
import { daysUntil, formatDate, TODAY } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { InventoryCategory, InventoryItem, InventoryStatus } from "@/types";

const categories: InventoryCategory[] = [
  "Cattle Feed",
  "Supplements",
  "Medicines",
  "Vaccines",
  "Cleaning Supplies",
  "Dairy Equipment",
];

const statuses: InventoryStatus[] = ["In Stock", "Low Stock", "Out of Stock", "Expiring Soon"];

const statusBadgeVariant: Record<InventoryStatus, "success" | "warning" | "danger"> = {
  "In Stock": "success",
  "Low Stock": "warning",
  "Out of Stock": "danger",
  "Expiring Soon": "warning",
};

const emptyForm = {
  name: "",
  category: "Cattle Feed" as InventoryCategory,
  currentStock: "",
  unit: "",
  minRequired: "",
  supplier: "",
  expiryDate: "",
};

export default function Inventory() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, addInventoryItem, adjustInventory, addTask } = useAppData();
  const items = state.inventory;

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [attentionOnly, setAttentionOnly] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") setAddOpen(true);
    const openId = searchParams.get("open");
    if (openId) {
      const item = items.find((i) => i.id === openId);
      if (item) setViewItem(item);
    }
    if (searchParams.get("new") || openId) {
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attentionItems = useMemo(
    () => items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock"),
    [items]
  );

  const counts = useMemo(
    () => ({
      total: items.length,
      low: items.filter((i) => i.status === "Low Stock").length,
      out: items.filter((i) => i.status === "Out of Stock").length,
      expiring: items.filter((i) => i.status === "Expiring Soon").length,
    }),
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !q || item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesAttention = !attentionOnly || item.status === "Low Stock" || item.status === "Out of Stock" || item.status === "Expiring Soon";
      return matchesSearch && matchesCategory && matchesStatus && matchesAttention;
    });
  }, [items, search, categoryFilter, statusFilter, attentionOnly]);

  const resetForm = () => setForm(emptyForm);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStock = Number(form.currentStock);
    const minRequired = Number(form.minRequired);
    if (!form.name.trim() || !form.unit.trim() || !form.supplier.trim() || Number.isNaN(currentStock) || Number.isNaN(minRequired)) {
      toast({ title: "Please fill all required fields", variant: "error" });
      return;
    }
    const expiryDate = form.expiryDate ? form.expiryDate : null;
    const newItem: InventoryItem = {
      id: `INV-${String(items.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`,
      name: form.name.trim(),
      category: form.category,
      currentStock,
      unit: form.unit.trim(),
      minRequired,
      supplier: form.supplier.trim(),
      expiryDate,
      status: computeInventoryStatus({ currentStock, minRequired, expiryDate }),
    };
    addInventoryItem(newItem);
    setAddOpen(false);
    resetForm();
    toast({ title: "Item added", description: `${newItem.name} has been added to inventory.`, variant: "success" });
  };

  function handleAdjustSubmit(args: { transactionType: import("@/types").InventoryTransactionType; quantity: number; date: string; notes?: string; supplier?: string }) {
    if (!adjustItem) return;
    adjustInventory({ itemId: adjustItem.id, ...args });
    toast({ title: "Transaction recorded", description: `${args.transactionType} — ${adjustItem.name}.`, variant: "success" });
    setAdjustItem(null);
    setViewItem(null);
  }

  function handleCreateRestockTask(item: InventoryItem) {
    addTask({
      id: `TSK-${Date.now()}`,
      title: `Reorder ${item.name}`,
      category: "Inventory Purchase",
      relatedRecord: item.name,
      dueDate: TODAY,
      priority: item.status === "Out of Stock" ? "High" : "Medium",
      status: "Pending",
      linkedInventoryId: item.id,
    });
    toast({ title: "Restock task created", description: `Added to Tasks for ${item.name}.`, variant: "success" });
    setViewItem(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {attentionItems.length > 0 && (
        <button
          onClick={() => setAttentionOnly((v) => !v)}
          className={cn(
            "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
            attentionOnly ? "border-amber-300 bg-amber-100" : "border-amber-200 bg-amber-50 hover:bg-amber-100/70"
          )}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {attentionItems.length} item{attentionItems.length > 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {counts.out > 0 && `${counts.out} out of stock`}
              {counts.out > 0 && counts.low > 0 && ", "}
              {counts.low > 0 && `${counts.low} running low`}. {attentionOnly ? "Showing filtered list — click to clear." : "Click to filter the list below."}
            </p>
          </div>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Items" value={String(counts.total)} icon={Boxes} tone="brand" />
        <StatCard label="Low Stock" value={String(counts.low)} icon={AlertTriangle} tone="amber" />
        <StatCard label="Out of Stock" value={String(counts.out)} icon={PackageX} tone="red" />
        <StatCard label="Expiring Soon" value={String(counts.expiring)} icon={CalendarClock} tone="amber" />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search by name or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 font-medium">Stock level</th>
                <th className="py-2 pr-4 font-medium">Expiry</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const days = item.expiryDate ? daysUntil(item.expiryDate) : null;
                const dualRisk = item.status === "Low Stock" && item.expiryDate && days !== null && days <= 30;
                const atRisk = item.status === "Low Stock" || item.status === "Out of Stock" || item.status === "Expiring Soon" || dualRisk;
                const stockPercent = item.minRequired > 0 ? Math.min(100, Math.round((item.currentStock / item.minRequired) * 100)) : 100;
                const barColor = item.status === "Out of Stock" ? "bg-red-500" : item.status === "Low Stock" ? "bg-amber-500" : "bg-brand-600";
                return (
                  <tr
                    key={item.id}
                    onClick={() => setViewItem(item)}
                    className={cn(
                      "cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50",
                      atRisk && "bg-amber-50/40"
                    )}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.category}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-neutral-600 whitespace-nowrap">
                          {item.currentStock} / {item.minRequired} {item.unit}
                        </p>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-neutral-100">
                          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${stockPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-neutral-600">
                      {item.expiryDate ? (
                        <span className={days !== null && days <= 14 ? "font-medium text-red-600" : undefined}>
                          {formatDate(item.expiryDate)}
                          {days !== null && days >= 0 && ` (${days}d)`}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
                        {dualRisk && <Badge variant="danger">Also expiring</Badge>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)}>
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Adjust Stock
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600" aria-label={`More actions for ${item.name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setViewItem(item)}>
                              <Eye className="h-3.5 w-3.5" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleCreateRestockTask(item)}>Create restock task</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
              <p className="text-sm font-medium text-neutral-700">No items found</p>
              <p className="text-xs text-neutral-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to track in your inventory.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Mineral Mixture"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as InventoryCategory }))}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-unit">Unit</Label>
                <Input
                  id="item-unit"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="kg / litres / doses"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-stock">Current Stock</Label>
                <Input
                  id="item-stock"
                  type="number"
                  min={0}
                  value={form.currentStock}
                  onChange={(e) => setForm((f) => ({ ...f, currentStock: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-min">Minimum Required</Label>
                <Input
                  id="item-min"
                  type="number"
                  min={0}
                  value={form.minRequired}
                  onChange={(e) => setForm((f) => ({ ...f, minRequired: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-supplier">Supplier</Label>
                <Input
                  id="item-supplier"
                  value={form.supplier}
                  onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="item-expiry">Expiry Date (optional)</Label>
                <Input
                  id="item-expiry"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ItemDetailsDialog
        item={viewItem}
        transactions={state.inventoryTransactions}
        onOpenChange={(open) => !open && setViewItem(null)}
        onAdjustStock={(item) => {
          setAdjustItem(item);
        }}
        onCreateRestockTask={handleCreateRestockTask}
      />

      <AdjustStockDialog item={adjustItem} onOpenChange={(open) => !open && setAdjustItem(null)} onSubmit={handleAdjustSubmit} />
    </div>
  );
}
