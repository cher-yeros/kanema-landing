import Link from "next/link";
import {
  fetchMarketplaceListings,
  fetchMarketplaceStores,
} from "@/lib/marketplace-public";
import { MarketplaceHeroActions } from "@/components/marketplace/MarketplaceHeroActions";
import { MarketplaceHubBrowse } from "@/components/marketplace/MarketplaceHubBrowse";

export default async function MarketplaceHubPage() {
  let featured: Awaited<ReturnType<typeof fetchMarketplaceListings>> = [];
  let stores: Awaited<ReturnType<typeof fetchMarketplaceStores>> = [];
  try {
    const [products, digital, storeRows] = await Promise.all([
      fetchMarketplaceListings({
        limit: 48,
        sort: "popular",
        listing_type: "PRODUCT",
      }),
      fetchMarketplaceListings({
        limit: 48,
        sort: "popular",
        listing_type: "DIGITAL",
      }),
      fetchMarketplaceStores({ limit: 4 }),
    ]);
    featured = [...products, ...digital];
    stores = storeRows;
  } catch {
    featured = [];
    stores = [];
  }

  return (
    <>
      <section id="marketplace-hero" className="hero section">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
              <div className="hero-heading">
                <span className="badge-label">
                  Products · Digital downloads
                </span>
                <div className="d-flex flex-wrap gap-2 mt-3 mb-2">
                  <span className="featured-tag">Verified sellers</span>
                  <span className="featured-tag">Chapa checkout</span>
                </div>
                <h1>Canma Marketplace</h1>
                <p>
                  Buy and sell creative gear, and sell digital assets like LUTs,
                  presets, and templates. Uploading digital products is free —
                  buyers pay via Chapa with a platform commission on each sale.
                </p>
                <MarketplaceHeroActions />
              </div>
            </div>
            <div className="col-lg-5" data-aos="fade-left" data-aos-delay="200">
              <div className="showcase-image">
                <img
                  src="/img/about/about-us.png"
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketplaceHubBrowse listings={featured} />

      {stores.length > 0 && (
        <section className="services section" aria-labelledby="storesHeading">
          <div className="container section-title" data-aos="fade-up">
            <h2 id="storesHeading">Storefronts</h2>
            <p>Professional shops and studios on Canma.</p>
          </div>
          <div className="container" data-aos="fade-up">
            <div className="row gy-4">
              {stores.map((store) => (
                <div className="col-md-6 col-lg-3" key={store.id}>
                  <Link
                    href={`/marketplace/stores/${store.slug}`}
                    className="offering-block h-100 text-decoration-none text-body d-block p-3"
                  >
                    <h4 className="h6 mb-1">{store.name}</h4>
                    <p className="small text-muted mb-0">
                      {store.listing_count} products · {store.follower_count}{" "}
                      followers
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
