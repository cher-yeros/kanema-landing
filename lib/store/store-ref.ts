import type { Persistor } from "redux-persist";

import type { AppStore } from "@/lib/store";

let canmaStoreRef: AppStore | null = null;
let canmaPersistorRef: Persistor | null = null;

export function bindCanmaReduxStore(store: AppStore | null) {
  canmaStoreRef = store;
}

export function getCanmaReduxStore(): AppStore | null {
  return canmaStoreRef;
}

export function bindCanmaReduxPersistor(persistor: Persistor | null) {
  canmaPersistorRef = persistor;
}

export function getCanmaReduxPersistor(): Persistor | null {
  return canmaPersistorRef;
}
