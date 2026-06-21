"use client";

import { Control, Controller } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  COMMUNITY_JOIN_INTEREST_OPTIONS,
  type JoinCommunityFormValues,
} from "./join-community-form-schema";

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
          <div className="community-shadcn">
            <div className="row g-2">
              {COMMUNITY_JOIN_INTEREST_OPTIONS.map((opt) => {
                const inputId = `join-community-interest-${opt.id}`;
                const checked = (field.value ?? []).includes(opt.id);

                return (
                  <div className="col-sm-6" key={opt.id}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={(value) => {
                          const current = field.value ?? [];
                          if (value === true) {
                            field.onChange([...current, opt.id]);
                          } else {
                            field.onChange(
                              current.filter((id) => id !== opt.id),
                            );
                          }
                        }}
                        onBlur={field.onBlur}
                        aria-invalid={error ? true : undefined}
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
        )}
      />
      {error?.message ? (
        <div className="invalid-feedback d-block mt-2">{error.message}</div>
      ) : null}
    </div>
  );
}
