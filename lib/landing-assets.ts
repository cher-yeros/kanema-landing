/** Same-origin path for landing stock images (rewritten in `next.config.ts`). */
export const LANDING_IMAGE_BASE = "/landing-assets/img";

/**
 * @param path - Relative to `assets/img/` (e.g. `about/about-wide-2.webp`).
 */
export function landingImage(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${LANDING_IMAGE_BASE}/${clean}`;
}
