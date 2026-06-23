import { setAuthToken } from "@/lib/store/auth-slice";
import { getCanmaReduxStore } from "@/lib/store/store-ref";
import {
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

export function setStoredToken(token: string | null) {
  const store = getCanmaReduxStore();
  if (store) {
    store.dispatch(setAuthToken(token));
  } else {
    writeCanmaTokenToStorage(token);
  }
}
