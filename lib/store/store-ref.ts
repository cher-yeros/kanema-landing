import type { AppStore } from "@/lib/store";

let kanemaStoreRef: AppStore | null = null;

export function bindKanemaReduxStore(store: AppStore | null) {
  kanemaStoreRef = store;
}

export function getKanemaReduxStore(): AppStore | null {
  return kanemaStoreRef;
}
