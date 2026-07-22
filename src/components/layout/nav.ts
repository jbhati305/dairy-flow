import {
  LayoutDashboard,
  Beef,
  Milk,
  Package,
  Users,
  ListChecks,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Farm Records", path: "/farm-records", icon: Beef },
  { label: "Milk Production", path: "/milk-production", icon: Milk },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Tasks", path: "/tasks", icon: ListChecks },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];
