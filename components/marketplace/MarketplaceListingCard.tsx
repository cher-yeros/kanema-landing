import Link from "next/link";
import type { PublicMarketplaceListing } from "@/lib/marketplace-public";

function formatPrice(listing: PublicMarketplaceListing): string {
  if (listing.listing_type === "WANTED") {
    const min = listing.budget_min;
    const max = listing.budget_max;
    if (min && max) return `${min}–${max} ${listing.currency}`;
    if (min) return `From ${min} ${listing.currency}`;
    return "Budget negotiable";
  }
  if (listing.listing_type === "AUCTION") {
    const bid = listing.current_bid_amount ?? listing.price;
    return `Bid: ${bid} ${listing.currency}`;
  }
  if (listing.listing_type === "RENTAL" && listing.rental_details?.daily_rate) {
    return `${listing.rental_details.daily_rate} ${listing.currency}/day`;
  }
  const amount = Number.parseFloat(listing.price);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : listing.price;
  if (listing.price_type === "STARTING")
    return `From ${formatted} ${listing.currency}`;
  return `${formatted} ${listing.currency}`;
}

function typeLabel(type: string): string {
  return type.replace(/_/g, " ").toLowerCase();
}

function listingImageUrl(listing: PublicMarketplaceListing): string | null {
  if (listing.cover_url) return listing.cover_url;
  const firstImage = listing.media?.find((m) => m.kind === "image");
  return firstImage?.url ?? null;
}

export function MarketplaceListingCard({
  listing,
}: {
  listing: PublicMarketplaceListing;
}) {
  const imageUrl = listingImageUrl(listing);
  const description =
    listing.description?.trim() || "Open the listing for full details.";

  return (
    <article className="offering-block marketplace-listing-card h-100">
      <div className="offering-indicator" />
      <Link
        href={`/marketplace/l/${listing.slug}`}
        className="marketplace-listing-card__media d-block"
        tabIndex={-1}
        aria-hidden
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={listing.title} loading="lazy" />
        ) : (
          <div className="marketplace-listing-card__placeholder">
            <i className="bi bi-camera" aria-hidden />
          </div>
        )}
      </Link>
      <div className="offering-body">
        <div className="offering-header">
          <h4>
            <Link href={`/marketplace/l/${listing.slug}`}>{listing.title}</Link>
          </h4>
          {listing.is_featured ? (
            <span className="featured-tag">Featured</span>
          ) : (
            <span className="featured-tag">{formatPrice(listing)}</span>
          )}
        </div>
        <p className="small text-muted mb-2">
          {[typeLabel(listing.listing_type), listing.location, listing.brand]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="small mb-2">
          <span className="seller-badge">
            {listing.seller.is_verified_seller && (
              <i className="bi bi-patch-check-fill" title="Verified seller" />
            )}
            {listing.seller.full_name}
            {listing.seller.rating_avg && (
              <span className="ms-1">
                <i className="bi bi-star-fill text-warning" />{" "}
                {listing.seller.rating_avg}
              </span>
            )}
          </span>
        </p>
        <p className="marketplace-listing-card__desc">{description}</p>
        <Link
          href={`/marketplace/l/${listing.slug}`}
          className="explore-btn d-inline-flex"
          aria-label={`View ${listing.title}`}
        >
          View listing <i className="bi bi-arrow-right" />
        </Link>
      </div>
    </article>
  );
}
