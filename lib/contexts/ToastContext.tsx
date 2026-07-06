"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  type: ToastType;
  message: string;
  id: number;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

// Icônes lucide-react pour chaque type de notification — remplace les anciens emojis
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />,
};

const BORDER_COLORS: Record<ToastType, string> = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  warning: "border-l-yellow-500",
  info: "border-l-blue-500",
};

const DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 5000,
  warning: 5000,
  info: 3500,
};

const MAX_VISIBLE = 3;

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-xl ${
        BORDER_COLORS[toast.type]
      } border-l-[4px] ${
        toast.exiting ? "animate-toastExit" : "animate-toastSlideUp"
      }`}
    >
      <span className="mt-0.5 shrink-0 leading-none" aria-hidden="true">
        {ICONS[toast.type]}
      </span>
      <p className="min-w-0 flex-1 text-sm text-primary leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-zinc-100 hover:text-primary"
        aria-label="Fermer"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextIdRef.current++;
      setToasts((prev) => {
        const next = [...prev, { type, message, id }];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
      const timer = setTimeout(() => dismiss(id), DURATIONS[type]);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const success = useCallback((msg: string) => showToast("success", msg), [showToast]);
  const error = useCallback((msg: string) => showToast("error", msg), [showToast]);
  const warning = useCallback((msg: string) => showToast("warning", msg), [showToast]);
  const info = useCallback((msg: string) => showToast("info", msg), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-8 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col-reverse gap-2.5 sm:left-8 sm:max-w-xs sm:translate-x-0"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <ToastCard toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
