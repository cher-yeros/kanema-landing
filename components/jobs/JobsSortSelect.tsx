"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { JobsSort } from "@/lib/jobs-board-utils";

const SORT_OPTIONS: { value: JobsSort; label: string }[] = [
  { value: "best", label: "Best matches" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "fewest_applicants", label: "Fewest proposals" },
];

type Props = {
  value: JobsSort;
  onChange: (value: JobsSort) => void;
};

export function JobsSortSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const labelId = `${listboxId}-label`;
  const selected =
    SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="jobs-sort-select" ref={rootRef}>
      <span className="jobs-board__sort-label" id={labelId}>
        Sort by
      </span>
      <button
        type="button"
        className="jobs-sort-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected.label}</span>
        <i
          className={`bi bi-chevron-down jobs-sort-select__chevron${open ? " is-open" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listboxId}
          className="jobs-sort-select__menu"
          role="listbox"
          aria-labelledby={labelId}
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = value === option.value;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`jobs-sort-select__option${isSelected ? " is-selected" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <i className="bi bi-check-lg" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
