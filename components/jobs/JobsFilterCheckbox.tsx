"use client";

import "@/components/jobs/jobs-filter-checkbox.css";

type Props = {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

export function JobsFilterCheckbox({
  checked,
  onChange,
  children,
  disabled = false,
}: Props) {
  return (
    <label
      className={`jobs-filter-check${disabled ? " is-disabled" : ""}`}
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        className="jobs-filter-check__input"
        checked={checked}
        disabled={disabled}
        onChange={disabled ? undefined : onChange}
      />
      <span className="jobs-filter-check__box" aria-hidden="true">
        <i className="bi bi-check-lg" />
      </span>
      <span className="jobs-filter-check__text">{children}</span>
    </label>
  );
}
