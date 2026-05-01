"use client";

/**
 * Back-compat barrel: Redux + Apollo are mounted in `KanemaAppProviders` at app root.
 * Token helpers delegate to Redux with localStorage fallback before the client mounts.
 */
export {
  KanemaAppProviders as ElectionApolloProvider,
  KanemaAppProviders as KanemaApolloProvider,
} from "@/components/providers/KanemaAppProviders";

export { setStoredToken, getStoredToken } from "@/lib/store/imperative-auth";
