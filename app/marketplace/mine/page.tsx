"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect } from "react";

import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  MY_MARKETPLACE_LISTINGS_QUERY,
  MY_MARKETPLACE_STORE_QUERY,
  PUBLISH_MARKETPLACE_LISTING_MUTATION,
} from "@/lib/marketplace-graphql";

export default function MyListingsPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const { data, loading, refetch } = useQuery<{
    myMarketplaceListings: {
      id: string;
      slug: string;
      title: string;
      listing_type: string;
      status: string;
      price: string;
      currency: string;
      cover_url: string | null;
    }[];
  }>(MY_MARKETPLACE_LISTINGS_QUERY, { skip: !me });

  const { data: storeData } = useQuery<{
    myMarketplaceStore: { slug: string; name: string } | null;
  }>(MY_MARKETPLACE_STORE_QUERY, { skip: !me });

  const [publishListing] = useMutation(PUBLISH_MARKETPLACE_LISTING_MUTATION);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/marketplace/mine")}`,
      );
    }
  }, [me, meLoading, router]);

  if (meLoading || loading) {
    return (
      <MarketplacePageShell title="My listings">
        <p className="py-3">Loading…</p>
      </MarketplacePageShell>
    );
  }
  if (!me) return null;

  const listings = data?.myMarketplaceListings ?? [];
  const store = storeData?.myMarketplaceStore;

  return (
    <MarketplacePageShell
      title="My listings"
      description="Manage drafts, published listings, and your storefront."
    >
      <div className="d-flex flex-wrap justify-content-end gap-2 mb-4">
        <Link href="/marketplace/new" className="btn btn-accent btn-sm">
          New listing
        </Link>
        <Link href="/marketplace/stores/new" className="btn btn-ghost btn-sm">
          {store ? "Edit store" : "Create store"}
        </Link>
      </div>

      {store && (
        <p className="small text-muted mb-4">
          Your store:{" "}
          <Link href={`/marketplace/stores/${store.slug}`}>{store.name}</Link>
        </p>
      )}

      {listings.length === 0 ? (
        <div className="alert alert-light border">
          <p className="mb-2">You have not created any listings yet.</p>
          <Link href="/marketplace/new" className="btn btn-accent btn-sm">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Type</th>
                <th>Status</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/marketplace/l/${l.slug}`}>{l.title}</Link>
                  </td>
                  <td className="small text-muted">{l.listing_type}</td>
                  <td>
                    <span className="badge bg-secondary">{l.status}</span>
                  </td>
                  <td>
                    {l.price} {l.currency}
                  </td>
                  <td className="text-end">
                    {l.status === "DRAFT" && (
                      <button
                        type="button"
                        className="btn btn-sm btn-accent"
                        onClick={async () => {
                          await publishListing({ variables: { id: l.id } });
                          refetch();
                        }}
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MarketplacePageShell>
  );
}
