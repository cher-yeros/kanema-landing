"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { JobPaymentBoostsPanel } from "@/components/jobs/JobPaymentBoostsPanel";
import { JobWorkStars } from "@/components/jobs/JobWorkReviewForm";
import { apolloErrorMessage } from "@/lib/apollo-error";
import {
  applicationDisplayLabel,
  resolveApplicationDisplayStatus,
} from "@/lib/job-application-status";
import {
  APPLY_TO_PRODUCTION_JOB_MUTATION,
  MY_JOB_APPLICATIONS_QUERY,
} from "@/lib/jobs-graphql";
import type { PublicProductionJob } from "@/lib/public-graphql";
import {
  formatApplicantCount,
  formatJobBudget,
  formatJobSchedule,
  formatPostedLabel,
  getJobTags,
} from "@/lib/jobs-board-utils";
import { jobPostingTypeLabel } from "@/lib/jobs-filter-config";

function loginHrefBack(path: string) {
  return `/community/join?mode=signin&next=${encodeURIComponent(path)}`;
}

function jobStatusLabel(status: string): string {
  switch (status) {
    case "PENDING_REVIEW":
      return "Under review";
    case "REJECTED":
      return "Rejected";
    case "OPEN":
      return "Open";
    case "CLOSED":
      return "Closed";
    case "FILLED":
      return "Filled";
    default:
      return status;
  }
}

type MyAppsData = {
  myJobApplications: {
    id: string;
    job_id: string;
    status?: string | null;
    job?: { status?: string } | null;
  }[];
};

export function JobDetailClient({
  job,
  pathHref,
}: {
  job: PublicProductionJob;
  pathHref: string;
}) {
  const { data: meData } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const {
    data: appsData,
    loading: appsLoading,
    refetch,
  } = useQuery<MyAppsData>(MY_JOB_APPLICATIONS_QUERY, {
    skip: !me,
  });
  const [apply, { loading: applying }] = useMutation(
    APPLY_TO_PRODUCTION_JOB_MUTATION,
  );
  const [coverMessage, setCoverMessage] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isEmployer = me?.id === job.poster.id;
  const paymentStatus = job.posting_payment_status ?? "FREE";
  const isLive =
    job.status === "OPEN" &&
    (paymentStatus === "FREE" || paymentStatus === "CONFIRMED");
  const awaitingPayment = job.status === "OPEN" && paymentStatus === "PENDING";
  const liveFree = job.status === "OPEN" && paymentStatus === "FREE";
  const underReview = job.status === "PENDING_REVIEW";
  const rejected = job.status === "REJECTED";
  const existingApplication = appsData?.myJobApplications?.find(
    (a) => a.job_id === job.id,
  );
  const applied = Boolean(existingApplication) || done;
  const applicationStatusLabel = existingApplication
    ? applicationDisplayLabel(
        resolveApplicationDisplayStatus({
          status: existingApplication.status,
          jobStatus: existingApplication.job?.status ?? job.status,
        }),
      )
    : null;
  const canTryApply =
    Boolean(me?.role === "member") &&
    isLive &&
    !isEmployer &&
    !applied &&
    !appsLoading;

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (applied || existingApplication) {
      setFormError("You have already applied to this role.");
      setDone(true);
      return;
    }

    try {
      await apply({
        variables: {
          input: {
            job_id: job.id,
            cover_message: coverMessage.trim() || null,
            portfolio_links: portfolioLinks.trim() || null,
          },
        },
      });
      setDone(true);
      void refetch();
    } catch (err: unknown) {
      const message = apolloErrorMessage(err, "Apply failed.");
      const alreadyApplied = /already applied/i.test(message);
      if (alreadyApplied) {
        setDone(true);
        void refetch();
      }
      setFormError(message);
    }
  }

  const tags = getJobTags(job);
  const postingType = String(job.posting_type ?? "ROLE").toUpperCase();
  const typeLabel = jobPostingTypeLabel(postingType);
  const schedule = formatJobSchedule(job);
  const applyEyebrow =
    postingType === "SHOOT_CALL"
      ? "Request to join this shoot"
      : postingType === "QUICK_GIG"
        ? "Offer your availability"
        : "Apply for this role";
  const applyTitle =
    postingType === "SHOOT_CALL"
      ? `Join as ${me?.full_name}`
      : postingType === "QUICK_GIG"
        ? `Respond as ${me?.full_name}`
        : `Apply as ${me?.full_name}`;
  const applyLede =
    postingType === "SHOOT_CALL"
      ? "Tell the production why you fit this shoot. One request per listing—posters see your email and phone from your profile."
      : postingType === "QUICK_GIG"
        ? "Confirm kit, rate, and that you can make the date and location. One response per listing."
        : "One application per role. Keep it concise—posters see your email and phone from your member profile.";
  const applyPlaceholder =
    postingType === "QUICK_GIG"
      ? "Availability, kit, day rate, and any travel notes…"
      : postingType === "SHOOT_CALL"
        ? "Your fit for this shoot, kit, and availability…"
        : "Share your fit for this role, kit, and availability…";
  const submitLabel =
    postingType === "SHOOT_CALL"
      ? "Request to join"
      : postingType === "QUICK_GIG"
        ? "Offer availability"
        : "Submit application";

  return (
    <div className="container job-detail-shell" style={{ maxWidth: 800 }}>
      <div className="mb-4">
        <Link href="/jobs" className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" aria-hidden />
          All listings
        </Link>

        <div className="d-flex flex-wrap align-items-start gap-2 mb-3">
          <span className="featured-tag">{typeLabel}</span>
          <span className="featured-tag">{job.role_tag || "Production"}</span>
          <span className="badge rounded-pill text-bg-secondary small">
            {jobStatusLabel(job.status)}
          </span>
          {awaitingPayment ? (
            <span className="badge rounded-pill text-bg-warning small">
              Awaiting checkout
            </span>
          ) : null}
        </div>

        <h1 className="h2">{job.title}</h1>

        <div className="job-detail-meta mb-4">
          <p className="job-detail-meta__posted">
            {formatPostedLabel(job.createdAt)}
          </p>

          <div className="job-detail-poster">
            <div className="job-detail-poster__avatar" aria-hidden>
              {(job.poster.full_name.trim().charAt(0) || "?").toUpperCase()}
            </div>
            <div className="job-detail-poster__body">
              <div className="job-detail-poster__identity">
                <span className="job-detail-poster__name">
                  {job.poster.full_name}
                </span>
                {job.poster.is_verified ? (
                  <span className="job-detail-poster__badge job-detail-poster__badge--verified">
                    <i className="bi bi-patch-check-fill" aria-hidden />
                    Verified member
                  </span>
                ) : (
                  <span className="job-detail-poster__badge job-detail-poster__badge--unverified">
                    <i className="bi bi-shield-exclamation" aria-hidden />
                    Unverified member
                  </span>
                )}
                <JobWorkStars
                  avg={job.poster.work_rating_avg}
                  count={job.poster.work_review_count}
                />
              </div>
              {job.location ? (
                <p className="job-detail-poster__location">
                  <i className="bi bi-geo-alt-fill" aria-hidden />
                  {job.location}
                </p>
              ) : null}
            </div>
          </div>

          <div className="job-detail-facts">
            {formatJobBudget(job) ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">Budget</span>
                <span className="job-detail-fact__value">
                  {formatJobBudget(job)}
                </span>
              </div>
            ) : null}
            {job.production_kind ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">Production</span>
                <span className="job-detail-fact__value">
                  {job.production_kind}
                </span>
              </div>
            ) : null}
            {schedule ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">
                  {postingType === "QUICK_GIG" ? "When" : "Dates"}
                </span>
                <span className="job-detail-fact__value">{schedule}</span>
              </div>
            ) : null}
            {job.modality ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">Category</span>
                <span className="job-detail-fact__value">{job.modality}</span>
              </div>
            ) : null}
            {job.role_tag ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">Craft</span>
                <span className="job-detail-fact__value">{job.role_tag}</span>
              </div>
            ) : null}
            {(job.open_positions ?? 1) > 0 ? (
              <div className="job-detail-fact">
                <span className="job-detail-fact__label">Open positions</span>
                <span className="job-detail-fact__value">
                  {job.open_positions ?? 1}
                </span>
              </div>
            ) : null}
            <div className="job-detail-fact">
              <span className="job-detail-fact__label">Proposals</span>
              <span className="job-detail-fact__value">
                {formatApplicantCount(job.application_count)}
              </span>
            </div>
          </div>

          {tags.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span key={tag} className="featured-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="offering-body job-detail-description">
          <h2 className="h5 mb-3">About this role</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
        </div>
      </div>

      {isEmployer && underReview ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-2">Under review</h3>
          <p className="mb-3">
            Your posting was submitted and is waiting for admin approval. You
            will be able to pay (if required) after it is approved.
          </p>
          <Link className="btn btn-outline-secondary" href="/jobs/mine">
            My dashboard
          </Link>
        </div>
      ) : null}

      {isEmployer && rejected ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-2">Rejected</h3>
          <p className="mb-3">This posting was not approved by an admin.</p>
          <Link className="btn btn-outline-secondary" href="/jobs/mine">
            My dashboard
          </Link>
        </div>
      ) : null}

      {isEmployer && awaitingPayment ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-2">Approved — checkout required</h3>
          <p className="mb-3">
            Choose your posting package, then optional boosts, to publish this
            role on the public board.
          </p>
          <JobPaymentBoostsPanel
            jobId={job.id}
            mode="checkout"
            chapaEnabled={chapaEnabled}
          />
          <div className="mt-3">
            <Link className="btn btn-outline-secondary" href="/jobs/mine">
              My dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {isEmployer && liveFree ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-2">Boost this live posting</h3>
          <p className="mb-3">
            Your role is live. Optionally add visibility boosts at checkout.
          </p>
          <JobPaymentBoostsPanel
            jobId={job.id}
            mode="boosts_only"
            chapaEnabled={chapaEnabled}
          />
          <div className="mt-3">
            <Link
              className="btn btn-accent me-2"
              href={`/jobs/${job.id}/applicants`}
            >
              View applicants
            </Link>
            <Link className="btn btn-outline-secondary" href="/jobs/mine">
              My dashboard
            </Link>
          </div>
        </div>
      ) : null}

      {!me && isLive ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-3">Applicant?</h3>
          <p className="mb-3">
            You need to sign in with a Canma <strong>member</strong> account to
            submit an application.
          </p>
          <Link className="btn btn-accent" href={loginHrefBack(pathHref)}>
            Member sign-in
          </Link>
        </div>
      ) : null}

      {me?.role === "admin" ? (
        <div className="alert alert-warning">
          Signed in as <strong>admin</strong>: members apply with a standard
          member account. Approve pending jobs in the admin workspace.
        </div>
      ) : null}

      {isEmployer && isLive && !liveFree ? (
        <div className="info-box mb-5">
          <h3 className="h5 mb-2">You posted this role</h3>
          <p className="mb-3">
            Review applicants with their contact details (email and phone) on
            the applicant list.
          </p>
          <Link
            className="btn btn-accent me-2"
            href={`/jobs/${job.id}/applicants`}
          >
            View applicants
          </Link>
          <Link className="btn btn-outline-secondary" href="/jobs/mine">
            My dashboard
          </Link>
        </div>
      ) : null}

      {me && me.role === "member" && !isEmployer && !isLive ? (
        <p className="text-muted">
          This role is not accepting new applications.
        </p>
      ) : null}

      {applied ? (
        <div className="job-apply-done" role="status">
          <div className="job-apply-done__icon" aria-hidden>
            <i className="bi bi-check-circle-fill" />
          </div>
          <div>
            <h3 className="job-apply-done__title">
              {done && !existingApplication
                ? "Application sent"
                : "Already applied"}
            </h3>
            <p className="job-apply-done__text">
              {applicationStatusLabel
                ? `Your application status is ${applicationStatusLabel}. `
                : "You have already applied to this role. "}
              The poster can reach you using the contact details on your Canma
              profile. You cannot submit another application for the same
              listing.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Link
                className="btn btn-sm btn-outline-secondary"
                href="/jobs/applications"
              >
                View my applications
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {me?.role === "member" &&
      !isEmployer &&
      isLive &&
      appsLoading &&
      !applied ? (
        <p className="text-muted">Checking your applications…</p>
      ) : null}

      {canTryApply ? (
        <div className="job-apply">
          <div className="job-apply__header">
            <div className="job-apply__avatar" aria-hidden>
              {(me?.full_name?.trim().charAt(0) || "?").toUpperCase()}
            </div>
            <div className="job-apply__intro">
              <p className="job-apply__eyebrow">{applyEyebrow}</p>
              <h3 className="job-apply__title">{applyTitle}</h3>
              <p className="job-apply__lede">{applyLede}</p>
            </div>
          </div>

          <form className="job-apply__form" onSubmit={(e) => void onApply(e)}>
            <div className="job-apply__field">
              <label className="job-apply__label" htmlFor="cover">
                Message to poster
                <span className="job-apply__optional">Optional</span>
              </label>
              <textarea
                id="cover"
                className="job-apply__input"
                rows={5}
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder={applyPlaceholder}
              />
            </div>
            <div className="job-apply__field">
              <label className="job-apply__label" htmlFor="links">
                Portfolio / reel links
                <span className="job-apply__optional">Optional</span>
              </label>
              <textarea
                id="links"
                className="job-apply__input"
                rows={3}
                value={portfolioLinks}
                onChange={(e) => setPortfolioLinks(e.target.value)}
                placeholder="https://… — one per line or comma-separated"
              />
              <p className="job-apply__hint">
                Links help posters review your work before they reach out.
              </p>
            </div>
            {formError ? (
              <div className="job-apply__error" role="alert">
                {formError}
              </div>
            ) : null}
            <div className="job-apply__actions">
              <button
                type="submit"
                className="btn btn-accent job-apply__submit"
                disabled={applying}
              >
                {applying ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden
                    />
                    Sending…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill" aria-hidden />
                    {submitLabel}
                  </>
                )}
              </button>
              <p className="job-apply__note">
                Your profile contact details are shared with the poster.
              </p>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
