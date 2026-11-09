"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const MODES = [
  { value: "system", label: "System", icon: "bi-circle-half" },
  { value: "light", label: "Light", icon: "bi-sun" },
  { value: "dark", label: "Dark", icon: "bi-moon-stars" },
] as const;

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className={`theme-toggle-group ${className}`.trim()} aria-hidden>
        {MODES.map((mode) => (
          <span key={mode.value} className="theme-toggle-btn" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`theme-toggle-group ${className}`.trim()}
      role="group"
      aria-label="Color theme"
    >
      {MODES.map((mode) => {
        const selected = (theme ?? "system") === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            className={`theme-toggle-btn${selected ? " is-active" : ""}`}
            title={mode.label}
            aria-label={mode.label}
            aria-pressed={selected}
            onClick={() => setTheme(mode.value)}
          >
            <i className={`bi ${mode.icon}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
