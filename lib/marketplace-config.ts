import { redirect } from "next/navigation";

/** When true, only physical product buy/sell is exposed in the landing app. */
export const MARKETPLACE_PRODUCTS_ONLY = true;

export const MARKETPLACE_PRIMARY_PATH = "/marketplace/products";

export const MARKETPLACE_LISTING_TYPE = "PRODUCT" as const;

/** Redirect disabled marketplace modules to the primary products browse page. */
export function redirectIfMarketplaceProductsOnly(): void {
  if (MARKETPLACE_PRODUCTS_ONLY) {
    redirect(MARKETPLACE_PRIMARY_PATH);
  }
}
