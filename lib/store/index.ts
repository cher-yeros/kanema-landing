import { configureStore } from "@reduxjs/toolkit";

import { kanemaAuthSlice } from "@/lib/store/auth-slice";
import { readKanemaTokenFromStorage } from "@/lib/store/token-persist";

export function makeKanemaStore() {
  const token =
    typeof window !== "undefined" ? readKanemaTokenFromStorage() : null;

  return configureStore({
    reducer: {
      auth: kanemaAuthSlice.reducer,
    },
    preloadedState: {
      auth: { token },
    },
  });
}

export type AppStore = ReturnType<typeof makeKanemaStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
