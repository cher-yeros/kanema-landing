import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";
import { redirectIfMarketplaceProductsOnly } from "@/lib/marketplace-config";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function WantedPage({ searchParams }: Props) {
  redirectIfMarketplaceProductsOnly();
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="WANTED"
      basePath="/marketplace/wanted"
      title="Wanted listings"
      subtitle="Post what you need—sellers respond with offers."
      badge="Buyer requests"
      searchParams={sp}
    />
  );
}
