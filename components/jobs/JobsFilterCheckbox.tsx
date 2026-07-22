"use client";

type Props = {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
};

export function JobsFilterCheckbox({ checked, onChange, children }: Props) {
  return (
    <label className="jobs-filter-check">
      <input
        type="checkbox"
        className="jobs-filter-check__input"
        checked={checked}
        onChange={onChange}
      />
      <span className="jobs-filter-check__box" aria-hidden="true">
        <i className="bi bi-check-lg" />
      </span>
      <span className="jobs-filter-check__text">{children}</span>
    </label>
  );
}
