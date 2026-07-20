"use client";

import {
  ETHIOPIA_LOCAL_PHONE_LENGTH,
  ETHIOPIA_PHONE_COUNTRY_CODE,
  sanitizeEthiopiaLocalPhoneInput,
} from "@/lib/ethiopia-phone";

type EthiopiaPhoneInputProps = {
  id: string;
  value: string;
  onChange: (localValue: string) => void;
  autoComplete?: string;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
};

export function EthiopiaPhoneInput({
  id,
  value,
  onChange,
  autoComplete = "tel-national",
  className = "",
  invalid = false,
  disabled = false,
}: EthiopiaPhoneInputProps) {
  return (
    <div className={`input-group ethiopia-phone-input ${className}`.trim()}>
      <span className="input-group-text ethiopia-phone-input__prefix">
        {ETHIOPIA_PHONE_COUNTRY_CODE}
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        className={`form-control${invalid ? " is-invalid" : ""}`}
        placeholder="912345678"
        value={value}
        onChange={(event) =>
          onChange(sanitizeEthiopiaLocalPhoneInput(event.target.value))
        }
        maxLength={ETHIOPIA_LOCAL_PHONE_LENGTH}
        pattern="[97][0-9]{8}"
        disabled={disabled}
        aria-invalid={invalid}
      />
    </div>
  );
}
