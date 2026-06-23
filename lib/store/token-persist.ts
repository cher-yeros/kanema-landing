/** localStorage key shared across Canma frontends and backend clients. */
export const KANEMA_AUTH_TOKEN_LS_KEY = "canma_token";

export function readCanmaTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KANEMA_AUTH_TOKEN_LS_KEY);
}

export function writeCanmaTokenToStorage(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(KANEMA_AUTH_TOKEN_LS_KEY, token);
  else localStorage.removeItem(KANEMA_AUTH_TOKEN_LS_KEY);
}
