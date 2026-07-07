import type { AuthUser } from "@/lib/store/auth-slice";
import {
  clearAuthSession,
  setAuthSession,
  setAuthToken,
} from "@/lib/store/auth-slice";
import {
  getCanmaReduxPersistor,
  getCanmaReduxStore,
} from "@/lib/store/store-ref";
import {
  clearCanmaAuthStorage,
  readCanmaTokenFromStorage,
  writeCanmaTokenToStorage,
} from "@/lib/store/token-persist";

/** Mirrors legacy localStorage helpers; prefers Redux state when store is mounted. */
export function getStoredToken(): string | null {
  const store = getCanmaReduxStore();
  if (store) {
    const t = store.getState().auth.token;
    if (t != null && t !== "") return t;
  }
  return readCanmaTokenFromStorage();
}

export function setStoredAuthSession(session: {
  token: string;
  user: AuthUser;
}) {
  const store = getCanmaReduxStore();
  if (store) {
    store.dispatch(setAuthSession(session));
    void getCanmaReduxPersistor()?.flush();
    return;
  }
  writeCanmaTokenToStorage(session.token);
}

/** @deprecated Prefer `setStoredAuthSession` or `clearLocalAuthSession`. */
export function setStoredToken(token: string | null) {
  const store = getCanmaReduxStore();
  if (store) {
    store.dispatch(setAuthToken(token));
    void getCanmaReduxPersistor()?.flush();
    return;
  }
  writeCanmaTokenToStorage(token);
}

/**
 * Immediate logout: clear Redux + localStorage synchronously so the header
 * can switch to “Join the community” on the same frame.
 */
export function clearLocalAuthSession(): void {
  const store = getCanmaReduxStore();
  if (store) {
    store.dispatch(clearAuthSession());
  }
  clearCanmaAuthStorage();
}

/**
 * Deferred logout cleanup (persist flush, Apollo cache, etc.). Call after
 * {@link clearLocalAuthSession} so UI is not blocked.
 */
export function runDeferredAuthLogoutCleanup(onCleanup?: () => void): void {
  queueMicrotask(() => {
    void getCanmaReduxPersistor()?.flush();
    onCleanup?.();
  });
}

/** @deprecated Prefer `clearLocalAuthSession` + `runDeferredAuthLogoutCleanup`. */
export function clearStoredAuthSession() {
  clearLocalAuthSession();
  runDeferredAuthLogoutCleanup();
}
