"use client";

/**
 * Back-compat barrel: Redux + Apollo are mounted in `CanmaAppProviders` at app root.
 * Token helpers delegate to Redux with localStorage fallback before the client mounts.
 */
export {
  CanmaAppProviders as ElectionApolloProvider,
  CanmaAppProviders as CanmaApolloProvider,
} from "@/components/providers/CanmaAppProviders";

export {
  setStoredAuthSession,
  clearStoredAuthSession,
  logoutCanmaSession,
  setStoredToken,
  getStoredToken,
} from "@/lib/store/imperative-auth";
