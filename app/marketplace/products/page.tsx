import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="PRODUCT"
      basePath="/marketplace/products"
      title="Physical products"
      subtitle="Cameras, lenses, lighting, audio, drones, and production gear from Canma members."
      badge="Buy & sell equipment"
      searchParams={sp}
    />
  );
}
