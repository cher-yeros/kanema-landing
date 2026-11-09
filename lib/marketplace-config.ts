import { redirect } from "next/navigation";

export type MarketplaceListingType =
  | "PRODUCT"
  | "RENTAL"
  | "DIGITAL"
  | "SERVICE"
  | "WANTED"
  | "AUCTION";

/** Public marketplace modules currently available. */
export const MARKETPLACE_ALLOWED_TYPES = ["PRODUCT", "DIGITAL"] as const;

export type MarketplaceAllowedListingType =
  (typeof MARKETPLACE_ALLOWED_TYPES)[number];

/** @deprecated Prefer MARKETPLACE_ALLOWED_TYPES — kept for older call sites. */
export const MARKETPLACE_PRODUCTS_ONLY = false;

export const MARKETPLACE_PRIMARY_PATH = "/marketplace";

export const MARKETPLACE_LISTING_TYPE: MarketplaceListingType = "PRODUCT";

export function isMarketplaceAllowedType(
  type: string | null | undefined,
): type is MarketplaceAllowedListingType {
  return (
    !!type && (MARKETPLACE_ALLOWED_TYPES as readonly string[]).includes(type)
  );
}

/** Redirect disabled marketplace modules to the hub. */
export function redirectIfMarketplaceProductsOnly(): void {
  redirect(MARKETPLACE_PRIMARY_PATH);
}

export function redirectIfMarketplaceTypeDisabled(
  listingType: MarketplaceListingType,
): void {
  if (!isMarketplaceAllowedType(listingType)) {
    redirect(MARKETPLACE_PRIMARY_PATH);
  }
}
