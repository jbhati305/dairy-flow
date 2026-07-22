import * as React from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const variantConfig: Record<ToastVariant, { icon: React.ElementType; classes: string }> = {
  success: { icon: CheckCircle2, classes: "text-brand-700 bg-brand-50 border-brand-200" },
  info: { icon: Info, classes: "text-blue-600 bg-blue-50 border-blue-100" },
  warning: { icon: AlertTriangle, classes: "text-amber-600 bg-amber-50 border-amber-100" },
  error: { icon: AlertTriangle, classes: "text-red-600 bg-red-50 border-red-100" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = "success" }: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3800);
    },
    []
  );

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const cfg = variantConfig[t.variant];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-white p-3 shadow-[var(--shadow-panel)] animate-in slide-in-from-bottom-2 fade-in",
                "border-neutral-200"
              )}
              role="status"
            >
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full border", cfg.classes)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-neutral-400 hover:text-neutral-600"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
