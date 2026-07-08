import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchMarketplaceStoreBySlug } from "@/lib/marketplace-public";
import { StoreHeader } from "@/components/marketplace/ListingDetailView";
import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";

type Props = { params: Promise<{ slug: string }> };

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  let store: Awaited<ReturnType<typeof fetchMarketplaceStoreBySlug>> = null;
  try {
    store = await fetchMarketplaceStoreBySlug(slug);
  } catch {
    store = null;
  }
  if (!store) notFound();

  return (
    <div className="container py-4">
      <nav className="small mb-3">
        <Link href="/marketplace">Marketplace</Link> / {store.name}
      </nav>
      <StoreHeader store={store} />
      {store.about_md && (
        <section className="mb-4">
          <h2 className="h5">About</h2>
          <p className="text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {store.about_md}
          </p>
        </section>
      )}
      <h2 className="h5 mb-3">Products</h2>
      <div className="row gy-4">
        {store.listings.map((listing) => (
          <div className="col-lg-4 col-md-6" key={listing.id}>
            <MarketplaceListingCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
}
