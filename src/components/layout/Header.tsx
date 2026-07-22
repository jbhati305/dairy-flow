import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Plus, ChevronDown, RotateCcw } from "lucide-react";
import { navItems } from "./nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CommandSearch } from "@/components/search/CommandSearch";
import { useAppData } from "@/store/AppDataContext";
import { computeAlerts } from "@/store/selectors";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

const addActions = [
  { label: "Record milk production", path: "/milk-production" },
  { label: "Add cattle record", path: "/farm-records" },
  { label: "Update inventory", path: "/inventory" },
  { label: "Add lead", path: "/leads" },
];

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
};

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, resetDemoData } = useAppData();
  const { toast } = useToast();
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const alerts = useMemo(() => computeAlerts(state), [state]);

  const title = useMemo(() => {
    const match = navItems.find((item) =>
      item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
    );
    return match?.label ?? "Dashboard";
  }, [location.pathname]);

  function handleReset() {
    resetDemoData();
    setResetOpen(false);
    toast({ title: "Demo data reset", description: "All records restored to their original state.", variant: "success" });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button
        className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base font-semibold text-neutral-900 whitespace-nowrap">{title}</h1>

      <button
        onClick={() => setSearchOpen(true)}
        className="relative ml-2 hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-left text-sm text-neutral-400 shadow-sm hover:border-neutral-400 md:flex"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1">Search animals, inventory, leads, tasks...</span>
        <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 md:hidden"
          aria-label="Search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Notifications">
              <Bell className="h-4.5 w-4.5" />
              {alerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              <p className="text-xs text-neutral-500">{alerts.length} items need attention</p>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {alerts.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-neutral-400">Nothing needs attention right now.</p>
              )}
              {alerts.map((a) => (
                <div key={a.id} className="flex gap-2.5 border-b border-neutral-50 px-4 py-2.5 last:border-0">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", severityDot[a.severity])} />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-800 leading-snug">{a.message}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-400">{a.module}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Record</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {addActions.map((a) => (
              <DropdownMenuItem key={a.path} onSelect={() => navigate(`${a.path}?new=1`)}>
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500" aria-label="User menu">
              <Avatar>
                <AvatarFallback>JB</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Jitesh Bhati</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Account settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setResetOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>
              This clears every change you&apos;ve made in this browser (animals, milk records, inventory, leads, and tasks)
              and restores the original demo dataset. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
