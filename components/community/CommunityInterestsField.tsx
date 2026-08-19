"use client";

import { Control, Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  COMMUNITY_JOIN_INTEREST_OPTIONS,
  type JoinCommunityFormValues,
} from "./join-community-form-schema";

type CommunityInterestsPickerProps = {
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  idPrefix?: string;
  invalid?: boolean;
};

export function CommunityInterestsPicker({
  value,
  onChange,
  onBlur,
  idPrefix = "community-interest",
  invalid,
}: CommunityInterestsPickerProps) {
  return (
    <div className="community-shadcn">
      <div className="row g-2">
        {COMMUNITY_JOIN_INTEREST_OPTIONS.map((opt) => {
          const inputId = `${idPrefix}-${opt.id}`;
          const checked = value.includes(opt.id);

          return (
            <div className="col-sm-6" key={opt.id}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onCheckedChange={(next) => {
                    if (next === true) {
                      onChange([...value, opt.id]);
                    } else {
                      onChange(value.filter((id) => id !== opt.id));
                    }
                  }}
                  onBlur={onBlur}
                  aria-invalid={invalid ? true : undefined}
                />
                <Label htmlFor={inputId} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CommunityInterestsFieldProps = {
  control: Control<JoinCommunityFormValues>;
  error?: { message?: string };
};

export function CommunityInterestsField({
  control,
  error,
}: CommunityInterestsFieldProps) {
  return (
    <div>
      <span className="form-label d-block">Interests</span>
      <Controller
        name="interests"
        control={control}
        render={({ field }) => (
          <CommunityInterestsPicker
            value={field.value ?? []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            idPrefix="join-community-interest"
            invalid={Boolean(error)}
          />
        )}
      />
      {error?.message ? (
        <div className="invalid-feedback d-block mt-2">{error.message}</div>
      ) : null}
    </div>
  );
}
