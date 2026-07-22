import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/store/AppDataContext";
import { TODAY, formatDate, addDays } from "@/lib/date";
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

function isOverdue(task: Task) {
  return task.dueDate < TODAY && task.status !== "Completed";
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

  const [groupFilter, setGroupFilter] = useState<"All" | "Overdue" | "Today" | "Upcoming" | "Completed">("All");
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

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => categoryFilter === "All" || t.category === categoryFilter)
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.relatedRecord.toLowerCase().includes(q))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, categoryFilter, search]);

  const next7 = addDays(TODAY, 7);
  const allGroups = useMemo(() => {
    const overdue: Task[] = [];
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];
    for (const t of filteredTasks) {
      if (t.status === "Completed") completed.push(t);
      else if (t.dueDate < TODAY) overdue.push(t);
      else if (t.dueDate === TODAY) today.push(t);
      else upcoming.push(t);
    }
    return { overdue, today, upcoming, completed };
  }, [filteredTasks, next7]);

  const groupTabs: { value: typeof groupFilter; label: string; count: number }[] = [
    { value: "All", label: "All", count: filteredTasks.length },
    { value: "Overdue", label: "Overdue", count: allGroups.overdue.length },
    { value: "Today", label: "Today", count: allGroups.today.length },
    { value: "Upcoming", label: "Upcoming", count: allGroups.upcoming.length },
    { value: "Completed", label: "Completed", count: allGroups.completed.length },
  ];

  const groups = useMemo(() => {
    const list =
      groupFilter === "All"
        ? [
            { label: "Overdue", tasks: allGroups.overdue },
            { label: "Today", tasks: allGroups.today },
            { label: "Upcoming", tasks: allGroups.upcoming },
            { label: "Completed", tasks: allGroups.completed },
          ]
        : [{ label: groupFilter, tasks: allGroups[groupFilter.toLowerCase() as "overdue" | "today" | "upcoming" | "completed"] }];
    return list.filter((g) => g.tasks.length > 0);
  }, [allGroups, groupFilter]);

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Tasks</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add task
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {groupTabs.map((g) => (
            <button
              key={g.value}
              onClick={() => setGroupFilter(g.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                groupFilter === g.value ? "bg-brand-50 font-medium text-brand-800" : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              {g.label} <span className="text-neutral-400">{g.count}</span>
            </button>
          ))}
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

      <div className="flex flex-col gap-5">
        {filteredTasks.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No tasks match your filters.</p>}
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-1.5 flex items-center gap-2">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  group.label === "Overdue" ? "text-red-600" : "text-neutral-400"
                )}
              >
                {group.label}
              </p>
              <span className="text-xs text-neutral-400">({group.tasks.length})</span>
            </div>
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100">
              {group.tasks.map((task) => {
                  const Icon = categoryIcons[task.category];
                  const overdue = isOverdue(task);
                  const completed = task.status === "Completed";
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex flex-col gap-2.5 p-3 transition-colors sm:flex-row sm:items-center sm:gap-4",
                        completed ? "bg-neutral-25" : "bg-white hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-3 p-1 -m-1">
                        <Checkbox
                          checked={completed}
                          onCheckedChange={() => toggleComplete(task)}
                          className="h-5 w-5"
                          aria-label={completed ? "Mark as pending" : "Mark as complete"}
                        />
                        <Icon className={cn("h-4 w-4 shrink-0", completed ? "text-neutral-300" : "text-neutral-400")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm font-medium", completed ? "text-neutral-400 line-through" : "text-neutral-900")}>
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">{task.relatedRecord}</p>
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
                        {task.priority === "High" && !completed && <Badge variant={priorityBadge[task.priority]}>High</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
