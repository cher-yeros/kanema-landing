/** HTTP GraphQL endpoint (POST). */
export function graphqlHttpUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace(/\/$/, "") ||
    "http://localhost:4000/graphql"
  );
}

/** graphql-ws endpoint (same host as API, path `/subscriptions`). */
export function graphqlWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  try {
    const u = new URL(graphqlHttpUrl());
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/subscriptions";
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return "ws://localhost:4000/subscriptions";
  }
}

/**
 * Optional fixed election UUID (`NEXT_PUBLIC_KANEMA_ELECTION_ID`).
 * Use when several elections exist and the site should always open a specific
 * one; otherwise the UI selects the active election, then the first returned.
 * Organizers still create elections via the GraphQL API (e.g. `adminCreateElection`).
 */
export function defaultElectionId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_KANEMA_ELECTION_ID?.trim();
  return id || undefined;
}
