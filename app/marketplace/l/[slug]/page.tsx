import { notFound } from "next/navigation";
import { fetchMarketplaceListingBySlug } from "@/lib/marketplace-public";
import {
  MARKETPLACE_LISTING_TYPE,
  MARKETPLACE_PRODUCTS_ONLY,
} from "@/lib/marketplace-config";
import { ListingDetailView } from "@/components/marketplace/ListingDetailView";
import { ListingActionsPanel } from "@/components/marketplace/ListingActionsPanel";

type Props = { params: Promise<{ slug: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  let listing: Awaited<ReturnType<typeof fetchMarketplaceListingBySlug>> = null;
  try {
    listing = await fetchMarketplaceListingBySlug(slug);
  } catch {
    listing = null;
  }
  if (!listing) notFound();
  if (
    MARKETPLACE_PRODUCTS_ONLY &&
    listing.listing_type !== MARKETPLACE_LISTING_TYPE
  ) {
    notFound();
  }

  return (
    <>
      <ListingDetailView listing={listing} />
      <ListingActionsPanel listing={listing} />
    </>
  );
}
