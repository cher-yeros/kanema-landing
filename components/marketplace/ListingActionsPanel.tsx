"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  CREATE_MARKETPLACE_INQUIRY_MUTATION,
  MY_DIGITAL_PURCHASE_BY_LISTING_QUERY,
  PURCHASE_DIGITAL_PRODUCT_MUTATION,
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
  const isDigital = listing.listing_type === "DIGITAL";
  const isOwner = Boolean(me?.id && me.id === listing.seller.id);

  const [message, setMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deliveryUrl, setDeliveryUrl] = useState<string | null>(null);

  const { data: purchaseData, refetch: refetchPurchase } = useQuery<{
    myDigitalPurchaseByListing: {
      id: string;
      payment_status: string;
      digital_delivery_url: string | null;
    } | null;
  }>(MY_DIGITAL_PURCHASE_BY_LISTING_QUERY, {
    variables: { listing_id: listing.id },
    skip: !me || !isDigital || isOwner,
    fetchPolicy: "network-only",
  });

  const [createInquiry, { loading: inquiring }] = useMutation(
    CREATE_MARKETPLACE_INQUIRY_MUTATION,
  );
  const [purchaseDigital, { loading: purchasing }] = useMutation(
    PURCHASE_DIGITAL_PRODUCT_MUTATION,
  );
  const [reportListing, { loading: reporting }] = useMutation(
    REPORT_MARKETPLACE_LISTING_MUTATION,
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const url =
      purchaseData?.myDigitalPurchaseByListing?.digital_delivery_url ?? null;
    if (url) setDeliveryUrl(url);
  }, [purchaseData]);

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
          },
        },
      });
      setSuccess("Message sent! Check your inbox.");
      setMessage("");
      router.push("/marketplace/messages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  async function onBuyDigital(e: React.FormEvent) {
    e.preventDefault();
    if (!requireLogin()) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await purchaseDigital({
        variables: { listing_id: listing.id },
      });
      const payload = (
        res.data as {
          purchaseDigitalProduct: {
            message: string;
            checkout_url: string | null;
            digital_delivery_url: string | null;
          };
        }
      )?.purchaseDigitalProduct;
      if (!payload) throw new Error("Purchase failed");

      if (payload.checkout_url) {
        window.location.href = payload.checkout_url;
        return;
      }

      if (payload.digital_delivery_url) {
        setDeliveryUrl(payload.digital_delivery_url);
      }
      setSuccess(payload.message);
      await refetchPurchase();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
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

  const ownedPurchase = purchaseData?.myDigitalPurchaseByListing;
  const alreadyUnlocked =
    Boolean(deliveryUrl) ||
    ownedPurchase?.payment_status === "CONFIRMED" ||
    ownedPurchase?.payment_status === "FREE";

  const panel = (
    <div className="form-panel form-panel--compact">
      {error && <div className="alert alert-danger small py-2">{error}</div>}
      {success && (
        <div className="alert alert-success small py-2">{success}</div>
      )}

      {isDigital ? (
        <form onSubmit={onBuyDigital} className="php-email-form">
          <h3 className="h6">Buy digital product</h3>
          <p className="small text-muted">
            {Number(listing.price) > 0
              ? `Pay ${listing.price} ${listing.currency} with Chapa. Instant download after payment.`
              : "This digital product is free. Claim it to unlock the download."}
          </p>
          {isOwner ? (
            <p className="small text-muted mb-0">
              This is your listing. Buyers pay via Chapa; Canma applies a
              commission on each sale.
            </p>
          ) : alreadyUnlocked ? (
            <div>
              <p className="small text-success mb-2">Download unlocked.</p>
              {deliveryUrl ? (
                <a
                  href={deliveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent w-100"
                >
                  Open download
                </a>
              ) : (
                <p className="small text-muted mb-0">
                  Refresh after payment confirmation to see your file link.
                </p>
              )}
            </div>
          ) : (
            <button
              type="submit"
              className="btn btn-accent w-100"
              disabled={purchasing}
            >
              {purchasing
                ? "Starting…"
                : Number(listing.price) > 0
                  ? "Buy with Chapa"
                  : "Get free download"}
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={onContact} className="php-email-form">
          <h3 className="h6">Contact seller</h3>
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
            {inquiring ? "Sending…" : "Send message"}
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
