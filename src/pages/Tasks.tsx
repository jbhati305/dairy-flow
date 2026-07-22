import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  AlertTriangle,
  Flag,
  CheckCircle2,
  Plus,
  Search,
  Stethoscope,
  Syringe,
  Heart,
  Package,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/shared/StatCard";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/store/AppDataContext";
import { computeOverdueTasks } from "@/store/selectors";
import { TODAY, formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Task, TaskCategory, TaskPriority, TaskStatus } from "@/types";

const categories: TaskCategory[] = [
  "Veterinary Visit",
  "Vaccination",
  "Breeding Follow-up",
  "Inventory Purchase",
  "Buyer Follow-up",
  "Equipment Maintenance",
];

const priorities: TaskPriority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In Progress", "Completed"];

const categoryIcons: Record<TaskCategory, LucideIcon> = {
  "Veterinary Visit": Stethoscope,
  Vaccination: Syringe,
  "Breeding Follow-up": Heart,
  "Inventory Purchase": Package,
  "Buyer Follow-up": Users,
  "Equipment Maintenance": Wrench,
};

const priorityBadge: Record<TaskPriority, "danger" | "warning" | "neutral"> = {
  High: "danger",
  Medium: "warning",
  Low: "neutral",
};

const statusBadge: Record<TaskStatus, "warning" | "info" | "success"> = {
  Pending: "warning",
  "In Progress": "info",
  Completed: "success",
};

function isOverdue(task: Task) {
  return task.dueDate < TODAY && task.status !== "Completed";
}

function startOfWeek(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

interface NewTaskForm {
  title: string;
  category: TaskCategory;
  relatedRecord: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const emptyForm: NewTaskForm = {
  title: "",
  category: "Veterinary Visit",
  relatedRecord: "",
  dueDate: TODAY,
  priority: "Medium",
  status: "Pending",
};

export default function Tasks() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, addTask, updateTaskStatus } = useAppData();
  const tasks = state.tasks;

  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState<"All" | TaskCategory>("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewTaskForm>(emptyForm);

  useEffect(() => {
    const openId = searchParams.get("open");
    if (openId) {
      const task = tasks.find((t) => t.id === openId);
      if (task) setSearch(task.title);
      const next = new URLSearchParams(searchParams);
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const overdue = computeOverdueTasks(tasks).length;
    const highPriority = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;
    const weekStart = startOfWeek(TODAY);
    const completedThisWeek = tasks.filter(
      (t) => t.status === "Completed" && new Date(t.dueDate + "T00:00:00") >= weekStart
    ).length;
    return { pending, overdue, highPriority, completedThisWeek };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => statusFilter === "All" || t.status === statusFilter)
      .filter((t) => categoryFilter === "All" || t.category === categoryFilter)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.relatedRecord.toLowerCase().includes(q))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, statusFilter, categoryFilter, search]);

  function toggleComplete(task: Task) {
    const nextStatus: TaskStatus = task.status === "Completed" ? "Pending" : "Completed";
    updateTaskStatus(task.id, nextStatus);
    toast({
      title: nextStatus === "Completed" ? "Task marked complete" : "Task marked pending",
      description: task.title,
      variant: "success",
    });
  }

  function handleAddTask() {
    if (!form.title.trim() || !form.relatedRecord.trim() || !form.dueDate) return;
    const newTask: Task = {
      id: `TSK-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      relatedRecord: form.relatedRecord.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
    };
    addTask(newTask);
    setForm(emptyForm);
    setDialogOpen(false);
    toast({ title: "Task added", description: newTask.title, variant: "success" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Tasks & Reminders</h2>
          <p className="text-sm text-neutral-500">Track vet visits, vaccinations, follow-ups, and more.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
              <DialogDescription>Create a new task or reminder.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Vaccination follow-up"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as TaskCategory }))}>
                    <SelectTrigger>
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
                  <Label htmlFor="relatedRecord">Related Record</Label>
                  <Input
                    id="relatedRecord"
                    placeholder="e.g. DF-104 · Radha"
                    value={form.relatedRecord}
                    onChange={(e) => setForm((f) => ({ ...f, relatedRecord: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TaskPriority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending Tasks" value={stats.pending.toString()} icon={ClipboardList} tone="brand" />
        <StatCard label="Overdue" value={stats.overdue.toString()} icon={AlertTriangle} tone="red" />
        <StatCard label="High Priority" value={stats.highPriority.toString()} icon={Flag} tone="amber" />
        <StatCard label="Completed This Week" value={stats.completedThisWeek.toString()} icon={CheckCircle2} tone="brand" />
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>{filteredTasks.length} of {tasks.length} tasks shown</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search title or record..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 sm:w-56"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as "All" | TaskCategory)}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as "All" | TaskStatus)}>
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="In Progress">In Progress</TabsTrigger>
              <TabsTrigger value="Completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {filteredTasks.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No tasks match your filters.</p>}
          {filteredTasks.map((task) => {
            const Icon = categoryIcons[task.category];
            const overdue = isOverdue(task);
            const completed = task.status === "Completed";
            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-neutral-100 p-3 transition-colors sm:flex-row sm:items-center sm:gap-4",
                  completed ? "bg-neutral-25" : "bg-white hover:border-neutral-200"
                )}
              >
                <div className="flex items-center gap-3 sm:pt-0">
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => toggleComplete(task)}
                    aria-label={completed ? "Mark as pending" : "Mark as complete"}
                  />
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      completed ? "bg-neutral-100 text-neutral-400" : "bg-brand-50 text-brand-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", completed ? "text-neutral-400 line-through" : "text-neutral-900")}>
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {task.category} · {task.relatedRecord}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      overdue ? "text-red-600" : completed ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    {formatDate(task.dueDate)}
                  </span>
                  <Badge variant={priorityBadge[task.priority]}>{task.priority}</Badge>
                  <Badge variant={statusBadge[task.status]}>{task.status}</Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
