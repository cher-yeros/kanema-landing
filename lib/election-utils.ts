/** GraphQL / MySQL may return flags as true/false, 0/1, or strings. */
export function isTruthyFlag(v: unknown): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}
