"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apolloErrorMessage } from "@/lib/apollo-error";

type ToastType = "error" | "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ForumToastContextValue = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showApolloError: (err: unknown, fallback: string) => void;
};

const ForumToastContext = createContext<ForumToastContextValue | null>(null);

const TOAST_DURATION_MS = 5200;

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return <i className="bi bi-check-circle-fill forum-toast__icon text-success" />;
  }
  if (type === "info") {
    return <i className="bi bi-info-circle-fill forum-toast__icon text-info" />;
  }
  return <i className="bi bi-exclamation-triangle-fill forum-toast__icon text-danger" />;
}

export function ForumToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, type: ToastType) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, message: trimmed, type }]);
  }, []);

  const value = useMemo<ForumToastContextValue>(
    () => ({
      showError: (message) => push(message, "error"),
      showSuccess: (message) => push(message, "success"),
      showInfo: (message) => push(message, "info"),
      showApolloError: (err, fallback) =>
        push(apolloErrorMessage(err, fallback), "error"),
    }),
    [push],
  );

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismiss(toast.id), TOAST_DURATION_MS),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, dismiss]);

  return (
    <ForumToastContext.Provider value={value}>
      {children}
      <div className="forum-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`forum-toast forum-toast--${toast.type}`}
            role={toast.type === "error" ? "alert" : "status"}
          >
            <ToastIcon type={toast.type} />
            <p className="forum-toast__message mb-0">{toast.message}</p>
            <button
              type="button"
              className="forum-toast__close"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
      </div>
    </ForumToastContext.Provider>
  );
}

export function useForumToast(): ForumToastContextValue {
  const ctx = useContext(ForumToastContext);
  if (!ctx) {
    throw new Error("useForumToast must be used within ForumToastProvider");
  }
  return ctx;
}
