import Link from "next/link";

import { MarketplaceListingForm } from "@/components/marketplace/MarketplaceListingForm";
import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";

export default function NewListingPage() {
  return (
    <MarketplacePageShell
      title="Create listing"
      description={
        <>
          List cameras, lenses, lighting, audio, drones, and other production
          gear for sale.{" "}
          <span className="d-block small text-muted mt-2 mb-0">
            <Link href="/marketplace/pricing" className="link-body-emphasis">
              Seller pricing
            </Link>
            —free tier includes up to 2 active listings; paid tiers and boosts
            follow the published rate card.
          </span>
        </>
      }
      narrow
    >
      <MarketplaceListingForm />
    </MarketplacePageShell>
  );
}
