import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Mic, MicOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { kpis, alerts } from "@/data/dashboard";
import { herdSummary } from "@/data/animals";
import { inventoryItems } from "@/data/inventory";
import { leads, activeLeadsCount } from "@/data/leads";
import { tasks } from "@/data/tasks";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const TODAY = "2026-07-22";

function answerQuery(raw: string): string {
  const q = raw.toLowerCase();

  if (/(cattle|herd|animal|lactat|dry|pregnan|calv)/.test(q)) {
    return `Your herd has ${herdSummary.total} animals — ${herdSummary.lactating} lactating, ${herdSummary.dry} dry, ${herdSummary.pregnant} pregnant, ${herdSummary.calves} calves, and ${herdSummary.underTreatment} under treatment right now.`;
  }

  if (/(milk|yield|production|litre|liter)/.test(q)) {
    return `Today's milk production is ${kpis.milkToday.toLocaleString()} L, averaging ${kpis.avgYield} L per animal across ${herdSummary.lactating} lactating cattle.`;
  }

  if (/(low stock|inventory|stock|feed|medicine|vaccine)/.test(q)) {
    const low = inventoryItems.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock");
    if (low.length === 0) return "All inventory items are currently at healthy stock levels.";
    const names = low.slice(0, 4).map((i) => i.name).join(", ");
    return `${low.length} item(s) need attention: ${names}${low.length > 4 ? ", and more" : ""}. Check the Inventory page to restock.`;
  }

  if (/(lead|buyer|sales|customer|pipeline)/.test(q)) {
    const overdue = leads.filter((l) => l.nextFollowUp && l.nextFollowUp < TODAY && l.stage !== "Won" && l.stage !== "Lost");
    return `You have ${activeLeadsCount} active leads in the pipeline${
      overdue.length > 0 ? `, including ${overdue.length} with an overdue follow-up (e.g. ${overdue[0].businessName}).` : "."
    }`;
  }

  if (/(task|reminder|overdue|todo|to-do)/.test(q)) {
    const pending = tasks.filter((t) => t.status !== "Completed");
    const overdue = pending.filter((t) => t.dueDate < TODAY);
    return `There are ${pending.length} open tasks, ${overdue.length} of them overdue. Highest priority: "${
      pending.find((t) => t.priority === "High")?.title ?? pending[0]?.title ?? "none"
    }".`;
  }

  if (/(alert|attention|urgent|issue|problem)/.test(q)) {
    if (alerts.length === 0) return "No active alerts — everything looks normal today.";
    return `${alerts.length} things need attention right now, top of the list: "${alerts[0].message}".`;
  }

  if (/(hello|hi|hey)/.test(q)) {
    return "Hello! I can answer quick questions about your herd, milk production, inventory, leads, or tasks — what would you like to know?";
  }

  return "I can help with questions about your herd, milk production, inventory, leads, and tasks. Try asking, e.g. \"how's milk production today?\" or \"any low stock items?\"";
}

export function AssistantPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "Hi Jitesh — ask me anything about your farm's herd, production, inventory, leads, or tasks.",
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const reply = answerQuery(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: reply }]);
      setThinking(false);
    }, 500);
  };

  return (
    <Card className="flex h-[calc(100vh-8rem)] max-h-[720px] min-h-[420px] flex-col xl:sticky xl:top-20">
      <CardHeader className="flex-row items-center gap-2 space-y-0 border-b border-neutral-100 pb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <CardTitle>Farm Assistant</CardTitle>
          <CardDescription>Ask anything about your farm</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden pt-4">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto scrollbar-thin pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  m.role === "user"
                    ? "bg-brand-700 text-white"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-700"
                )}
              >
                {m.text}
              </div>
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
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-neutral-100 pt-3">
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
      </CardContent>
    </Card>
  );
}
