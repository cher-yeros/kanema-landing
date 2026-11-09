import { MarketplaceBrowseSection } from "@/components/marketplace/MarketplaceBrowseSection";

type Props = {
  searchParams?: Promise<{ q?: string; category?: string; sort?: string }>;
};

export default async function DigitalPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  return (
    <MarketplaceBrowseSection
      listingType="DIGITAL"
      basePath="/marketplace/digital"
      title="Digital Products"
      subtitle="LUT packs, presets, templates, motion graphics, music, and SFX. Upload for free — buyers pay with Chapa."
      badge="Instant delivery after payment"
      searchParams={sp}
    />
  );
}
