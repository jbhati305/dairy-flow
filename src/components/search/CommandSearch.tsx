import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Beef, Package, Users, ListChecks, SearchX } from "lucide-react";
import { useAppData } from "@/store/AppDataContext";
import { cn } from "@/lib/utils";

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultGroup = {
  label: string;
  icon: typeof Beef;
  items: { id: string; title: string; subtitle: string; onSelect: () => void }[];
};

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const { state } = useAppData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const groups = useMemo<ResultGroup[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const animalMatches = state.animals
      .filter((a) => a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((a) => ({
        id: a.id,
        title: `${a.name} · ${a.id}`,
        subtitle: `${a.breed} · ${a.lactationStatus}`,
        onSelect: () => navigate(`/farm-records?open=${a.id}`),
      }));

    const inventoryMatches = state.inventory
      .filter((i) => i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q))
      .slice(0, 6)
      .map((i) => ({
        id: i.id,
        title: i.name,
        subtitle: `${i.category} · ${i.status}`,
        onSelect: () => navigate(`/inventory?open=${i.id}`),
      }));

    const leadMatches = state.leads
      .filter((l) => l.businessName.toLowerCase().includes(q) || l.contactPerson.toLowerCase().includes(q))
      .slice(0, 6)
      .map((l) => ({
        id: l.id,
        title: l.businessName,
        subtitle: `${l.buyerType} · ${l.stage}`,
        onSelect: () => navigate(`/leads?open=${l.id}`),
      }));

    const taskMatches = state.tasks
      .filter((t) => t.title.toLowerCase().includes(q) || t.relatedRecord.toLowerCase().includes(q))
      .slice(0, 6)
      .map((t) => ({
        id: t.id,
        title: t.title,
        subtitle: `${t.category} · ${t.status}`,
        onSelect: () => navigate(`/tasks?open=${t.id}`),
      }));

    return [
      { label: "Animals", icon: Beef, items: animalMatches },
      { label: "Inventory", icon: Package, items: inventoryMatches },
      { label: "Leads", icon: Users, items: leadMatches },
      { label: "Tasks", icon: ListChecks, items: taskMatches },
    ].filter((g) => g.items.length > 0);
  }, [query, state, navigate]);

  const hasQuery = query.trim().length > 0;
  const hasResults = groups.length > 0;

  function handleSelect(onSelect: () => void) {
    onSelect();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-lg gap-0 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search animals, inventory, leads, tasks..."
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin p-2">
          {!hasQuery && (
            <p className="px-3 py-8 text-center text-sm text-neutral-400">
              Start typing to search across animals, inventory, leads, and tasks.
            </p>
          )}
          {hasQuery && !hasResults && (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <SearchX className="h-6 w-6 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">No matches for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-400">Try an animal ID, item name, business name, or task title.</p>
            </div>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{group.label}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.onSelect)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none"
                  )}
                >
                  <group.icon className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-neutral-900">{item.title}</span>
                    <span className="block truncate text-xs text-neutral-500">{item.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
