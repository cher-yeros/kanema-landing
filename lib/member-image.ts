import { landingImage } from "@/lib/landing-assets";

/** Resolve avatar/photo for member cards (absolute URL or landing stock image). */
export function memberImageSrc(
  url: string | null | undefined,
  fallback: string,
): string {
  const trimmed = url?.trim() ?? "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return landingImage(fallback);
}
