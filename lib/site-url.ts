/** Public site origin for absolute URLs (OG tags, canonical links). */
export function siteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

export function absoluteSiteUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${cleanPath}`;
}

/** Resolve member/API media paths to absolute URLs for crawlers. */
export function absoluteMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//")
  ) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  }
  return absoluteSiteUrl(trimmed);
}

export function communityMemberPath(slug: string): string {
  return `/community/${encodeURIComponent(slug)}`;
}

export function eventPath(slug: string): string {
  return `/events/${encodeURIComponent(slug)}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
