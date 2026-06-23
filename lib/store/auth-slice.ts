import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { writeCanmaTokenToStorage } from "@/lib/store/token-persist";

export type CanmaAuthState = {
  token: string | null;
};

/** Default for SSR; hydrated via `preloadedState` in `makeCanmaStore`. */
const initialState: CanmaAuthState = { token: null };

export const canmaAuthSlice = createSlice({
  name: "canmaAuth",
  initialState,
  reducers: {
    setAuthToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      writeCanmaTokenToStorage(action.payload);
    },
  },
});

export const { setAuthToken } = canmaAuthSlice.actions;
