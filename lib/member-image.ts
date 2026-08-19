import { landingImage } from "@/lib/landing-assets";

/** Default avatar when a member has no profile photo. */
export const DEFAULT_AVATAR_SRC = "/img/avatar-placeholder.png";

function resolveImageSrc(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }
  return landingImage(path);
}

/** Resolve avatar/photo for member cards (absolute URL or fallback image). */
export function memberImageSrc(
  url: string | null | undefined,
  fallback: string = DEFAULT_AVATAR_SRC,
): string {
  const trimmed = url?.trim() ?? "";
  if (trimmed) {
    return resolveImageSrc(trimmed);
  }
  return resolveImageSrc(fallback);
}
