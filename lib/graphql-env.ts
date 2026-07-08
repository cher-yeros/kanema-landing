/**
 * Canma GraphQL (canma-backend) HTTP/WS URLs for the landing app.
 * Mirrors `canma-admin/lib/graphql-env.ts`: NODE_ENV defaults plus `KANEMA_*` / `NEXT_PUBLIC_KANEMA_*` overrides.
 *
 * Legacy: `NEXT_PUBLIC_GRAPHQL_URL`, `GRAPHQL_URL`, `NEXT_PUBLIC_GRAPHQL_WS_URL` are still honored if set.
 */

const DEFAULT_GRAPHQL_HTTP_DEV = "http://localhost:4000/graphql";
/** Production API host (GraphQL at `/graphql`, subscriptions at `/subscriptions`). */
const DEFAULT_GRAPHQL_HTTP_PROD = "https://kanema.shevadigitals.com/graphql";

function defaultGraphqlHttpForNodeEnv(): string {
  return process.env.NODE_ENV === "production"
    ? DEFAULT_GRAPHQL_HTTP_PROD
    : DEFAULT_GRAPHQL_HTTP_DEV;
}

export function ensureGraphqlHttpPath(url: string): string {
  const u = url.trim().replace(/\/+$/, "");
  if (/\/graphql$/i.test(u)) return u;
  return `${u}/graphql`;
}

function resolveGraphqlHttpUrl(): string {
  if (typeof window === "undefined") {
    const s =
      process.env.KANEMA_GRAPHQL_URL?.trim() ||
      process.env.NEXT_PUBLIC_KANEMA_GRAPHQL_URL?.trim() ||
      process.env.GRAPHQL_URL?.trim() ||
      process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
    if (s) return ensureGraphqlHttpPath(s);
    return defaultGraphqlHttpForNodeEnv();
  }
  const c =
    process.env.NEXT_PUBLIC_KANEMA_GRAPHQL_URL?.trim() ||
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
  if (c) return ensureGraphqlHttpPath(c);
  return defaultGraphqlHttpForNodeEnv();
}

/** HTTP endpoint of the Canma GraphQL API (backend tier), not a Next.js route. */
export function graphqlHttpUrl(): string {
  return resolveGraphqlHttpUrl();
}

/** Canma API origin (GraphQL URL without `/graphql`). */
export function canmaApiBaseUrl(): string {
  return graphqlHttpUrl().replace(/\/graphql\/?$/i, "");
}

/** Community join profile photo upload (multipart). */
export function communityAvatarUploadUrl(): string {
  return `${canmaApiBaseUrl()}/api/community-avatar`;
}

/** Community join profile photo upload (JSON base64 proxy). */
export function communityAvatarBase64UploadUrl(): string {
  return `${canmaApiBaseUrl()}/api/community-avatar/base64`;
}

export function forumMediaUploadUrl(): string {
  return `${canmaApiBaseUrl()}/api/forum-media`;
}

export function marketplaceMediaUploadUrl(): string {
  return `${canmaApiBaseUrl()}/api/marketplace-media`;
}

/**
 * GraphQL HTTP URL when code runs on the Next server (RSC server fetches).
 * Uses the same resolution as {@link graphqlHttpUrl} on the server (including `KANEMA_GRAPHQL_URL`).
 */
export function graphqlHttpUrlServer(): string {
  return resolveGraphqlHttpUrl();
}

function defaultWsFromHttp(http: string): string {
  if (http.startsWith("https://")) {
    return (
      "wss://" +
      http
        .slice("https://".length)
        .replace(/\/graphql\/?$/i, "")
        .replace(/\/$/, "") +
      "/subscriptions"
    );
  }
  if (http.startsWith("http://")) {
    return (
      "ws://" +
      http
        .slice("http://".length)
        .replace(/\/graphql\/?$/i, "")
        .replace(/\/$/, "") +
      "/subscriptions"
    );
  }
  return "ws://localhost:4000/subscriptions";
}

export function graphqlWsUrl(): string {
  if (typeof window === "undefined") {
    const s =
      process.env.KANEMA_GRAPHQL_WS_URL?.trim() ||
      process.env.NEXT_PUBLIC_KANEMA_GRAPHQL_WS_URL?.trim() ||
      process.env.NEXT_PUBLIC_GRAPHQL_WS_URL?.trim();
    if (s) return s.replace(/\/$/, "");
    return defaultWsFromHttp(resolveGraphqlHttpUrl());
  }
  const c =
    process.env.NEXT_PUBLIC_KANEMA_GRAPHQL_WS_URL?.trim() ||
    process.env.NEXT_PUBLIC_GRAPHQL_WS_URL?.trim();
  if (c) return c.replace(/\/$/, "");
  return defaultWsFromHttp(resolveGraphqlHttpUrl());
}

export function defaultElectionId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_KANEMA_ELECTION_ID?.trim();
  return id || undefined;
}
