import { NavLink } from "react-router-dom";
import { Milk, X } from "lucide-react";
import { navItems } from "./nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Milk className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900">
              DairyFlow
            </span>
          </div>
          <button
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-brand-50 font-medium text-brand-800"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JB</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">Jitesh Bhati</p>
              <p className="truncate text-xs text-neutral-400">Bhati Dairy Farm</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
