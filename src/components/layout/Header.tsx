import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Plus, ChevronDown } from "lucide-react";
import { navItems } from "./nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { alerts } from "@/data/dashboard";
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
  const [search, setSearch] = useState("");

  const title = useMemo(() => {
    const match = navItems.find((item) =>
      item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
    );
    return match?.label ?? "Dashboard";
  }, [location.pathname]);

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

      <div className="relative ml-2 hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search animals, leads, inventory..."
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
              aria-label="Notifications"
            >
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
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Jitesh Bhati</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Account settings</DropdownMenuItem>
            <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
