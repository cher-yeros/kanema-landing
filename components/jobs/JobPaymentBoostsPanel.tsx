"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client/react";

import { JobsFilterCheckbox } from "@/components/jobs/JobsFilterCheckbox";
import {
  INITIATE_JOB_POSTING_PAYMENT_MUTATION,
  redirectToChapaCheckout,
} from "@/lib/jobs-graphql";
import { JOBS_BOOST_ADDONS, formatJobsPrice } from "@/lib/jobs-pricing-config";

type Props = {
  jobId: string;
  baseFeeAmount: string;
  chapaEnabled: boolean;
  onPaid?: () => void;
};

export function JobPaymentBoostsPanel({
  jobId,
  baseFeeAmount,
  chapaEnabled,
  onPaid,
}: Props) {
  const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initiatePayment, { loading }] = useMutation<{
    initiateJobPostingPayment: {
      status: string;
      message: string;
      checkout_url?: string | null;
    };
  }>(INITIATE_JOB_POSTING_PAYMENT_MUTATION);

  const baseFee = Number.parseFloat(baseFeeAmount);
  const safeBase = Number.isFinite(baseFee) ? Math.max(0, baseFee) : 0;

  const boostTotal = useMemo(
    () =>
      selectedBoosts.reduce((sum, id) => {
        const addon = JOBS_BOOST_ADDONS.find((item) => item.id === id);
        return sum + (addon?.price ?? 0);
      }, 0),
    [selectedBoosts],
  );

  const estimatedTotal = safeBase + boostTotal;

  function toggleBoost(id: string) {
    setSelectedBoosts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function onCheckout() {
    setError(null);
    try {
      const { data } = await initiatePayment({
        variables: {
          job_id: jobId,
          boost_ids: selectedBoosts.length > 0 ? selectedBoosts : null,
        },
      });
      const payload = data?.initiateJobPostingPayment;
      if (!payload || payload.status !== "success") {
        throw new Error(payload?.message || "Could not start checkout.");
      }
      if (payload.checkout_url) {
        if (!redirectToChapaCheckout(payload)) {
          throw new Error(payload.message || "Could not start checkout.");
        }
        return;
      }
      onPaid?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    }
  }

  return (
    <div className="job-payment-boosts">
      <h3 className="h6 mb-2">Optional boosts</h3>
      <p className="small text-muted mb-3">
        Add visibility add-ons to this checkout before publishing.
      </p>
      <div className="d-flex flex-column gap-2 mb-3">
        {JOBS_BOOST_ADDONS.map((addon) => (
          <JobsFilterCheckbox
            key={addon.id}
            checked={selectedBoosts.includes(addon.id)}
            onChange={() => toggleBoost(addon.id)}
          >
            <strong>{addon.name}</strong>
            <span className="text-muted">
              {" "}
              — {formatJobsPrice(addon.price)}
            </span>
          </JobsFilterCheckbox>
        ))}
      </div>
      <p className="small mb-3">
        Checkout total:{" "}
        <strong>
          {estimatedTotal <= 0 ? "Free" : formatJobsPrice(estimatedTotal)}
        </strong>
        {safeBase > 0 ? (
          <span className="text-muted">
            {" "}
            (base {formatJobsPrice(safeBase)}
            {boostTotal > 0 ? ` + boosts ${formatJobsPrice(boostTotal)}` : ""})
          </span>
        ) : null}
      </p>
      {error ? <div className="error-message d-block mb-3">{error}</div> : null}
      {chapaEnabled ? (
        <button
          type="button"
          className="btn btn-sm btn-accent"
          disabled={loading || (safeBase <= 0 && selectedBoosts.length === 0)}
          onClick={() => void onCheckout()}
        >
          {loading
            ? "Starting…"
            : safeBase > 0
              ? "Pay to publish"
              : "Pay for boosts"}
        </button>
      ) : (
        <p className="text-muted small mb-0">
          Online payment is not enabled yet. Contact support to complete
          publishing.
        </p>
      )}
    </div>
  );
}
