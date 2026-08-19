import type { Metadata } from "next";
import Link from "next/link";

import { MarketplaceSellerPricing } from "@/components/marketplace/MarketplaceSellerPricing";
import { MARKETPLACE_PRIMARY_PATH } from "@/lib/marketplace-config";

export const metadata: Metadata = {
  title: "Seller pricing — Marketplace — Canma",
  description:
    "Canma marketplace seller pricing: free tier, pay-per-listing, subscription plans, optional boosts, and value comparison in ETB.",
};

export default function MarketplaceSellerPricingPage() {
  return (
    <>
      <section className="hero section">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="hero-heading">
                <span className="badge-label">Seller pricing</span>
                <h1>Marketplace pricing</h1>
                <p>
                  Transparent plans for creatives selling gear on Canma—start
                  free, pay per listing, or subscribe when you run a busy
                  storefront.
                </p>
                <div className="hero-actions mt-4">
                  <Link href="/marketplace/new" className="btn btn-accent">
                    <i className="bi bi-plus-circle me-2" aria-hidden />
                    Create listing
                  </Link>
                  <Link
                    href={MARKETPLACE_PRIMARY_PATH}
                    className="btn btn-ghost"
                  >
                    <i className="bi bi-shop me-2" aria-hidden />
                    Browse marketplace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketplaceSellerPricing />
    </>
  );
}
