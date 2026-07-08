"use client";

import Link from "next/link";
import { SellerBadge } from "./SellerBadge";

type Listing = {
  id: string;
  slug: string;
  listing_type: string;
  title: string;
  description: string | null;
  specifications_json?: string | null;
  condition: string | null;
  warranty?: string | null;
  location: string | null;
  brand: string | null;
  price: string;
  currency: string;
  price_type: string;
  budget_min: string | null;
  budget_max: string | null;
  auction_ends_at: string | null;
  current_bid_amount: string | null;
  min_bid_increment?: string | null;
  cover_url: string | null;
  seller: {
    id: string;
    full_name: string;
    is_verified: boolean;
    is_verified_seller: boolean;
    rating_avg: string | null;
    review_count: number;
  };
  media?: { id: string; kind: string; url: string }[];
  packages?: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    delivery_days: number;
  }[];
  rental_details?: {
    daily_rate: string | null;
    weekly_rate: string | null;
    deposit: string | null;
    pickup_location: string | null;
    delivery_available: boolean;
  } | null;
  rental_blocks?: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  }[];
};

export function StoreHeader({
  store,
}: {
  store: {
    slug: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    follower_count: number;
    rating_avg: string;
    review_count: number;
    is_verified: boolean;
    listing_count: number;
    owner: {
      full_name: string;
      is_verified_seller: boolean;
      rating_avg: string | null;
    };
  };
}) {
  return (
    <div className="mb-4 p-4 rounded border">
      <div className="d-flex flex-wrap align-items-center gap-3">
        {store.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logo_url}
            alt=""
            className="rounded"
            width={64}
            height={64}
          />
        )}
        <div>
          <h1 className="h3 mb-1">
            {store.name}
            {store.is_verified && (
              <i
                className="bi bi-patch-check-fill text-primary ms-2"
                title="Verified store"
              />
            )}
          </h1>
          <p className="small text-muted mb-0">
            {store.listing_count} products · {store.follower_count} followers ·{" "}
            <i className="bi bi-star-fill text-warning" /> {store.rating_avg} (
            {store.review_count} reviews)
          </p>
          {store.description && (
            <p className="mt-2 mb-0">{store.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ListingDetailView({ listing }: { listing: Listing }) {
  const images =
    listing.media?.filter((m) => m.kind === "image") ??
    (listing.cover_url
      ? [{ id: "cover", kind: "image", url: listing.cover_url }]
      : []);

  return (
    <div className="container py-4">
      <nav className="small mb-3">
        <Link href="/marketplace">Marketplace</Link>
        {" / "}
        <span>{listing.title}</span>
      </nav>

      <div className="row gy-4">
        <div className="col-lg-7">
          {images.length > 0 ? (
            <div className="marketplace-detail-cover mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0].url} alt={listing.title} />
            </div>
          ) : (
            <div className="marketplace-listing-card__placeholder rounded mb-3">
              <i className="bi bi-camera fs-1" aria-hidden />
            </div>
          )}
          {images.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {images.slice(1).map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="marketplace-detail-thumb"
                />
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <span className="featured-tag text-uppercase small">
            {listing.listing_type.replace(/_/g, " ")}
          </span>
          <h1 className="h2 mt-2">{listing.title}</h1>
          <p className="mb-2">
            <SellerBadge seller={listing.seller} />
          </p>
          <p className="lead fw-semibold mb-3">
            {listing.listing_type === "WANTED"
              ? `${listing.budget_min ?? "?"}–${listing.budget_max ?? "?"} ${listing.currency}`
              : listing.listing_type === "AUCTION"
                ? `Current bid: ${listing.current_bid_amount ?? listing.price} ${listing.currency}`
                : `${listing.price} ${listing.currency}`}
          </p>

          <ul className="list-unstyled small text-muted mb-4">
            {listing.location && (
              <li>
                <i className="bi bi-geo-alt me-1" /> {listing.location}
              </li>
            )}
            {listing.brand && (
              <li>
                <i className="bi bi-tag me-1" /> {listing.brand}
              </li>
            )}
            {listing.condition && (
              <li>
                <i className="bi bi-box me-1" />{" "}
                {listing.condition.replace(/_/g, " ")}
              </li>
            )}
            {listing.warranty && (
              <li>
                <i className="bi bi-shield-check me-1" /> {listing.warranty}
              </li>
            )}
            {listing.auction_ends_at && (
              <li>
                <i className="bi bi-clock me-1" /> Ends{" "}
                {new Date(listing.auction_ends_at).toLocaleString()}
              </li>
            )}
          </ul>

          <div id="listing-actions" />
        </div>
      </div>

      {listing.description && (
        <section className="mt-5">
          <h2 className="h5">Description</h2>
          <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {listing.description}
          </p>
        </section>
      )}

      {listing.rental_details && (
        <section className="mt-4">
          <h2 className="h5">Rental details</h2>
          <ul className="small">
            {listing.rental_details.daily_rate && (
              <li>
                Daily: {listing.rental_details.daily_rate} {listing.currency}
              </li>
            )}
            {listing.rental_details.weekly_rate && (
              <li>
                Weekly: {listing.rental_details.weekly_rate} {listing.currency}
              </li>
            )}
            {listing.rental_details.deposit && (
              <li>
                Deposit: {listing.rental_details.deposit} {listing.currency}
              </li>
            )}
            {listing.rental_details.pickup_location && (
              <li>Pickup: {listing.rental_details.pickup_location}</li>
            )}
            {listing.rental_details.delivery_available && (
              <li>Delivery available</li>
            )}
          </ul>
          {listing.rental_blocks && listing.rental_blocks.length > 0 && (
            <>
              <h3 className="h6">Unavailable dates</h3>
              <ul className="small text-muted">
                {listing.rental_blocks.map((b) => (
                  <li key={b.id}>
                    {b.start_date} – {b.end_date} ({b.status})
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {listing.packages && listing.packages.length > 0 && (
        <section className="mt-4">
          <h2 className="h5">Packages</h2>
          <div className="row gy-3">
            {listing.packages.map((pkg) => (
              <div className="col-md-6" key={pkg.id}>
                <div className="border rounded p-3 h-100">
                  <h3 className="h6">{pkg.name}</h3>
                  <p className="small text-muted mb-1">{pkg.description}</p>
                  <p className="fw-semibold mb-0">
                    {pkg.price} {listing.currency} · {pkg.delivery_days} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {listing.specifications_json && (
        <section className="mt-4">
          <h2 className="h5">Specifications</h2>
          <pre className="small bg-light p-3 rounded">
            {listing.specifications_json}
          </pre>
        </section>
      )}
    </div>
  );
}
