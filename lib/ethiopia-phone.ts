export const ETHIOPIA_PHONE_COUNTRY_CODE = "+251";
export const ETHIOPIA_LOCAL_PHONE_LENGTH = 9;
export const ETHIOPIA_LOCAL_PHONE_REGEX = /^[97]\d{8}$/;

export function sanitizeEthiopiaLocalPhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, ETHIOPIA_LOCAL_PHONE_LENGTH);
}

export function isValidEthiopiaLocalPhone(local: string): boolean {
  return ETHIOPIA_LOCAL_PHONE_REGEX.test(
    sanitizeEthiopiaLocalPhoneInput(local),
  );
}

export function formatEthiopiaPhoneForApi(local: string): string {
  const digits = sanitizeEthiopiaLocalPhoneInput(local);
  return `${ETHIOPIA_PHONE_COUNTRY_CODE}${digits}`;
}

/** Parse stored +251… or local digits into 9-digit local form for inputs. */
export function parseEthiopiaPhoneFromApi(
  phone: string | null | undefined,
): string {
  if (!phone?.trim()) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("251") && digits.length >= 12) {
    return digits.slice(3, 12);
  }
  return sanitizeEthiopiaLocalPhoneInput(digits);
}
