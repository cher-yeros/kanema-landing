"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import {
  CREATE_PRODUCTION_JOB_MUTATION,
  JOB_POSTING_QUOTA_QUERY,
} from "@/lib/jobs-graphql";
import {
  JOB_EMPLOYMENT_CATEGORY_LABELS,
  JOB_WORK_TYPE_LABELS,
} from "@/lib/jobs-filter-config";
import {
  JOBS_FREE_MONTHLY_POST_LIMIT,
  JOBS_STANDARD_PER_JOB_PRICE,
  formatJobsPrice,
} from "@/lib/jobs-pricing-config";
import type { MeQuery } from "@/types/election-apollo";
import { JobSkillsInput } from "@/components/jobs/JobSkillsInput";

const JOB_SKILL_SUGGESTIONS = [
  ...JOB_WORK_TYPE_LABELS.slice(0, 8),
  "DaVinci Resolve",
  "Premiere Pro",
  "After Effects",
  "Lighting",
  "Sound",
  "Drone",
];

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
  const [budgetType, setBudgetType] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const quota = quotaData?.jobPostingQuota;
  const estimatedBaseFee = useMemo(() => {
    const base = Number.parseFloat(quota?.next_post_fee_amount ?? "0");
    return Number.isFinite(base) ? Math.max(0, base) : 0;
  }, [quota?.next_post_fee_amount]);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/community/join?mode=signin&next=${encodeURIComponent("/jobs/new")}`,
      );
    }
  }, [me, meLoading, router]);

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
            skills: skills.length > 0 ? skills : null,
            budget_type: budgetType.trim() || null,
            budget_min: budgetMin.trim() || null,
            budget_max: budgetMax.trim() || null,
            budget_currency: "ETB",
          },
        },
      });
      const payload = res.data?.createProductionJob;
      if (!payload || payload.status !== "success") {
        throw new Error(payload?.message || "Could not create posting.");
      }

      router.push(
        `/jobs/mine?submitted=1&msg=${encodeURIComponent(payload.message)}`,
      );
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
          Signed in as <strong>{me.full_name}</strong>. Submissions go to admin
          review first. After approval, free/subscription posts go live; paid
          posts need payment before they appear on the board.
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
                    Next post estimate:{" "}
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
        <p className="jobs-page-links">
          <Link href="/jobs/pricing">Employer pricing</Link>
          <span className="jobs-page-links__sep" aria-hidden>
            ·
          </span>
          <Link href="/jobs">Back to job center</Link>
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
                    <label className="form-label" htmlFor="category">
                      Category
                    </label>
                    <select
                      id="category"
                      className="form-select"
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                    >
                      <option value="">Select employment type…</option>
                      {JOB_EMPLOYMENT_CATEGORY_LABELS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="work-type">
                      Work type
                    </label>
                    <select
                      id="work-type"
                      className="form-select"
                      value={roleTag}
                      onChange={(e) => setRoleTag(e.target.value)}
                    >
                      <option value="">Select creative role…</option>
                      {JOB_WORK_TYPE_LABELS.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="budget-type">
                      Budget type
                    </label>
                    <select
                      id="budget-type"
                      className="form-select"
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value)}
                    >
                      <option value="">Select budget type…</option>
                      <option value="Fixed">Fixed price</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Negotiable">Negotiable</option>
                    </select>
                  </div>
                  {budgetType && budgetType !== "Negotiable" ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="budget-min">
                        {budgetType === "Hourly"
                          ? "Rate min (ETB/hr)"
                          : "Budget min (ETB)"}
                      </label>
                      <input
                        id="budget-min"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ) : null}
                  {budgetType === "Fixed" ? (
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="budget-max">
                        Budget max (ETB)
                      </label>
                      <input
                        id="budget-max"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  ) : null}
                  <div className="col-12">
                    <JobSkillsInput
                      value={skills}
                      onChange={setSkills}
                      suggestions={JOB_SKILL_SUGGESTIONS}
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

                <div className="info-box mt-4 mb-0">
                  <p className="mb-0 small">
                    Estimated base fee after approval (informational):{" "}
                    <strong>
                      {estimatedBaseFee <= 0
                        ? "Free"
                        : formatJobsPrice(estimatedBaseFee)}
                    </strong>
                    {" · "}
                    Optional boosts are chosen later at checkout after admin
                    approval.
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
                  <span>{loading ? "Submitting…" : "Submit for review"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
