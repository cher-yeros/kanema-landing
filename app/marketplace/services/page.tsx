import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function ServicesPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="SERVICE"
      basePath="/marketplace/services"
      title="Creative services"
      subtitle="Photography, videography, editing, color grading, design, and more."
      badge="Freelancer marketplace"
      searchParams={sp}
    />
  );
}
