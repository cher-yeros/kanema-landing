import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { writeKanemaTokenToStorage } from "@/lib/store/token-persist";

export type KanemaAuthState = {
  token: string | null;
};

/** Default for SSR; hydrated via `preloadedState` in `makeKanemaStore`. */
const initialState: KanemaAuthState = { token: null };

export const kanemaAuthSlice = createSlice({
  name: "kanemaAuth",
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      writeKanemaTokenToStorage(action.payload);
    },
  },
});

export const { setAuthToken } = kanemaAuthSlice.actions;
