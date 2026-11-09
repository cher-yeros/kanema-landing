/** Android / iOS identifiers — must match the Flutter app. */
export const ANDROID_APPLICATION_ID = "com.example.kanema_app";
export const IOS_BUNDLE_ID = "com.example.kanemaApp";

/**
 * SHA-256 fingerprints of the Android signing cert(s).
 * Replace REPLACE_WITH_RELEASE_SHA256 after you generate a release keystore:
 *   keytool -list -v -keystore your-release.keystore
 * Also add the debug fingerprint for local App Link testing.
 */
export const ANDROID_SHA256_FINGERPRINTS = (
  process.env.ANDROID_APP_LINK_SHA256 ?? "REPLACE_WITH_RELEASE_SHA256"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Optional Apple Team ID for Universal Links (10-char). */
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID?.trim() || "";

export function playStoreUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim() ||
    process.env.PLAY_STORE_URL?.trim() ||
    ""
  );
}

export function appStoreUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() ||
    process.env.APP_STORE_URL?.trim() ||
    ""
  );
}

/** Only allow in-app paths that map to known Canma screens. */
export function sanitizeOpenPath(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  let path = raw.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  if (
    path === "/" ||
    path === "/marketplace" ||
    path === "/jobs" ||
    path === "/channels" ||
    path === "/forum" ||
    path === "/community" ||
    path === "/events" ||
    path === "/learn"
  ) {
    return path;
  }

  const ok =
    /^\/marketplace\/l\/[^/]+$/.test(path) ||
    /^\/marketplace\/[^/]+$/.test(path) ||
    /^\/jobs\/[^/]+$/.test(path) ||
    /^\/channels\/p\/[^/]+$/.test(path) ||
    /^\/channels\/[^/]+$/.test(path) ||
    /^\/forum\/c\/[^/]+$/.test(path) ||
    /^\/forum\/t\/[^/]+$/.test(path) ||
    /^\/community\/[^/]+$/.test(path) ||
    /^\/events\/[^/]+$/.test(path) ||
    /^\/learn\/[^/]+$/.test(path);

  return ok ? path : null;
}

export function customSchemeUrl(path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `canma://${clean}`;
}

/** Android Intent URL that tries the app, then falls back to [fallbackUrl]. */
export function androidIntentUrl(path: string, fallbackUrl: string): string {
  const hostPath = `canmaet.net${path.startsWith("/") ? path : `/${path}`}`;
  const encodedFallback = encodeURIComponent(fallbackUrl);
  return (
    `intent://${hostPath}` +
    `#Intent;scheme=https;package=${ANDROID_APPLICATION_ID};` +
    `S.browser_fallback_url=${encodedFallback};end`
  );
}
