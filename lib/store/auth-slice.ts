import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

import {
  readCanmaTokenFromStorage,
  writeCanmaTokenToStorage,
} from "@/lib/store/token-persist";

export type AuthUser = {
  id: string;
  full_name: string;
  avatar_url: string | null;
};

export type CanmaAuthState = {
  token: string | null;
  user: AuthUser | null;
};

const initialState: CanmaAuthState = {
  token: null,
  user: null,
};

function syncLegacyToken(token: string | null) {
  writeCanmaTokenToStorage(token);
}

export const canmaAuthSlice = createSlice({
  name: "canmaAuth",
  initialState,
  reducers: {
    setAuthSession(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      syncLegacyToken(action.payload.token);
    },
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    setAuthToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (!action.payload) {
        state.user = null;
      }
      syncLegacyToken(action.payload);
    },
    clearAuthSession(state) {
      state.token = null;
      state.user = null;
      syncLegacyToken(null);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      const payload = (action as { payload?: CanmaAuthState }).payload;
      if (payload !== undefined) {
        state.token = payload.token ?? null;
        state.user = payload.user ?? null;
      } else if (!state.token) {
        const legacy = readCanmaTokenFromStorage();
        if (legacy) {
          state.token = legacy;
        }
      }
      syncLegacyToken(state.token);
    });
  },
});

export const { setAuthSession, setAuthUser, setAuthToken, clearAuthSession } =
  canmaAuthSlice.actions;
