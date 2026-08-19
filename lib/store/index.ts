import { configureStore, type Middleware } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import {
  canmaAuthSlice,
  clearAuthSession,
  setAuthSession,
  setAuthToken,
  setAuthUser,
} from "@/lib/store/auth-slice";
import { getCanmaReduxPersistor } from "@/lib/store/store-ref";

const authPersistConfig = {
  key: "canma-auth",
  storage,
  whitelist: ["token", "user"] as ("token" | "user")[],
};

const persistedAuthReducer = persistReducer(
  authPersistConfig,
  canmaAuthSlice.reducer,
);

const authPersistFlushMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (
    setAuthSession.match(action) ||
    setAuthToken.match(action) ||
    setAuthUser.match(action)
  ) {
    void getCanmaReduxPersistor()?.flush();
  }

  if (clearAuthSession.match(action)) {
    queueMicrotask(() => {
      void getCanmaReduxPersistor()?.purge();
    });
  }

  return result;
};

export function makeCanmaStore() {
  return configureStore({
    reducer: {
      auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(authPersistFlushMiddleware),
  });
}

export function makeCanmaPersistor(store: AppStore) {
  return persistStore(store);
}

export type AppStore = ReturnType<typeof makeCanmaStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
