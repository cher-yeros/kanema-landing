import { CombinedGraphQLErrors } from "@apollo/client/errors";

/** First useful message from an Apollo / GraphQL client error. */
export function apolloErrorMessage(err: unknown, fallback: string): string {
  if (CombinedGraphQLErrors.is(err)) {
    const first = err.errors[0];
    if (first && typeof first.message === "string" && first.message.length > 0) {
      return first.message;
    }
  }
  if (!err || typeof err !== "object") return fallback;
  const o = err as Record<string, unknown>;
  const gql = o.graphQLErrors;
  if (Array.isArray(gql) && gql[0] && typeof gql[0] === "object" && gql[0] !== null) {
    const m = (gql[0] as { message?: string }).message;
    if (typeof m === "string" && m.length > 0) return m;
  }
  const net = o.networkError;
  if (net && typeof net === "object" && "message" in net) {
    const nm = (net as { message?: string }).message;
    if (typeof nm === "string" && nm.length > 0) return nm;
  }
  if (typeof o.message === "string" && o.message.length > 0) return o.message;
  return fallback;
}
