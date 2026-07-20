import Link from "next/link";

type Seller = {
  id: string;
  full_name: string;
  is_verified: boolean;
  is_verified_seller: boolean;
  rating_avg: string | null;
  review_count: number;
};

export function SellerBadge({ seller }: { seller: Seller }) {
  return (
    <span className="seller-badge">
      <Link href={`/discussion/u/${seller.id}`} className="text-decoration-none">
        {seller.full_name}
      </Link>
      {seller.is_verified_seller && (
        <span className="ms-1" title="Verified seller">
          <i className="bi bi-patch-check-fill" /> Verified seller
        </span>
      )}
      {seller.rating_avg && (
        <span className="ms-2 text-muted">
          <i className="bi bi-star-fill text-warning" /> {seller.rating_avg} (
          {seller.review_count})
        </span>
      )}
    </span>
  );
}
