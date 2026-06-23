import { configureStore } from "@reduxjs/toolkit";

import { kanemaAuthSlice } from "@/lib/store/auth-slice";
import { readCanmaTokenFromStorage } from "@/lib/store/token-persist";

export function makeCanmaStore() {
  const token =
    typeof window !== "undefined" ? readCanmaTokenFromStorage() : null;

  return configureStore({
    reducer: {
      auth: kanemaAuthSlice.reducer,
    },
    preloadedState: {
      auth: { token },
    },
  });
}

export type AppStore = ReturnType<typeof makeCanmaStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
