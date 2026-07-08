import Link from "next/link";
import {
  fetchMarketplaceCategories,
  fetchMarketplaceListings,
  type PublicMarketplaceListing,
} from "@/lib/marketplace-public";
import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";
import { Suspense } from "react";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceHeroActions } from "@/components/marketplace/MarketplaceHeroActions";

type Props = {
  listingType: string;
  basePath: string;
  title: string;
  subtitle: string;
  badge: string;
};

export async function MarketplaceBrowseSection({
  listingType,
  basePath,
  title,
  subtitle,
  badge,
  searchParams,
}: Props & {
  searchParams?: { q?: string; category?: string; sort?: string };
}) {
  let listings: PublicMarketplaceListing[] = [];
  let categories: Awaited<ReturnType<typeof fetchMarketplaceCategories>> = [];
  try {
    [listings, categories] = await Promise.all([
      fetchMarketplaceListings({
        listing_type: listingType,
        category_slug: searchParams?.category,
        search: searchParams?.q,
        sort: searchParams?.sort ?? "newest",
        limit: 48,
      }),
      fetchMarketplaceCategories(listingType),
    ]);
  } catch {
    listings = [];
    categories = [];
  }

  return (
    <>
      <section className="hero section">
        <div className="container">
          <span className="badge-label">{badge}</span>
          <h1 className="mt-2">{title}</h1>
          <p className="mb-0">{subtitle}</p>
          <MarketplaceHeroActions />
        </div>
      </section>

      <section className="services section pt-0">
        <div className="container">
          <div className="form-panel form-panel--compact mb-4">
            <Suspense
              fallback={<p className="small text-muted">Loading filters…</p>}
            >
              <MarketplaceFilters
                categories={categories}
                basePath={basePath}
                initialSearch={searchParams?.q}
                initialCategory={searchParams?.category}
                initialSort={searchParams?.sort}
              />
            </Suspense>
          </div>

          {listings.length === 0 ? (
            <div className="alert alert-light border mt-4">
              <p className="mb-2">No listings yet in this section.</p>
              <Link href="/marketplace/new" className="btn btn-accent btn-sm">
                Be the first to list
              </Link>
            </div>
          ) : (
            <div className="row gy-4 mt-2">
              {listings.map((listing) => (
                <div className="col-lg-4 col-md-6" key={listing.id}>
                  <MarketplaceListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
