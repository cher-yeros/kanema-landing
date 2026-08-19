import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";
import { redirectIfMarketplaceProductsOnly } from "@/lib/marketplace-config";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function RentalsPage({ searchParams }: Props) {
  redirectIfMarketplaceProductsOnly();
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="RENTAL"
      basePath="/marketplace/rentals"
      title="Equipment rental"
      subtitle="Rent cinema cameras, gimbals, lights, and drones without purchasing."
      badge="Daily & weekly rates"
      searchParams={sp}
    />
  );
}
