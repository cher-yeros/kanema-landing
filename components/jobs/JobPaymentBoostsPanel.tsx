"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

import { JobsFilterCheckbox } from "@/components/jobs/JobsFilterCheckbox";
import {
  INITIATE_JOB_POSTING_PAYMENT_MUTATION,
  JOB_POSTING_QUOTA_QUERY,
  redirectToChapaCheckout,
} from "@/lib/jobs-graphql";
import {
  JOBS_BOOST_ADDONS,
  JOBS_FREE_MONTHLY_POST_LIMIT,
  JOBS_STANDARD_PER_JOB_PRICE,
  formatJobsPrice,
} from "@/lib/jobs-pricing-config";

export type JobPostingBillingSource =
  | "FREE_TIER"
  | "SUBSCRIPTION"
  | "PAY_PER_JOB";

type Props = {
  jobId: string;
  /** Full checkout after approval, or boosts-only on an already-live free post. */
  mode?: "checkout" | "boosts_only";
  chapaEnabled: boolean;
  onPaid?: () => void;
};

function formatPlanName(planId: string): string {
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

export function JobPaymentBoostsPanel({
  jobId,
  mode = "checkout",
  chapaEnabled,
  onPaid,
}: Props) {
  const [selectedPackage, setSelectedPackage] =
    useState<JobPostingBillingSource | null>(null);
  const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: quotaData } = useQuery<{
    jobPostingQuota: {
      free_posts_used_this_month: number;
      free_posts_limit: number;
      active_subscription_plan: string | null;
      subscription_jobs_used_this_month: number;
      subscription_jobs_limit: number | null;
      subscription_quota_exceeded: boolean;
    };
  }>(JOB_POSTING_QUOTA_QUERY, { skip: mode === "boosts_only" });

  const quota = quotaData?.jobPostingQuota;
  const freeRemaining = quota
    ? Math.max(0, quota.free_posts_limit - quota.free_posts_used_this_month)
    : JOBS_FREE_MONTHLY_POST_LIMIT;
  const freeAvailable =
    Boolean(quota) && !quota?.active_subscription_plan && freeRemaining > 0;
  const hasActiveSubscription = Boolean(quota?.active_subscription_plan);
  const subscriptionAvailable =
    hasActiveSubscription && !quota?.subscription_quota_exceeded;
  const subscriptionNeedsPlan = !hasActiveSubscription;

  const [initiatePayment, { loading }] = useMutation<{
    initiateJobPostingPayment: {
      status: string;
      message: string;
      checkout_url?: string | null;
    };
  }>(INITIATE_JOB_POSTING_PAYMENT_MUTATION);

  const baseFee = useMemo(() => {
    if (mode === "boosts_only") return 0;
    switch (selectedPackage) {
      case "FREE_TIER":
      case "SUBSCRIPTION":
        return 0;
      case "PAY_PER_JOB":
        return JOBS_STANDARD_PER_JOB_PRICE;
      default:
        return 0;
    }
  }, [mode, selectedPackage]);

  const boostTotal = useMemo(
    () =>
      selectedBoosts.reduce((sum, id) => {
        const addon = JOBS_BOOST_ADDONS.find((item) => item.id === id);
        return sum + (addon?.price ?? 0);
      }, 0),
    [selectedBoosts],
  );

  const estimatedTotal = baseFee + boostTotal;

  function toggleBoost(id: string) {
    setSelectedBoosts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function onCheckout() {
    setError(null);
    if (mode === "checkout" && !selectedPackage) {
      setError("Choose a posting package before checkout.");
      return;
    }
    if (mode === "boosts_only" && selectedBoosts.length === 0) {
      setError("Select at least one boost to checkout.");
      return;
    }

    try {
      const { data } = await initiatePayment({
        variables: {
          job_id: jobId,
          billing_source: mode === "checkout" ? selectedPackage : null,
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

  const checkoutDisabled =
    loading ||
    (mode === "checkout" && !selectedPackage) ||
    (mode === "boosts_only" && selectedBoosts.length === 0) ||
    (estimatedTotal > 0 && !chapaEnabled);

  return (
    <div className="job-payment-boosts">
      {mode === "checkout" ? (
        <>
          <h3 className="h6 mb-2">Posting package</h3>
          <p className="small text-muted mb-3">
            Choose how you want to publish this role. Pricing is applied at
            checkout — nothing is selected automatically.
          </p>
          <div className="d-flex flex-column gap-2 mb-4">
            <JobsFilterCheckbox
              checked={selectedPackage === "FREE_TIER"}
              onChange={() => setSelectedPackage("FREE_TIER")}
              disabled={!freeAvailable}
            >
              <strong>Free tier</strong>
              <span className="text-muted">
                {" "}
                —{" "}
                {freeAvailable
                  ? `${freeRemaining} of ${quota?.free_posts_limit ?? JOBS_FREE_MONTHLY_POST_LIMIT} free posts left this month`
                  : quota?.active_subscription_plan
                    ? "Not available while you have an active subscription"
                    : "Free tier limit reached this month"}
              </span>
            </JobsFilterCheckbox>

            {subscriptionAvailable ? (
              <JobsFilterCheckbox
                checked={selectedPackage === "SUBSCRIPTION"}
                onChange={() => setSelectedPackage("SUBSCRIPTION")}
              >
                <strong>Subscription slot</strong>
                <span className="text-muted">
                  {" "}
                  — {formatPlanName(quota!.active_subscription_plan!)} plan ·{" "}
                  {quota!.subscription_jobs_limit == null
                    ? `${quota!.subscription_jobs_used_this_month} posts used this month (unlimited)`
                    : `${quota!.subscription_jobs_used_this_month} of ${quota!.subscription_jobs_limit} included posts used`}
                </span>
              </JobsFilterCheckbox>
            ) : (
              <div className="job-payment-package-cta">
                <div className="job-payment-package-cta__copy">
                  <strong>Subscription slot</strong>
                  <span className="text-muted">
                    {" "}
                    —{" "}
                    {subscriptionNeedsPlan
                      ? "Included posts with a monthly or yearly employer plan"
                      : "Included posts used for this month"}
                  </span>
                </div>
                <Link
                  href="/jobs/pricing"
                  className="btn btn-sm btn-outline-secondary"
                >
                  {subscriptionNeedsPlan ? "Subscribe" : "Upgrade plan"}
                </Link>
              </div>
            )}

            <JobsFilterCheckbox
              checked={selectedPackage === "PAY_PER_JOB"}
              onChange={() => setSelectedPackage("PAY_PER_JOB")}
            >
              <strong>Standard pay-per-job</strong>
              <span className="text-muted">
                {" "}
                — {formatJobsPrice(JOBS_STANDARD_PER_JOB_PRICE)} per posting
              </span>
            </JobsFilterCheckbox>
          </div>
        </>
      ) : null}

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
          {mode === "checkout" && !selectedPackage
            ? "Select a package"
            : estimatedTotal <= 0
              ? "Free"
              : formatJobsPrice(estimatedTotal)}
        </strong>
        {mode === "checkout" && selectedPackage && baseFee > 0 ? (
          <span className="text-muted">
            {" "}
            (package {formatJobsPrice(baseFee)}
            {boostTotal > 0 ? ` + boosts ${formatJobsPrice(boostTotal)}` : ""})
          </span>
        ) : null}
        {mode === "checkout" &&
        selectedPackage &&
        baseFee <= 0 &&
        boostTotal > 0 ? (
          <span className="text-muted">
            {" "}
            (boosts {formatJobsPrice(boostTotal)})
          </span>
        ) : null}
        {mode === "boosts_only" && boostTotal > 0 ? (
          <span className="text-muted"> (boosts only)</span>
        ) : null}
      </p>
      {error ? <div className="error-message d-block mb-3">{error}</div> : null}
      {chapaEnabled || estimatedTotal <= 0 ? (
        <button
          type="button"
          className="btn btn-sm btn-accent"
          disabled={checkoutDisabled}
          onClick={() => void onCheckout()}
        >
          {loading
            ? "Starting…"
            : estimatedTotal <= 0 && mode === "checkout"
              ? "Confirm publish"
              : estimatedTotal <= 0
                ? "Pay for boosts"
                : "Pay to publish"}
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
