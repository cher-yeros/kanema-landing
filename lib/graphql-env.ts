/**
 * Kanema GraphQL (kanema-backend) HTTP/WS URLs for the landing app only.
 * Same idea as lela-platform-internet-facing: `NODE_ENV`-based defaults plus `NEXT_PUBLIC_*` overrides.
 *
 * Browser and RSC/server code POST directly to kanema-backend — no Next.js API proxy.
 *
 * Env:
 * - `NEXT_PUBLIC_GRAPHQL_URL` — optional explicit GraphQL HTTP URL for client + default server.
 * - `GRAPHQL_URL` — optional server-only override when RSC fetches resolve the backend differently
 *   than the browser (e.g. Docker hostname).
 */

const DEFAULT_GRAPHQL_DEV = "http://localhost:4000/graphql";
const DEFAULT_API_ORIGIN_PROD = "https://apikanema.shevadigitals.com";

export function ensureGraphqlHttpPath(url: string): string {
  const u = url.trim().replace(/\/+$/, "");
  if (/\/graphql$/i.test(u)) return u;
  return `${u}/graphql`;
}

function defaultBackendGraphqlForNodeEnv(): string {
  if (process.env.NODE_ENV === "production") {
    return ensureGraphqlHttpPath(DEFAULT_API_ORIGIN_PROD);
  }
  return DEFAULT_GRAPHQL_DEV;
}

/** Canonical GraphQL HTTP URL (backend). Used by Apollo on the client. */
export function graphqlHttpUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
  if (fromEnv) return ensureGraphqlHttpPath(fromEnv);
  return defaultBackendGraphqlForNodeEnv();
}

/**
 * GraphQL HTTP URL when code runs on the Next server (RSC server fetches).
 * Prefer `GRAPHQL_URL` when the backend is only reachable privately from Node.
 */
export function graphqlHttpUrlServer(): string {
  const fromServer = process.env.GRAPHQL_URL?.trim();
  if (fromServer) return ensureGraphqlHttpPath(fromServer);
  return graphqlHttpUrl();
}

export function graphqlWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  try {
    const base = new URL(graphqlHttpUrl());
    base.protocol = base.protocol === "https:" ? "wss:" : "ws:";
    base.pathname = "/subscriptions";
    base.search = "";
    base.hash = "";
    return base.toString();
  } catch {
    return "ws://localhost:4000/subscriptions";
  }
}

export function defaultElectionId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_KANEMA_ELECTION_ID?.trim();
  return id || undefined;
}
