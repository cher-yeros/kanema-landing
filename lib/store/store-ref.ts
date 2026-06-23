import type { AppStore } from "@/lib/store";

let canmaStoreRef: AppStore | null = null;

export function bindCanmaReduxStore(store: AppStore | null) {
  canmaStoreRef = store;
}

export function getCanmaReduxStore(): AppStore | null {
  return canmaStoreRef;
}
