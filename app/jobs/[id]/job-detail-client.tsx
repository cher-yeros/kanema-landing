"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { JobPaymentBoostsPanel } from "@/components/jobs/JobPaymentBoostsPanel";
import {
  APPLY_TO_PRODUCTION_JOB_MUTATION,
  MY_JOB_APPLICATIONS_QUERY,
} from "@/lib/jobs-graphql";
import type { PublicProductionJob } from "@/lib/public-graphql";
import {
  formatApplicantCount,
  formatJobBudget,
  formatPostedLabel,
  getJobTags,
} from "@/lib/jobs-board-utils";

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
  myJobApplications: { id: string; job_id: string }[];
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
  const { data: appsData, refetch } = useQuery<MyAppsData>(
    MY_JOB_APPLICATIONS_QUERY,
    {
      skip: !me,
    },
  );
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
  const applied = Boolean(
    appsData?.myJobApplications?.some((a) => a.job_id === job.id),
  );
  const canTryApply =
    Boolean(me?.role === "member") &&
    isLive &&
    !isEmployer &&
    !applied &&
    !done;

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
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
      setFormError(err instanceof Error ? err.message : "Apply failed.");
    }
  }

  const tags = getJobTags(job);

  return (
    <div className="container job-detail-shell" style={{ maxWidth: 800 }}>
      <div className="mb-4">
        <Link href="/jobs" className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" aria-hidden />
          All roles
        </Link>

        <div className="d-flex flex-wrap align-items-start gap-2 mb-3">
          <span className="featured-tag">{job.role_tag || "Production"}</span>
          <span className="badge rounded-pill text-bg-secondary small">
            {jobStatusLabel(job.status)}
          </span>
          {awaitingPayment ? (
            <span className="badge rounded-pill text-bg-warning small">
              Awaiting payment
            </span>
          ) : null}
        </div>

        <h1 className="h2">{job.title}</h1>

        <div className="job-detail-meta mb-4">
          <p className="text-muted small mb-2">
            {formatPostedLabel(job.createdAt)}
          </p>
          <div className="job-detail-meta__row">
            {job.poster.is_verified ? (
              <span className="job-detail-meta__verified">
                <i className="bi bi-patch-check-fill" aria-hidden />
                Member verified
              </span>
            ) : (
              <span className="job-detail-meta__unverified">
                <i className="bi bi-exclamation-circle" aria-hidden />
                Member unverified
              </span>
            )}
            <span>{job.poster.full_name}</span>
            {job.location ? (
              <span>
                <i className="bi bi-geo-alt" aria-hidden /> {job.location}
              </span>
            ) : null}
          </div>
          {formatJobBudget(job) ? (
            <p className="text-muted small mb-2 mt-2">{formatJobBudget(job)}</p>
          ) : null}
          {job.modality ? (
            <p className="text-muted small mb-2">Category: {job.modality}</p>
          ) : null}
          {job.role_tag ? (
            <p className="text-muted small mb-2">Work type: {job.role_tag}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span key={tag} className="featured-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-muted small mb-0 mt-3">
            {formatApplicantCount(job.application_count)}
          </p>
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
          <h3 className="h5 mb-2">Approved — payment required</h3>
          <p className="mb-3">
            Choose optional boosts, then pay to publish this role on the public
            board.
          </p>
          <JobPaymentBoostsPanel
            jobId={job.id}
            baseFeeAmount={job.posting_fee_amount ?? "0"}
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
            baseFeeAmount="0"
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

      {applied || done ? (
        <div className="alert alert-success">
          You have already applied to this role. The poster can reach you using
          the contact details on your Canma profile.
        </div>
      ) : null}

      {canTryApply ? (
        <div className="form-panel mt-4">
          <div className="form-intro mb-3">
            <i className="bi bi-send" />
            <h3 className="h5">Apply as {me?.full_name}</h3>
            <p className="small text-muted mb-0">
              One application per role. Be concise—posters see your email and
              phone from your member profile.
            </p>
          </div>
          <form className="php-email-form" onSubmit={(e) => void onApply(e)}>
            <div className="mb-3">
              <label className="form-label" htmlFor="cover">
                Message to poster
              </label>
              <textarea
                id="cover"
                className="form-control"
                rows={4}
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Tailor your fit, kit, and availability…"
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="links">
                Portfolio / reel links
              </label>
              <textarea
                id="links"
                className="form-control"
                rows={2}
                value={portfolioLinks}
                onChange={(e) => setPortfolioLinks(e.target.value)}
                placeholder="https://… (one per line or comma-separated)"
              />
            </div>
            {formError ? (
              <div className="error-message d-block mb-3">{formError}</div>
            ) : null}
            <button type="submit" className="dispatch-btn" disabled={applying}>
              <i className="bi bi-arrow-right-circle-fill" />
              <span>{applying ? "Sending…" : "Submit application"}</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
