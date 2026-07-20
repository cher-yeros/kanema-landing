import { MarketplaceListingForm } from "@/components/marketplace/MarketplaceListingForm";
import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";

export default function NewListingPage() {
  return (
    <MarketplacePageShell
      title="Create listing"
      description="List cameras, lenses, lighting, audio, drones, and other production gear for sale."
      narrow
    >
      <MarketplaceListingForm />
    </MarketplacePageShell>
  );
}
