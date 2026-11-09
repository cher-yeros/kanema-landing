"use client";

import { useMemo, useState } from "react";

import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";
import type { PublicMarketplaceListing } from "@/lib/marketplace-public";

type FilterValue = "ALL" | "PRODUCT" | "DIGITAL";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PRODUCT", label: "Products" },
  { value: "DIGITAL", label: "Digital Products" },
];

export function MarketplaceHubBrowse({
  listings,
}: {
  listings: PublicMarketplaceListing[];
}) {
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return listings;
    return listings.filter((listing) => listing.listing_type === filter);
  }, [filter, listings]);

  return (
    <section
      id="marketplace-listings"
      className="services section"
      aria-labelledby="featuredHeading"
    >
      <div className="container section-title" data-aos="fade-up">
        <h2 id="featuredHeading">Shop listings</h2>
        <p>Filter products and digital downloads without leaving this page.</p>
      </div>
      <div className="container" data-aos="fade-up">
        <div className="d-flex flex-wrap gap-2 mb-4" role="tablist">
          {FILTERS.map((item) => {
            const active = filter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? "btn btn-accent" : "btn btn-ghost"}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="alert alert-light border mb-0">
            No listings in this category yet.
          </div>
        ) : (
          <div className="row gy-4">
            {filtered.map((listing) => (
              <div className="col-lg-4 col-md-6" key={listing.id}>
                <MarketplaceListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
