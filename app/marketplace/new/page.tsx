import { MarketplaceListingForm } from "@/components/marketplace/MarketplaceListingForm";
import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";

export default function NewListingPage() {
  return (
    <MarketplacePageShell
      title="Create listing"
      description="List equipment, services, digital assets, rentals, wanted posts, or auctions."
      narrow
    >
      <MarketplaceListingForm />
    </MarketplacePageShell>
  );
}
