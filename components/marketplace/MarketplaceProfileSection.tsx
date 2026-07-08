"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";
import type { PublicMarketplaceListing } from "@/lib/marketplace-public";

const SELLER_LISTINGS_QUERY = gql`
  query MarketplaceListingsForSeller($seller_user_id: ID!) {
    marketplaceListingsForSeller(seller_user_id: $seller_user_id) {
      id
      slug
      listing_type
      title
      description
      condition
      location
      brand
      price
      currency
      price_type
      status
      availability
      is_featured
      view_count
      budget_min
      budget_max
      auction_ends_at
      current_bid_amount
      published_at
      cover_url
      rating_avg
      review_count
      media {
        id
        kind
        url
        sort_order
      }
      seller {
        id
        full_name
        is_verified
        is_verified_seller
        rating_avg
        review_count
      }
      category {
        id
        slug
        name
        icon
      }
      rental_details {
        daily_rate
        weekly_rate
        deposit
        pickup_location
        delivery_available
      }
    }
  }
`;

const SELLER_REVIEWS_QUERY = gql`
  query MarketplaceReviewsForSeller($seller_user_id: ID!) {
    marketplaceReviewsForSeller(seller_user_id: $seller_user_id) {
      id
      rating
      body
      createdAt
      reviewer {
        full_name
      }
    }
  }
`;

export function MarketplaceProfileSection({ userId }: { userId: string }) {
  const { data: listingsData, loading: listingsLoading } = useQuery<{
    marketplaceListingsForSeller: PublicMarketplaceListing[];
  }>(SELLER_LISTINGS_QUERY, { variables: { seller_user_id: userId } });

  const { data: reviewsData } = useQuery<{
    marketplaceReviewsForSeller: {
      id: string;
      rating: number;
      body: string | null;
      createdAt: string;
      reviewer: { full_name: string };
    }[];
  }>(SELLER_REVIEWS_QUERY, { variables: { seller_user_id: userId } });

  const listings = listingsData?.marketplaceListingsForSeller ?? [];
  const reviews = reviewsData?.marketplaceReviewsForSeller ?? [];

  if (listingsLoading) {
    return <p className="text-muted small">Loading marketplace…</p>;
  }

  return (
    <div>
      {listings.length === 0 ? (
        <p className="text-muted small mb-0">No marketplace listings yet.</p>
      ) : (
        <div className="row gy-3 mb-4">
          {listings.map((listing) => (
            <div className="col-md-6" key={listing.id}>
              <MarketplaceListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <h3 className="h6 mb-2">Seller reviews</h3>
          <ul className="list-unstyled small">
            {reviews.map((r) => (
              <li key={r.id} className="border-bottom py-2">
                <div>
                  <i className="bi bi-star-fill text-warning" /> {r.rating}/5 ·{" "}
                  {r.reviewer.full_name}
                </div>
                {r.body && <p className="mb-0 text-muted">{r.body}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      <Link href="/marketplace" className="btn btn-ghost btn-sm mt-2">
        Browse marketplace
      </Link>
    </div>
  );
}
