import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = {
    toast: addToast,
    success: (message: string, duration?: number) => addToast(message, "success", duration),
    error: (message: string, duration?: number) => addToast(message, "error", duration),
    info: (message: string, duration?: number) => addToast(message, "info", duration),
    warning: (message: string, duration?: number) => addToast(message, "warning", duration),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
        <style>{`
          @keyframes toast-slide-in {
            from {
              transform: translateY(1rem) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          @keyframes toast-progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          .animate-toast-in {
            animation: toast-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .animate-toast-progress {
            animation: toast-progress linear forwards;
          }
        `}</style>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0" />,
      border: "border-brand-accent/30",
      progressBg: "bg-brand-accent shadow-[0_0_8px_#C1FF00]",
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
      border: "border-red-500/30",
      progressBg: "bg-red-500",
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
      border: "border-sky-500/30",
      progressBg: "bg-sky-500",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      border: "border-amber-500/30",
      progressBg: "bg-amber-500",
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div className={`pointer-events-auto relative overflow-hidden flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border bg-brand-surface/95 backdrop-blur-md shadow-2xl transition-all duration-300 transform animate-toast-in ${config.border}`}>
      <div className="flex items-center gap-3">
        {config.icon}
        <span className="text-xs font-bold text-white tracking-wide">{toast.message}</span>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-brand-muted hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div
          className={`h-full ${config.progressBg} animate-toast-progress`}
          style={{
            animationDuration: `${toast.duration || 3000}ms`
          }}
        />
      </div>
    </div>
  );
}
