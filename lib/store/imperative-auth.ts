import { setAuthToken } from "@/lib/store/auth-slice";
import { getKanemaReduxStore } from "@/lib/store/store-ref";
import { readKanemaTokenFromStorage, writeKanemaTokenToStorage } from "@/lib/store/token-persist";

/** Mirrors legacy localStorage helpers; prefers Redux state when store is mounted. */
export function getStoredToken(): string | null {
  const store = getKanemaReduxStore();
  if (store) {
    const t = store.getState().auth.token;
    if (t != null && t !== "") return t;
  }
  return readKanemaTokenFromStorage();
}

export function setStoredToken(token: string | null) {
  const store = getKanemaReduxStore();
  if (store) {
    store.dispatch(setAuthToken(token));
  } else {
    writeKanemaTokenToStorage(token);
  }
}
