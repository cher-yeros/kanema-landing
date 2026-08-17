"use client";

import { Control, Controller } from "react-hook-form";

import { JobsFilterCheckbox } from "@/components/jobs/JobsFilterCheckbox";
import "@/components/jobs/jobs-filter-checkbox.css";

import {
  JOIN_COMMUNITY_HONEYPOT_FIELD,
  type JoinCommunityFormValues,
} from "./join-community-form-schema";

type CommunityInterestsFieldProps = {
  control: Control<JoinCommunityFormValues>;
  options: { id: string; label: string }[];
  error?: { message?: string };
  loading?: boolean;
};

export function CommunityInterestsField({
  control,
  options,
  error,
  loading = false,
}: CommunityInterestsFieldProps) {
  return (
    <div>
      <span className="form-label d-block">Interests</span>
      {loading ? (
        <p className="small text-muted mb-0">Loading interests…</p>
      ) : options.length === 0 ? (
        <p className="small text-muted mb-0">No interests available yet.</p>
      ) : (
        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <ul
              className="jobs-filter-list interests-filter-list"
              aria-invalid={error ? true : undefined}
            >
              {options.map((opt) => {
                const checked = (field.value ?? []).includes(opt.id);

                return (
                  <li key={opt.id}>
                    <JobsFilterCheckbox
                      checked={checked}
                      onChange={() => {
                        const current = field.value ?? [];
                        if (checked) {
                          field.onChange(current.filter((id) => id !== opt.id));
                        } else {
                          field.onChange([...current, opt.id]);
                        }
                        field.onBlur();
                      }}
                    >
                      {opt.label}
                    </JobsFilterCheckbox>
                  </li>
                );
              })}
            </ul>
          )}
        />
      )}
      {error?.message ? (
        <div className="invalid-feedback d-block mt-2">{error.message}</div>
      ) : null}
    </div>
  );
}
