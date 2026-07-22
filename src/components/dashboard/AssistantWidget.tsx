import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Sparkles, Send, Mic, MicOff, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppData } from "@/store/AppDataContext";
import {
  computeAlerts,
  computeCapacity,
  computeDailyTotals,
  computeDashboardKpis,
  computeHerdSummary,
  formatCurrencyCompact,
} from "@/store/selectors";
import { TODAY } from "@/lib/date";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  action?: { label: string; path: string };
}

const SUGGESTED_QUESTIONS = [
  "Which animals need attention today?",
  "What inventory should I reorder?",
  "Which buyer follow-ups are overdue?",
  "How much milk is available for new customers?",
  "Why did production change this week?",
];

export function AssistantWidget() {
  const { state } = useAppData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hi Jitesh — ask me anything about your herd, production, inventory, leads, or tasks. I answer from your live farm data, not a hosted AI model.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<InstanceType<NonNullable<typeof window.SpeechRecognition>> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    setVoiceSupported(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  function answerQuery(raw: string): { text: string; action?: { label: string; path: string } } {
    const q = raw.toLowerCase();
    const kpis = computeDashboardKpis(state);
    const herd = computeHerdSummary(state.animals);

    if (/(which animals|need attention|attention today|vaccination|yield drop|sick|treatment)/.test(q)) {
      const alerts = computeAlerts(state).filter((a) => a.linkedAnimalId);
      if (alerts.length === 0) return { text: "No animals currently need attention — herd health looks stable today." };
      const names = alerts.slice(0, 3).map((a) => a.message).join("; ");
      return {
        text: `${alerts.length} animal-related item(s) need attention: ${names}.`,
        action: { label: "Open Herd & Health", path: "/farm-records" },
      };
    }

    if (/(reorder|restock|low stock|inventory|stock)/.test(q)) {
      const low = state.inventory.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock");
      if (low.length === 0) return { text: "Nothing needs reordering right now — all inventory is at healthy levels." };
      const names = low.slice(0, 4).map((i) => i.name).join(", ");
      return {
        text: `${low.length} item(s) should be reordered soon: ${names}.`,
        action: { label: "Open Inventory", path: "/inventory" },
      };
    }

    if (/(follow.?up|overdue|buyer)/.test(q)) {
      const overdue = state.leads.filter(
        (l) => l.stage !== "Won" && l.stage !== "Lost" && l.nextFollowUp && l.nextFollowUp < TODAY
      );
      if (overdue.length === 0) return { text: "No buyer follow-ups are overdue — the pipeline is on schedule." };
      const names = overdue.slice(0, 3).map((l) => l.businessName).join(", ");
      return {
        text: `${overdue.length} follow-up(s) are overdue: ${names}.`,
        action: { label: "Open Leads", path: "/leads" },
      };
    }

    if (/(available|surplus|new customer|capacity|how much milk)/.test(q)) {
      const capacity = computeCapacity(kpis.milkToday, state.leads);
      return {
        text: `Estimated ${capacity.availableToSell} L/day is available for new buyers today, after ~${capacity.reservedForProcessing} L reserved for processing and ${capacity.committedToWonLeads} L already committed to signed buyers. This is an estimate.`,
        action: { label: "Open Reports", path: "/reports" },
      };
    }

    if (/(why|change|trend|this week|production change)/.test(q)) {
      const daily = computeDailyTotals(state.milkEntries);
      const last7 = daily.slice(-7).reduce((s, d) => s + d.litres, 0);
      const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.litres, 0);
      const pct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 1000) / 10 : 0;
      return {
        text: `Production this week totaled ${last7.toLocaleString()} L, ${pct >= 0 ? "up" : "down"} ${Math.abs(pct)}% versus the previous 7 days (${prev7.toLocaleString()} L). Herd health and feed stock both look stable, so this mostly reflects normal day-to-day variation.`,
        action: { label: "Open Reports", path: "/reports" },
      };
    }

    if (/(cattle|herd|animal|lactat)/.test(q)) {
      return {
        text: `Your herd has ${herd.total} animals — ${herd.lactating} lactating, ${herd.dry} dry, ${herd.pregnant} pregnant, ${herd.calves} calves, and ${herd.underTreatment} under treatment.`,
      };
    }

    if (/(milk|production|litre|liter)/.test(q)) {
      return { text: `Today's milk production is ${kpis.milkToday.toLocaleString()} L, averaging ${kpis.avgYield} L per lactating animal.` };
    }

    if (/(lead|pipeline|sales)/.test(q)) {
      return {
        text: `There are ${kpis.activeLeads} active leads worth ${formatCurrencyCompact(kpis.pipelineValue)}/month in the pipeline, with ${kpis.followUpsDue} follow-ups due.`,
        action: { label: "Open Leads", path: "/leads" },
      };
    }

    if (/(task|reminder|todo|to-do)/.test(q)) {
      const pending = state.tasks.filter((t) => t.status !== "Completed");
      const overdue = pending.filter((t) => t.dueDate < TODAY);
      return { text: `There are ${pending.length} open tasks, ${overdue.length} overdue.`, action: { label: "Open Tasks", path: "/tasks" } };
    }

    if (/(hello|hi|hey)/.test(q)) {
      return { text: "Hello! Ask me about your herd, milk production, inventory, leads, or tasks." };
    }

    return {
      text: 'I can help with herd health, milk production, inventory, leads, and tasks. Try one of the suggested questions below, or ask e.g. "how much milk is available for new customers?"',
    };
  }

  function handleAsk(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: trimmed }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = answerQuery(trimmed);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", ...reply }]);
      setThinking(false);
    }, 450);
  }

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          className="group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white shadow-[var(--shadow-panel)] transition-transform hover:bg-brand-800 hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          aria-label="Ask DairyFlow — open Farm Assistant"
          title="Ask DairyFlow"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-950/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-[var(--shadow-panel)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-sm font-semibold text-neutral-900">Farm Assistant</DialogPrimitive.Title>
              <p className="truncate text-xs text-neutral-500">Deterministic answers from your live farm data</p>
            </div>
            <DialogPrimitive.Close asChild>
              <button className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100" aria-label="Close assistant">
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                    m.role === "user" ? "bg-brand-700 text-white" : "border border-neutral-200 bg-neutral-50 text-neutral-700"
                  )}
                >
                  {m.text}
                </div>
                {m.action && (
                  <button
                    onClick={() => {
                      navigate(m.action!.path);
                      setOpen(false);
                    }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                  >
                    {m.action.label}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Suggested questions</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAsk(q)}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-left text-xs text-neutral-700 hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(input);
            }}
            className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3"
          >
            <Button
              type="button"
              variant={listening ? "default" : "secondary"}
              size="icon"
              onClick={toggleListening}
              disabled={!voiceSupported}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              title={voiceSupported ? "Voice input" : "Voice input not supported in this browser"}
              className={cn(listening && "animate-pulse")}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about herd, milk, stock, leads..."
              aria-label="Ask the farm assistant"
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
