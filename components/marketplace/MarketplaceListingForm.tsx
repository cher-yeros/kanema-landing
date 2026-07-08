"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { marketplaceMediaUploadUrl } from "@/lib/graphql-env";
import {
  CREATE_MARKETPLACE_LISTING_MUTATION,
  PUBLISH_MARKETPLACE_LISTING_MUTATION,
} from "@/lib/marketplace-graphql";

const LISTING_TYPES = [
  { value: "PRODUCT", label: "Physical product" },
  { value: "RENTAL", label: "Equipment rental" },
  { value: "DIGITAL", label: "Digital asset" },
  { value: "SERVICE", label: "Creative service" },
  { value: "WANTED", label: "Wanted listing" },
  { value: "AUCTION", label: "Auction" },
];

export function MarketplaceListingForm() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const [listingType, setListingType] = useState("PRODUCT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [digitalUrl, setDigitalUrl] = useState("");
  const [auctionEnds, setAuctionEnds] = useState("");
  const [minBid, setMinBid] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createListing, { loading }] = useMutation(
    CREATE_MARKETPLACE_LISTING_MUTATION,
  );
  const [publishListing] = useMutation(PUBLISH_MARKETPLACE_LISTING_MUTATION);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/marketplace/new")}`,
      );
    }
  }, [me, meLoading, router]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(marketplaceMediaUploadUrl(), {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      setMediaUrls((prev) => [...prev, json.url!]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(publish: boolean) {
    setError(null);
    try {
      const input: Record<string, unknown> = {
        listing_type: listingType,
        title: title.trim(),
        description: description.trim() || null,
        price: price.trim() || "0",
        currency: "ETB",
        location: location.trim() || null,
        brand: brand.trim() || null,
        condition: condition || null,
        media: mediaUrls.map((url, i) => ({
          kind: "image",
          url,
          sort_order: i,
        })),
      };

      if (listingType === "WANTED") {
        input.budget_min = budgetMin || null;
        input.budget_max = budgetMax || null;
      }
      if (listingType === "DIGITAL") {
        input.digital_delivery_url = digitalUrl.trim() || null;
      }
      if (listingType === "AUCTION") {
        input.auction_ends_at = auctionEnds
          ? new Date(auctionEnds).toISOString()
          : null;
        input.min_bid_increment = minBid || null;
      }
      if (listingType === "RENTAL") {
        input.rental_details = {
          daily_rate: dailyRate || null,
          weekly_rate: weeklyRate || null,
          deposit: deposit || null,
          pickup_location: location.trim() || null,
        };
      }

      const res = await createListing({ variables: { input } });
      const id = (
        res.data as { createMarketplaceListing: { id: string; slug: string } }
      )?.createMarketplaceListing;
      if (!id) throw new Error("Create failed");

      if (publish) {
        await publishListing({ variables: { id: id.id } });
      }
      router.push(`/marketplace/l/${id.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    }
  }

  if (meLoading) {
    return <p className="py-3">Loading…</p>;
  }
  if (!me) return null;

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-panel">
        <form
          className="php-email-form"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="mb-3">
            <label className="form-label">Listing type</label>
            <select
              className="form-select"
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {listingType !== "WANTED" && (
            <div className="mb-3">
              <label className="form-label">Price (ETB)</label>
              <input
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}

          {listingType === "WANTED" && (
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Budget min</label>
                <input
                  className="form-control"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Budget max</label>
                <input
                  className="form-control"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>
          )}

          {listingType === "RENTAL" && (
            <div className="row g-3 mb-3">
              <div className="col-4">
                <label className="form-label">Daily rate</label>
                <input
                  className="form-control"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Weekly rate</label>
                <input
                  className="form-control"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label className="form-label">Deposit</label>
                <input
                  className="form-control"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>
            </div>
          )}

          {listingType === "DIGITAL" && (
            <div className="mb-3">
              <label className="form-label">
                Delivery URL (hidden until confirmed)
              </label>
              <input
                className="form-control"
                value={digitalUrl}
                onChange={(e) => setDigitalUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
          )}

          {listingType === "AUCTION" && (
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label">Ends at</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={auctionEnds}
                  onChange={(e) => setAuctionEnds(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Min bid increment</label>
                <input
                  className="form-control"
                  value={minBid}
                  onChange={(e) => setMinBid(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Location</label>
              <input
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Brand</label>
              <input
                className="form-control"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          {(listingType === "PRODUCT" || listingType === "AUCTION") && (
            <div className="mb-3">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="">—</option>
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like new</option>
                <option value="USED">Used</option>
                <option value="FOR_PARTS">For parts</option>
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Photos</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={onUpload}
              disabled={uploading}
            />
            {mediaUrls.length > 0 && (
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {mediaUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="rounded"
                    style={{ width: 72, height: 72, objectFit: "cover" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={loading || !title.trim()}
              onClick={() => onSubmit(false)}
            >
              Save draft
            </button>
            <button
              type="button"
              className="btn btn-accent"
              disabled={loading || !title.trim()}
              onClick={() => onSubmit(true)}
            >
              {loading ? "Saving…" : "Publish listing"}
            </button>
            <Link href="/marketplace/mine" className="btn btn-ghost">
              My listings
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
