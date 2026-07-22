import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  CalendarClock,
  Search,
  Plus,
  Pencil,
} from "lucide-react";
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
import { inventoryItems as initialInventoryItems } from "@/data/inventory";
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

function computeStatus(currentStock: number, minRequired: number, expiryDate: string | null): InventoryStatus {
  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minRequired) return "Low Stock";
  if (expiryDate) {
    const daysUntil = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntil >= 0 && daysUntil <= 30) return "Expiring Soon";
  }
  return "In Stock";
}

function formatExpiry(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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
  const [items, setItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [newStockValue, setNewStockValue] = useState("");

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAddOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, search, categoryFilter, statusFilter]);

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
      status: computeStatus(currentStock, minRequired, expiryDate),
    };
    setItems((prev) => [newItem, ...prev]);
    setAddOpen(false);
    resetForm();
    toast({ title: "Item added", description: `${newItem.name} has been added to inventory.`, variant: "success" });
  };

  const openUpdateDialog = (item: InventoryItem) => {
    setUpdateItem(item);
    setNewStockValue(String(item.currentStock));
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;
    const stockValue = Number(newStockValue);
    if (Number.isNaN(stockValue) || stockValue < 0) {
      toast({ title: "Enter a valid stock quantity", variant: "error" });
      return;
    }
    const status = computeStatus(stockValue, updateItem.minRequired, updateItem.expiryDate);
    setItems((prev) =>
      prev.map((i) => (i.id === updateItem.id ? { ...i, currentStock: stockValue, status } : i))
    );
    toast({ title: "Stock updated", description: `Stock updated for ${updateItem.name}.`, variant: "success" });
    setUpdateItem(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {attentionItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {attentionItems.length} item{attentionItems.length > 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {counts.out > 0 && `${counts.out} out of stock`}
              {counts.out > 0 && counts.low > 0 && ", "}
              {counts.low > 0 && `${counts.low} running low`}. Restock soon to avoid disruptions.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Current Stock</th>
                <th className="py-2 pr-4 font-medium">Unit</th>
                <th className="py-2 pr-4 font-medium">Min. Required</th>
                <th className="py-2 pr-4 font-medium">Supplier</th>
                <th className="py-2 pr-4 font-medium">Expiry Date</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-neutral-900">{item.name}</td>
                  <td className="py-3 pr-4 text-neutral-600">{item.category}</td>
                  <td className="py-3 pr-4 text-neutral-600">{item.currentStock}</td>
                  <td className="py-3 pr-4 text-neutral-600">{item.unit}</td>
                  <td className="py-3 pr-4 text-neutral-600">{item.minRequired}</td>
                  <td className="py-3 pr-4 text-neutral-600">{item.supplier}</td>
                  <td className="py-3 pr-4 text-neutral-600">{formatExpiry(item.expiryDate)}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={statusBadgeVariant[item.status]}>{item.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => openUpdateDialog(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Update Stock
                    </Button>
                  </td>
                </tr>
              ))}
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

      <Dialog open={!!updateItem} onOpenChange={(open) => !open && setUpdateItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {updateItem ? `Set the new stock quantity for ${updateItem.name}.` : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-stock">
                New Stock {updateItem ? `(${updateItem.unit})` : ""}
              </Label>
              <Input
                id="new-stock"
                type="number"
                min={0}
                value={newStockValue}
                onChange={(e) => setNewStockValue(e.target.value)}
                autoFocus
                required
              />
              {updateItem && (
                <p className="text-xs text-neutral-500">
                  Current: {updateItem.currentStock} {updateItem.unit} · Minimum required: {updateItem.minRequired}{" "}
                  {updateItem.unit}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpdateItem(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
