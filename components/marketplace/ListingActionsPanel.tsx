"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  CREATE_MARKETPLACE_INQUIRY_MUTATION,
  CREATE_WANTED_OFFER_MUTATION,
  PLACE_AUCTION_BID_MUTATION,
  REPORT_MARKETPLACE_LISTING_MUTATION,
} from "@/lib/marketplace-graphql";

type Listing = {
  id: string;
  slug: string;
  listing_type: string;
  title: string;
  price: string;
  currency: string;
  current_bid_amount: string | null;
  min_bid_increment?: string | null;
  auction_ends_at: string | null;
  seller: { id: string };
};

export function ListingActionsPanel({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const [message, setMessage] = useState("");
  const [rentalStart, setRentalStart] = useState("");
  const [rentalEnd, setRentalEnd] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createInquiry, { loading: inquiring }] = useMutation(
    CREATE_MARKETPLACE_INQUIRY_MUTATION,
  );
  const [createOffer, { loading: offering }] = useMutation(
    CREATE_WANTED_OFFER_MUTATION,
  );
  const [placeBid, { loading: bidding }] = useMutation(
    PLACE_AUCTION_BID_MUTATION,
  );
  const [reportListing, { loading: reporting }] = useMutation(
    REPORT_MARKETPLACE_LISTING_MUTATION,
  );

  useEffect(() => setMounted(true), []);

  function requireLogin(): boolean {
    if (!meLoading && !me) {
      router.push(
        `/election/login?next=${encodeURIComponent(`/marketplace/l/${listing.slug}`)}`,
      );
      return false;
    }
    return true;
  }

  async function onContact(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setError(null);
    try {
      await createInquiry({
        variables: {
          input: {
            listing_id: listing.id,
            message: message.trim(),
            rental_start_date: rentalStart || null,
            rental_end_date: rentalEnd || null,
          },
        },
      });
      setSuccess("Inquiry sent! Check your inbox.");
      setMessage("");
      router.push("/marketplace/inquiries");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry");
    }
  }

  async function onOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setError(null);
    try {
      await createOffer({
        variables: {
          input: {
            wanted_listing_id: listing.id,
            offered_price: offerPrice || null,
            message: offerMessage.trim() || null,
          },
        },
      });
      setSuccess("Offer submitted!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    }
  }

  async function onBid(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setError(null);
    try {
      await placeBid({
        variables: {
          input: {
            auction_listing_id: listing.id,
            amount: bidAmount.trim(),
          },
        },
      });
      setSuccess("Bid placed!");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
    }
  }

  async function onReport(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setError(null);
    try {
      await reportListing({
        variables: {
          input: { listing_id: listing.id, reason: reportReason.trim() },
        },
      });
      setSuccess("Report submitted. Thank you.");
      setReportReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to report");
    }
  }

  const panel = (
    <div className="form-panel form-panel--compact">
      {error && <div className="alert alert-danger small py-2">{error}</div>}
      {success && (
        <div className="alert alert-success small py-2">{success}</div>
      )}

      {listing.listing_type === "WANTED" ? (
        <form onSubmit={onOffer} className="php-email-form">
          <h3 className="h6">Submit an offer</h3>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Your price (ETB)"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
          />
          <textarea
            className="form-control form-control-sm mb-2"
            rows={3}
            placeholder="Message to buyer"
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-accent w-100"
            disabled={offering}
          >
            {offering ? "Sending…" : "Submit offer"}
          </button>
        </form>
      ) : listing.listing_type === "AUCTION" ? (
        <form onSubmit={onBid} className="php-email-form">
          <h3 className="h6">Place a bid</h3>
          <p className="small text-muted">
            Min increment: {listing.min_bid_increment ?? "1"} {listing.currency}
          </p>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Bid amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-accent w-100"
            disabled={bidding}
          >
            {bidding ? "Placing…" : "Place bid"}
          </button>
        </form>
      ) : (
        <form onSubmit={onContact} className="php-email-form">
          <h3 className="h6">Contact seller</h3>
          {listing.listing_type === "RENTAL" && (
            <div className="row g-2 mb-2">
              <div className="col-6">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={rentalStart}
                  onChange={(e) => setRentalStart(e.target.value)}
                  aria-label="Rental start"
                />
              </div>
              <div className="col-6">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={rentalEnd}
                  onChange={(e) => setRentalEnd(e.target.value)}
                  aria-label="Rental end"
                />
              </div>
            </div>
          )}
          <textarea
            className="form-control form-control-sm mb-2"
            rows={4}
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-accent w-100"
            disabled={inquiring}
          >
            {inquiring ? "Sending…" : "Send inquiry"}
          </button>
        </form>
      )}

      <hr className="my-3" />
      <form onSubmit={onReport} className="php-email-form">
        <h3 className="h6 text-muted">Report listing</h3>
        <textarea
          className="form-control form-control-sm mb-2"
          rows={2}
          placeholder="Reason"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-ghost btn-sm w-100"
          disabled={reporting || !reportReason.trim()}
        >
          Report
        </button>
      </form>
    </div>
  );

  if (!mounted) return null;
  const target = document.getElementById("listing-actions");
  return target ? createPortal(panel, target) : panel;
}
