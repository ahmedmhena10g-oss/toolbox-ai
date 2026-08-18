"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { uid } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = (): ToastContextValue => useContext(ToastContext);

const icons: Record<ToastType, ReactNode> = {
  success: <Check className="h-4 w-4 text-emerald-500" aria-hidden />,
  error: <AlertTriangle className="h-4 w-4 text-red-500" aria-hidden />,
  info: <Info className="h-4 w-4 text-brand-500" aria-hidden />,
};

const iconBg: Record<ToastType, string> = {
  success: "bg-emerald-50 dark:bg-emerald-500/10",
  error: "bg-red-50 dark:bg-red-500/10",
  info: "bg-brand-50 dark:bg-brand-500/10",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = uid();
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-panel dark:border-slate-700 dark:bg-slate-800"
          >
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${iconBg[t.type]}`}>
              {icons[t.type]}
            </span>
            <p className="flex-1 text-sm leading-snug text-slate-700 dark:text-slate-200">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
