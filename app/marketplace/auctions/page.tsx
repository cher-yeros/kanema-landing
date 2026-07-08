import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function AuctionsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="AUCTION"
      basePath="/marketplace/auctions"
      title="Auctions"
      subtitle="Bid on second-hand equipment with transparent end times."
      badge="Live auctions"
      searchParams={sp}
    />
  );
}
