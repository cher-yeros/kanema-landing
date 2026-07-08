import { notFound } from "next/navigation";
import { fetchMarketplaceListingBySlug } from "@/lib/marketplace-public";
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

  return (
    <>
      <ListingDetailView listing={listing} />
      <ListingActionsPanel listing={listing} />
    </>
  );
}
