import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type {
  Animal,
  ActivityItem,
  HealthEventType,
  InventoryItem,
  InventoryTransaction,
  InventoryTransactionType,
  Lead,
  LeadStage,
  MilkProductionEntry,
  Task,
  TaskStatus,
  TrialOrderStatus,
} from "@/types";
import { allAnimals } from "@/data/animals";
import { milkProductionEntries } from "@/data/milkProduction";
import { inventoryItems, inventoryTransactions } from "@/data/inventory";
import { leads } from "@/data/leads";
import { tasks } from "@/data/tasks";
import { TODAY } from "@/lib/date";
import { computeInventoryStatus } from "./selectors";

export interface AppState {
  animals: Animal[];
  milkEntries: MilkProductionEntry[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  leads: Lead[];
  tasks: Task[];
  activity: ActivityItem[];
}

const STORAGE_KEY = "dairyflow.state";
const STORAGE_VERSION = 3;

function buildSeedState(): AppState {
  return {
    animals: allAnimals,
    milkEntries: milkProductionEntries,
    inventory: inventoryItems,
    inventoryTransactions,
    leads,
    tasks,
    activity: [
      { id: "AC-001", type: "milk", message: "Morning milk production logged for Gir Herd — 312 L", timestamp: `${TODAY}T07:15:00` },
      { id: "AC-002", type: "inventory", message: "Inventory stock updated: Concentrated Cattle Feed +200 kg", timestamp: `${TODAY}T06:40:00` },
      { id: "AC-003", type: "lead", message: "New buyer lead added: Riverside Cafe & Bistro", timestamp: "2026-07-21T19:10:00" },
      { id: "AC-004", type: "vaccination", message: "Vaccination completed for DF-106 · Meera (Brucellosis)", timestamp: "2026-07-21T15:30:00" },
      { id: "AC-005", type: "lead", message: 'Lead moved to "Visit Scheduled": The Grand Regal Hotel', timestamp: "2026-07-21T12:05:00" },
      { id: "AC-006", type: "task", message: "Task completed: Site visit for hotel supply", timestamp: "2026-07-20T17:45:00" },
    ],
  };
}

type Action =
  | { type: "ADD_ANIMAL"; animal: Animal }
  | { type: "UPDATE_ANIMAL"; animal: Animal }
  | {
      type: "ADD_HEALTH_EVENT";
      animalId: string;
      eventType: HealthEventType;
      note: string;
      vet?: string;
      date: string;
      newHealthStatus?: Animal["healthStatus"];
    }
  | { type: "RECORD_VACCINATION"; animalId: string; vaccine: string; date: string; nextDue?: string }
  | {
      type: "ADD_BREEDING_EVENT";
      animalId: string;
      date: string;
      note: string;
      field: "inseminationDate" | "lastCalvingDate" | "expectedCalvingDate";
      value: string;
    }
  | { type: "RECORD_ANIMAL_YIELD"; animalId: string; date: string; litres: number }
  | { type: "ADD_MILK_ENTRY"; entry: MilkProductionEntry }
  | { type: "ADD_INVENTORY_ITEM"; item: InventoryItem }
  | {
      type: "ADJUST_INVENTORY";
      itemId: string;
      transactionType: InventoryTransactionType;
      quantity: number;
      date: string;
      notes?: string;
      supplier?: string;
      relatedTaskId?: string;
    }
  | { type: "ADD_LEAD"; lead: Lead }
  | { type: "UPDATE_LEAD"; leadId: string; patch: Partial<Lead> }
  | { type: "MOVE_LEAD_STAGE"; leadId: string; stage: LeadStage }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK_STATUS"; taskId: string; status: TaskStatus }
  | { type: "UPDATE_TASK"; taskId: string; patch: Partial<Task> }
  | { type: "LOG_ACTIVITY"; item: ActivityItem }
  | { type: "RESET_DEMO_DATA" }
  | { type: "HYDRATE"; state: AppState };

function logActivity(activity: ActivityItem[], item: ActivityItem): ActivityItem[] {
  return [item, ...activity].slice(0, 25);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "RESET_DEMO_DATA":
      return buildSeedState();

    case "ADD_ANIMAL":
      return {
        ...state,
        animals: [action.animal, ...state.animals],
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "milk",
          message: `New animal record added: ${action.animal.name} (${action.animal.id})`,
          timestamp: new Date().toISOString(),
        }),
      };

    case "UPDATE_ANIMAL":
      return {
        ...state,
        animals: state.animals.map((a) => (a.id === action.animal.id ? action.animal : a)),
      };

    case "ADD_HEALTH_EVENT": {
      const animals = state.animals.map((a) => {
        if (a.id !== action.animalId) return a;
        return {
          ...a,
          healthStatus: action.newHealthStatus ?? a.healthStatus,
          healthHistory: [
            { id: `HE-${a.id}-${Date.now()}`, date: action.date, type: action.eventType, note: action.note, vet: action.vet },
            ...a.healthHistory,
          ],
        };
      });
      const animal = animals.find((a) => a.id === action.animalId);
      return {
        ...state,
        animals,
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "health",
          message: `${action.eventType} logged for ${animal?.name ?? action.animalId} (${action.animalId})`,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    case "RECORD_VACCINATION": {
      const animals = state.animals.map((a) => {
        if (a.id !== action.animalId) return a;
        return {
          ...a,
          lastVaccination: action.date,
          nextCheckup: action.nextDue ?? a.nextCheckup,
          vaccinationHistory: [{ date: action.date, vaccine: action.vaccine, nextDue: action.nextDue }, ...a.vaccinationHistory],
          healthHistory: [
            { id: `HE-${a.id}-${Date.now()}`, date: action.date, type: "Vaccination" as HealthEventType, note: `${action.vaccine} administered`, vet: undefined },
            ...a.healthHistory,
          ],
        };
      });
      const animal = animals.find((a) => a.id === action.animalId);
      return {
        ...state,
        animals,
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "vaccination",
          message: `Vaccination completed for ${animal?.name ?? action.animalId} (${action.vaccine})`,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    case "ADD_BREEDING_EVENT": {
      const animals = state.animals.map((a) => {
        if (a.id !== action.animalId) return a;
        return {
          ...a,
          breedingInfo: { ...a.breedingInfo, [action.field]: action.value },
          healthHistory: [
            { id: `HE-${a.id}-${Date.now()}`, date: action.date, type: "Breeding Event" as HealthEventType, note: action.note },
            ...a.healthHistory,
          ],
        };
      });
      return { ...state, animals };
    }

    case "RECORD_ANIMAL_YIELD": {
      const animals = state.animals.map((a) => {
        if (a.id !== action.animalId) return a;
        const recentYield = [...a.recentYield, { date: action.date, litres: action.litres }].slice(-7);
        return { ...a, currentMilkYield: action.litres, recentYield };
      });
      return { ...state, animals };
    }

    case "ADD_MILK_ENTRY":
      return {
        ...state,
        milkEntries: [action.entry, ...state.milkEntries],
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "milk",
          message: `${action.entry.herdGroup} — ${action.entry.morningYield + action.entry.eveningYield} L logged for ${action.entry.date}`,
          timestamp: new Date().toISOString(),
        }),
      };

    case "ADD_INVENTORY_ITEM":
      return {
        ...state,
        inventory: [action.item, ...state.inventory],
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "inventory",
          message: `New inventory item added: ${action.item.name}`,
          timestamp: new Date().toISOString(),
        }),
      };

    case "ADJUST_INVENTORY": {
      const item = state.inventory.find((i) => i.id === action.itemId);
      if (!item) return state;
      const delta =
        action.transactionType === "Stock In"
          ? action.quantity
          : action.transactionType === "Correction"
            ? action.quantity
            : -action.quantity;
      const newStock = Math.max(0, item.currentStock + delta);
      const updatedItem: InventoryItem = { ...item, currentStock: newStock, status: computeInventoryStatus({ ...item, currentStock: newStock }) };
      const transaction: InventoryTransaction = {
        id: `TXN-${action.itemId}-${Date.now()}`,
        itemId: action.itemId,
        type: action.transactionType,
        quantity: action.quantity,
        date: action.date,
        notes: action.notes,
        supplier: action.supplier,
        relatedTaskId: action.relatedTaskId,
      };
      return {
        ...state,
        inventory: state.inventory.map((i) => (i.id === action.itemId ? updatedItem : i)),
        inventoryTransactions: [transaction, ...state.inventoryTransactions],
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "inventory",
          message: `${action.transactionType} recorded for ${item.name}: ${action.quantity} ${item.unit}`,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    case "ADD_LEAD":
      return {
        ...state,
        leads: [action.lead, ...state.leads],
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "lead",
          message: `New buyer lead added: ${action.lead.businessName}`,
          timestamp: new Date().toISOString(),
        }),
      };

    case "UPDATE_LEAD":
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === action.leadId ? { ...l, ...action.patch } : l)),
      };

    case "MOVE_LEAD_STAGE": {
      const lead = state.leads.find((l) => l.id === action.leadId);
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === action.leadId ? { ...l, stage: action.stage } : l)),
        activity: logActivity(state.activity, {
          id: `AC-${Date.now()}`,
          type: "lead",
          message: `Lead moved to "${action.stage}": ${lead?.businessName ?? action.leadId}`,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    case "ADD_TASK":
      return { ...state, tasks: [action.task, ...state.tasks] };

    case "UPDATE_TASK_STATUS": {
      const task = state.tasks.find((t) => t.id === action.taskId);
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, status: action.status } : t)),
        activity:
          action.status === "Completed" && task
            ? logActivity(state.activity, {
                id: `AC-${Date.now()}`,
                type: "task",
                message: `Task completed: ${task.title}`,
                timestamp: new Date().toISOString(),
              })
            : state.activity,
      };
    }

    case "UPDATE_TASK":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, ...action.patch } : t)) };

    case "LOG_ACTIVITY":
      return { ...state, activity: logActivity(state.activity, action.item) };

    default:
      return state;
  }
}

function loadPersisted(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; state: AppState };
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

function persist(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
  } catch {
    // localStorage unavailable (private browsing, quota) — demo continues in-memory only.
  }
}

interface AppDataContextValue {
  state: AppState;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (animal: Animal) => void;
  addHealthEvent: (args: { animalId: string; eventType: HealthEventType; note: string; vet?: string; date: string; newHealthStatus?: Animal["healthStatus"] }) => void;
  recordVaccination: (args: { animalId: string; vaccine: string; date: string; nextDue?: string }) => void;
  addBreedingEvent: (args: { animalId: string; date: string; note: string; field: "inseminationDate" | "lastCalvingDate" | "expectedCalvingDate"; value: string }) => void;
  recordAnimalYield: (args: { animalId: string; date: string; litres: number }) => void;
  addMilkEntry: (entry: MilkProductionEntry) => void;
  addInventoryItem: (item: InventoryItem) => void;
  adjustInventory: (args: { itemId: string; transactionType: InventoryTransactionType; quantity: number; date: string; notes?: string; supplier?: string; relatedTaskId?: string }) => void;
  addLead: (lead: Lead) => void;
  updateLead: (leadId: string, patch: Partial<Lead>) => void;
  moveLeadStage: (leadId: string, stage: LeadStage) => void;
  markLeadContacted: (leadId: string) => void;
  markLeadTrialStatus: (leadId: string, status: TrialOrderStatus) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  resetDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadPersisted() ?? buildSeedState());

  useEffect(() => {
    persist(state);
  }, [state]);

  const addAnimal = useCallback((animal: Animal) => dispatch({ type: "ADD_ANIMAL", animal }), []);
  const updateAnimal = useCallback((animal: Animal) => dispatch({ type: "UPDATE_ANIMAL", animal }), []);
  const addHealthEvent = useCallback(
    (args: { animalId: string; eventType: HealthEventType; note: string; vet?: string; date: string; newHealthStatus?: Animal["healthStatus"] }) =>
      dispatch({ type: "ADD_HEALTH_EVENT", ...args }),
    []
  );
  const recordVaccination = useCallback(
    (args: { animalId: string; vaccine: string; date: string; nextDue?: string }) => dispatch({ type: "RECORD_VACCINATION", ...args }),
    []
  );
  const addBreedingEvent = useCallback(
    (args: { animalId: string; date: string; note: string; field: "inseminationDate" | "lastCalvingDate" | "expectedCalvingDate"; value: string }) =>
      dispatch({ type: "ADD_BREEDING_EVENT", ...args }),
    []
  );
  const recordAnimalYield = useCallback(
    (args: { animalId: string; date: string; litres: number }) => dispatch({ type: "RECORD_ANIMAL_YIELD", ...args }),
    []
  );
  const addMilkEntry = useCallback((entry: MilkProductionEntry) => dispatch({ type: "ADD_MILK_ENTRY", entry }), []);
  const addInventoryItem = useCallback((item: InventoryItem) => dispatch({ type: "ADD_INVENTORY_ITEM", item }), []);
  const adjustInventory = useCallback(
    (args: { itemId: string; transactionType: InventoryTransactionType; quantity: number; date: string; notes?: string; supplier?: string; relatedTaskId?: string }) =>
      dispatch({ type: "ADJUST_INVENTORY", ...args }),
    []
  );
  const addLead = useCallback((lead: Lead) => dispatch({ type: "ADD_LEAD", lead }), []);
  const updateLead = useCallback((leadId: string, patch: Partial<Lead>) => dispatch({ type: "UPDATE_LEAD", leadId, patch }), []);
  const moveLeadStage = useCallback((leadId: string, stage: LeadStage) => dispatch({ type: "MOVE_LEAD_STAGE", leadId, stage }), []);
  const markLeadContacted = useCallback(
    (leadId: string) => dispatch({ type: "UPDATE_LEAD", leadId, patch: { lastInteraction: TODAY } }),
    []
  );
  const markLeadTrialStatus = useCallback(
    (leadId: string, status: TrialOrderStatus) => dispatch({ type: "UPDATE_LEAD", leadId, patch: { trialOrderStatus: status } }),
    []
  );
  const addTask = useCallback((task: Task) => dispatch({ type: "ADD_TASK", task }), []);
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => dispatch({ type: "UPDATE_TASK_STATUS", taskId, status }), []);
  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => dispatch({ type: "UPDATE_TASK", taskId, patch }), []);
  const resetDemoData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dispatch({ type: "RESET_DEMO_DATA" });
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      state,
      addAnimal,
      updateAnimal,
      addHealthEvent,
      recordVaccination,
      addBreedingEvent,
      recordAnimalYield,
      addMilkEntry,
      addInventoryItem,
      adjustInventory,
      addLead,
      updateLead,
      moveLeadStage,
      markLeadContacted,
      markLeadTrialStatus,
      addTask,
      updateTaskStatus,
      updateTask,
      resetDemoData,
    }),
    [
      state,
      addAnimal,
      updateAnimal,
      addHealthEvent,
      recordVaccination,
      addBreedingEvent,
      recordAnimalYield,
      addMilkEntry,
      addInventoryItem,
      adjustInventory,
      addLead,
      updateLead,
      moveLeadStage,
      markLeadContacted,
      markLeadTrialStatus,
      addTask,
      updateTaskStatus,
      updateTask,
      resetDemoData,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
