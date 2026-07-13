import Link from "next/link";
import {
  fetchMarketplaceListings,
  fetchMarketplaceStores,
} from "@/lib/marketplace-public";
import { MarketplaceListingCard } from "@/components/marketplace/MarketplaceListingCard";
import { MarketplaceModuleCard } from "@/components/marketplace/MarketplaceModuleCard";
import { MarketplaceHeroActions } from "@/components/marketplace/MarketplaceHeroActions";

export default async function MarketplaceHubPage() {
  let featured: Awaited<ReturnType<typeof fetchMarketplaceListings>> = [];
  let stores: Awaited<ReturnType<typeof fetchMarketplaceStores>> = [];
  try {
    [featured, stores] = await Promise.all([
      fetchMarketplaceListings({ limit: 6, sort: "popular" }),
      fetchMarketplaceStores({ limit: 4 }),
    ]);
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
                  Equipment · Digital · Services
                </span>
                <div className="d-flex flex-wrap gap-2 mt-3 mb-2">
                  <span className="featured-tag">Verified sellers</span>
                  <span className="featured-tag">Ethiopian creatives</span>
                </div>
                <h1>Canma Marketplace</h1>
                <p>
                  A trusted marketplace where Ethiopian creatives can buy, sell,
                  rent, and discover creative equipment, digital assets, and
                  professional services—all integrated with Canma member
                  profiles.
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

      <section
        id="browse-modules"
        className="services section"
        aria-labelledby="modulesHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="modulesHeading">Marketplace modules</h2>
          <p>
            Physical gear, rentals, digital assets, freelance services, wanted
            posts, and auctions—one hub for the creative economy.
          </p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <MarketplaceModuleCard
              title="Physical products"
              description="Cameras, lenses, lighting, audio, drones, and production accessories."
              icon="📷"
              href="/marketplace/products"
            />
            <MarketplaceModuleCard
              title="Equipment rental"
              description="Rent cinema cameras, gimbals, lights, and drones without the upfront cost."
              icon="🎥"
              href="/marketplace/rentals"
            />
            <MarketplaceModuleCard
              title="Digital marketplace"
              description="LUT packs, presets, templates, motion graphics, music, and SFX."
              icon="💾"
              href="/marketplace/digital"
            />
            <MarketplaceModuleCard
              title="Creative services"
              description="Photography, videography, editing, color grading, and design—like local Fiverr."
              icon="🎨"
              href="/marketplace/services"
            />
            <MarketplaceModuleCard
              title="Wanted listings"
              description="Post what you need; sellers respond with offers."
              icon="🔍"
              href="/marketplace/wanted"
            />
            <MarketplaceModuleCard
              title="Auctions"
              description="Bid on second-hand gear with transparent end times."
              icon="🔨"
              href="/marketplace/auctions"
            />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="services section" aria-labelledby="featuredHeading">
          <div className="container section-title" data-aos="fade-up">
            <h2 id="featuredHeading">Popular listings</h2>
          </div>
          <div className="container" data-aos="fade-up">
            <div className="row gy-4">
              {featured.map((listing) => (
                <div className="col-lg-4 col-md-6" key={listing.id}>
                  <MarketplaceListingCard listing={listing} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
