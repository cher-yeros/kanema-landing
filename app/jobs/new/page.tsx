"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import {
  CREATE_PRODUCTION_JOB_MUTATION,
  JOB_POSTING_QUOTA_QUERY,
  redirectToChapaCheckout,
} from "@/lib/jobs-graphql";
import {
  JOBS_BOOST_ADDONS,
  JOBS_FREE_MONTHLY_POST_LIMIT,
  JOBS_STANDARD_PER_JOB_PRICE,
  formatJobsPrice,
} from "@/lib/jobs-pricing-config";
import type { MeQuery } from "@/types/election-apollo";

type CreateJobData = {
  createProductionJob: {
    status: string;
    message: string;
    checkout_url?: string | null;
    tx_ref?: string | null;
    job: { id: string; posting_payment_status: string };
  };
};

export default function NewProductionJobPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const { data: quotaData } = useQuery<{
    jobPostingQuota: {
      free_posts_used_this_month: number;
      free_posts_limit: number;
      next_post_fee_amount: string;
      next_post_fee_currency: string;
      active_subscription_plan: string | null;
      subscription_jobs_used_this_month: number;
      subscription_jobs_limit: number | null;
      subscription_expires_at: string | null;
      subscription_quota_exceeded: boolean;
    };
  }>(JOB_POSTING_QUOTA_QUERY, { skip: !me });
  const [createJob, { loading }] = useMutation<CreateJobData>(
    CREATE_PRODUCTION_JOB_MUTATION,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState("");
  const [location, setLocation] = useState("");
  const [roleTag, setRoleTag] = useState("");
  const [selectedBoosts, setSelectedBoosts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const quota = quotaData?.jobPostingQuota;
  const estimatedTotal = useMemo(() => {
    const base = Number.parseFloat(quota?.next_post_fee_amount ?? "0");
    const boosts = selectedBoosts.reduce((sum, id) => {
      const addon = JOBS_BOOST_ADDONS.find((b) => b.id === id);
      return sum + (addon?.price ?? 0);
    }, 0);
    return base + boosts;
  }, [quota?.next_post_fee_amount, selectedBoosts]);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(`/election/login?next=${encodeURIComponent("/jobs/new")}`);
    }
  }, [me, meLoading, router]);

  function toggleBoost(id: string) {
    setSelectedBoosts((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await createJob({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            modality: modality.trim() || null,
            location: location.trim() || null,
            role_tag: roleTag.trim() || null,
            boost_ids: selectedBoosts.length > 0 ? selectedBoosts : null,
          },
        },
      });
      const payload = res.data?.createProductionJob;
      if (!payload || payload.status !== "success") {
        throw new Error(payload?.message || "Could not create posting.");
      }

      const needsPayment = payload.job.posting_payment_status === "PENDING";
      if (needsPayment && chapaEnabled) {
        if (
          !redirectToChapaCheckout({
            checkout_url: payload.checkout_url,
            message: payload.message,
            status: payload.status,
          })
        ) {
          router.push("/jobs/mine");
          return;
        }
        return;
      }

      if (needsPayment) {
        throw new Error(
          "Posting saved but online payment is required before it goes live.",
        );
      }

      router.push(`/jobs/${payload.job.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Could not create posting.",
      );
    }
  }

  if (meLoading || !me) {
    return (
      <section className="contact section">
        <div className="container text-center py-5">
          <p className="text-muted mb-0">Loading…</p>
        </div>
      </section>
    );
  }

  const freeRemaining = quota
    ? Math.max(0, quota.free_posts_limit - quota.free_posts_used_this_month)
    : JOBS_FREE_MONTHLY_POST_LIMIT;

  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Post a production role</h1>
        <p>
          Signed in as <strong>{me.full_name}</strong>. Paid postings go live
          after Chapa confirms payment; free-tier posts publish immediately.
        </p>
        {quota ? (
          <p className="small text-muted mb-2">
            {quota.active_subscription_plan ? (
              <>
                Active plan:{" "}
                <strong className="text-capitalize">
                  {quota.active_subscription_plan}
                </strong>
                {" · "}
                {quota.subscription_jobs_limit == null
                  ? `${quota.subscription_jobs_used_this_month} subscription posts this month (unlimited)`
                  : `${quota.subscription_jobs_used_this_month} of ${quota.subscription_jobs_limit} included posts used this month`}
                {quota.subscription_expires_at ? (
                  <>
                    {" · "}
                    Renews{" "}
                    {new Date(
                      quota.subscription_expires_at,
                    ).toLocaleDateString()}
                  </>
                ) : null}
                {!quota.subscription_quota_exceeded &&
                Number.parseFloat(quota.next_post_fee_amount) > 0 ? (
                  <>
                    {" · "}
                    Next post estimate (incl. boosts):{" "}
                    <strong>
                      {formatJobsPrice(
                        Number.parseFloat(quota.next_post_fee_amount),
                      )}
                    </strong>
                  </>
                ) : !quota.subscription_quota_exceeded ? (
                  <> · Next included post is free</>
                ) : (
                  <>
                    {" · "}
                    Included posts used — additional posts are{" "}
                    {formatJobsPrice(JOBS_STANDARD_PER_JOB_PRICE)} each at
                    checkout, or{" "}
                    <Link href="/jobs/pricing" className="link-body-emphasis">
                      upgrade your plan
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                This month: {quota.free_posts_used_this_month} of{" "}
                {quota.free_posts_limit} free posts used
                {freeRemaining > 0
                  ? ` · ${freeRemaining} free post${freeRemaining === 1 ? "" : "s"} left`
                  : ` · additional posts are ${formatJobsPrice(JOBS_STANDARD_PER_JOB_PRICE)} each`}
                {!quota.active_subscription_plan &&
                quota.free_posts_used_this_month >= quota.free_posts_limit ? (
                  <>
                    {" · "}
                    <Link href="/jobs/pricing" className="link-body-emphasis">
                      Subscribe for more posts
                    </Link>
                  </>
                ) : null}
                .
              </>
            )}
          </p>
        ) : null}
        <p className="small text-muted mb-0">
          <Link href="/jobs/pricing" className="link-body-emphasis">
            Employer pricing
          </Link>
          {" · "}
          <Link href="/jobs" className="link-body-emphasis">
            Back to job center
          </Link>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-panel">
              <form
                className="php-email-form"
                onSubmit={(e) => void onSubmit(e)}
              >
                <div className="mb-3">
                  <label className="form-label" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 1st AC — commercial (4-week block)"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="desc">
                    Description
                  </label>
                  <textarea
                    id="desc"
                    className="form-control"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Scope, kit expectations, call times, rate band, and how you want to be contacted…"
                    required
                  />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="tag">
                      Lane tag
                    </label>
                    <input
                      id="tag"
                      className="form-control"
                      value={roleTag}
                      onChange={(e) => setRoleTag(e.target.value)}
                      placeholder="On set · Post · Hybrid"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="modality">
                      Modality
                    </label>
                    <input
                      id="modality"
                      className="form-control"
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      placeholder="Remote-first, hybrid…"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="loc">
                      Location
                    </label>
                    <input
                      id="loc"
                      className="form-control"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Addis Ababa, etc."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="h6 mb-2">Optional boosts</h2>
                  <p className="small text-muted mb-3">
                    Add visibility when you need to fill a role faster.
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {JOBS_BOOST_ADDONS.map((addon) => (
                      <label
                        key={addon.id}
                        className="d-flex align-items-start gap-2 small"
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-1"
                          checked={selectedBoosts.includes(addon.id)}
                          onChange={() => toggleBoost(addon.id)}
                        />
                        <span>
                          <strong>{addon.name}</strong>
                          <span className="text-muted">
                            {" "}
                            — {formatJobsPrice(addon.price)}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="info-box mt-4 mb-0">
                  <p className="mb-0 small">
                    Estimated total for this post:{" "}
                    <strong>
                      {estimatedTotal <= 0
                        ? "Free"
                        : formatJobsPrice(estimatedTotal)}
                    </strong>
                    {estimatedTotal > 0 && chapaEnabled
                      ? " · you will be redirected to Chapa after saving"
                      : null}
                  </p>
                </div>

                {error ? (
                  <div className="error-message d-block mt-3">{error}</div>
                ) : null}
                <button
                  type="submit"
                  className="dispatch-btn mt-4"
                  disabled={loading}
                >
                  <i className="bi bi-check2-circle" />
                  <span>
                    {loading
                      ? "Saving…"
                      : estimatedTotal > 0
                        ? "Save & pay with Chapa"
                        : "Publish open role"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
