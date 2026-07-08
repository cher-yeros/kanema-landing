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
      title="Digital marketplace"
      subtitle="LUT packs, presets, templates, motion graphics, music, and SFX."
      badge="Instant delivery after confirm"
      searchParams={sp}
    />
  );
}
