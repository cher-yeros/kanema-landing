"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Suspense, useEffect, useMemo } from "react";

import { JobPaymentBoostsPanel } from "@/components/jobs/JobPaymentBoostsPanel";
import { ME_QUERY } from "@/lib/election-graphql";
import { PAYMENT_SETTINGS_QUERY } from "@/lib/events-graphql";
import {
  applicationDisplayLabel,
  applicationDisplayTone,
  resolveApplicationDisplayStatus,
} from "@/lib/job-application-status";
import {
  MY_JOB_APPLICATIONS_QUERY,
  MY_POSTED_JOBS_QUERY,
} from "@/lib/jobs-graphql";
import type { MeQuery } from "@/types/election-apollo";

type PostedJob = {
  id: string;
  title: string;
  status: string;
  application_count: number;
  posting_payment_status: "FREE" | "PENDING" | "CONFIRMED";
  posting_fee_amount: string;
  posting_fee_currency: string;
};

type PostedData = {
  myPostedJobs: PostedJob[];
};

type AppsMineData = {
  myJobApplications: {
    id: string;
    status?: string | null;
    createdAt: string;
    my_review?: { id: string } | null;
    job: { id: string; title: string; status: string };
  }[];
};

type StatusTone = "review" | "checkout" | "live" | "rejected" | "closed";

function postingTone(job: PostedJob): StatusTone {
  if (job.status === "PENDING_REVIEW") return "review";
  if (job.status === "REJECTED") return "rejected";
  if (job.status === "OPEN" && job.posting_payment_status === "PENDING") {
    return "checkout";
  }
  if (
    job.status === "OPEN" &&
    (job.posting_payment_status === "FREE" ||
      job.posting_payment_status === "CONFIRMED")
  ) {
    return "live";
  }
  return "closed";
}

function postingStatusLabel(job: PostedJob): string {
  switch (postingTone(job)) {
    case "review":
      return "Under review";
    case "checkout":
      return "Awaiting checkout";
    case "live":
      return "Live";
    case "rejected":
      return "Rejected";
    default:
      return job.status === "FILLED" ? "Filled" : "Closed";
  }
}

function postingStatusHint(job: PostedJob): string | null {
  switch (postingTone(job)) {
    case "review":
      return "An admin will approve this before checkout.";
    case "checkout":
      return "Choose a posting package and optional boosts to publish.";
    case "rejected":
      return "This posting was not approved.";
    case "live":
      return null;
    default:
      return null;
  }
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function JobsMinePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";
  const submittedMsg = searchParams.get("msg");
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const {
    data: posted,
    loading: pLoading,
    refetch,
  } = useQuery<PostedData>(MY_POSTED_JOBS_QUERY, { skip: !me });
  const { data: apps, loading: aLoading } = useQuery<AppsMineData>(
    MY_JOB_APPLICATIONS_QUERY,
    { skip: !me },
  );

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/community/join?mode=signin&next=${encodeURIComponent("/jobs/mine")}`,
      );
    }
  }, [me, meLoading, router]);

  const myJobs = posted?.myPostedJobs ?? [];
  const myApps = apps?.myJobApplications ?? [];

  const stats = useMemo(() => {
    let live = 0;
    let awaiting = 0;
    let review = 0;
    for (const job of myJobs) {
      const tone = postingTone(job);
      if (tone === "live") live += 1;
      else if (tone === "checkout") awaiting += 1;
      else if (tone === "review") review += 1;
    }
    return {
      postings: myJobs.length,
      live,
      awaiting,
      review,
      applications: myApps.length,
    };
  }, [myJobs, myApps.length]);

  if (meLoading || !me) {
    return (
      <section className="section jobs-dash jobs-dash--loading">
        <div className="container text-center">
          <p className="text-muted mb-0">Loading dashboard…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section jobs-dash">
      <div className="container">
        <header className="jobs-dash__header">
          <div className="jobs-dash__intro">
            <p className="jobs-dash__eyebrow">Employer dashboard</p>
            <h1>Your jobs workspace</h1>
            <p className="jobs-dash__lede">
              Manage postings you own and track applications you have sent,{" "}
              <strong>{me.full_name}</strong>.
            </p>
          </div>
          <div className="jobs-dash__actions">
            <Link className="btn btn-accent" href="/jobs/new">
              <i className="bi bi-plus-lg" aria-hidden />
              New posting
            </Link>
            <Link className="btn btn-outline-secondary" href="/jobs">
              Browse board
            </Link>
          </div>
        </header>

        {submitted ? (
          <div className="jobs-dash__banner" role="status">
            <i className="bi bi-check-circle-fill" aria-hidden />
            <div>
              <strong>Submitted for review</strong>
              <p>
                {submittedMsg?.trim() ||
                  "Your job posting was submitted and is under review."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="jobs-dash__stats" aria-label="Dashboard summary">
          <div className="jobs-dash__stat">
            <span className="jobs-dash__stat-value">{stats.postings}</span>
            <span className="jobs-dash__stat-label">Postings</span>
          </div>
          <div className="jobs-dash__stat">
            <span className="jobs-dash__stat-value">{stats.live}</span>
            <span className="jobs-dash__stat-label">Live</span>
          </div>
          <div className="jobs-dash__stat">
            <span className="jobs-dash__stat-value">{stats.awaiting}</span>
            <span className="jobs-dash__stat-label">Awaiting checkout</span>
          </div>
          <div className="jobs-dash__stat">
            <span className="jobs-dash__stat-value">{stats.review}</span>
            <span className="jobs-dash__stat-label">Under review</span>
          </div>
          <div className="jobs-dash__stat">
            <span className="jobs-dash__stat-value">{stats.applications}</span>
            <span className="jobs-dash__stat-label">Applications sent</span>
          </div>
        </div>

        <div className="jobs-dash__grid">
          <section className="jobs-dash__panel" aria-labelledby="mine-postings">
            <div className="jobs-dash__panel-head">
              <div>
                <h2 id="mine-postings">My postings</h2>
                <p>Roles you manage from review through applicants.</p>
              </div>
              <span className="jobs-dash__panel-count">
                {pLoading ? "…" : stats.postings}
              </span>
            </div>

            {!pLoading && myJobs.length === 0 ? (
              <div className="jobs-dash__empty">
                <i className="bi bi-briefcase" aria-hidden />
                <h3>No postings yet</h3>
                <p>
                  Create a production role, submit it for review, then complete
                  checkout after approval.
                </p>
                <Link className="btn btn-accent btn-sm" href="/jobs/new">
                  Post a role
                </Link>
              </div>
            ) : null}

            <ul className="jobs-dash__list">
              {myJobs.map((j) => {
                const tone = postingTone(j);
                const underReview = tone === "review";
                const pendingPayment = tone === "checkout";
                const liveFree =
                  j.status === "OPEN" && j.posting_payment_status === "FREE";
                const live = tone === "live";
                const hint = postingStatusHint(j);

                return (
                  <li key={j.id} className="jobs-dash-card">
                    <div className="jobs-dash-card__top">
                      <div className="jobs-dash-card__title-wrap">
                        <h3 className="jobs-dash-card__title">
                          <Link href={`/jobs/${j.id}`}>{j.title}</Link>
                        </h3>
                        <span
                          className={`jobs-dash-pill jobs-dash-pill--${tone}`}
                        >
                          {postingStatusLabel(j)}
                        </span>
                      </div>
                      {live ? (
                        <p className="jobs-dash-card__meta">
                          <i className="bi bi-people" aria-hidden />
                          {j.application_count} applicant
                          {j.application_count === 1 ? "" : "s"}
                        </p>
                      ) : null}
                      {hint ? (
                        <p className="jobs-dash-card__hint">{hint}</p>
                      ) : null}
                    </div>

                    {pendingPayment || liveFree ? (
                      <div className="jobs-dash-card__checkout">
                        <JobPaymentBoostsPanel
                          jobId={j.id}
                          mode={pendingPayment ? "checkout" : "boosts_only"}
                          chapaEnabled={chapaEnabled}
                          onPaid={() => void refetch()}
                        />
                      </div>
                    ) : null}

                    <div className="jobs-dash-card__footer">
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        href={`/jobs/${j.id}`}
                      >
                        View role
                      </Link>
                      {live ? (
                        <Link
                          className="btn btn-sm btn-accent"
                          href={`/jobs/${j.id}/applicants`}
                        >
                          Applicants
                        </Link>
                      ) : null}
                      {pendingPayment || underReview ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => void refetch()}
                        >
                          <i className="bi bi-arrow-clockwise" aria-hidden />
                          Refresh
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="jobs-dash__panel" aria-labelledby="mine-apps">
            <div className="jobs-dash__panel-head">
              <div>
                <h2 id="mine-apps">Applications I submitted</h2>
                <p>Roles you have applied to as a member.</p>
              </div>
              <span className="jobs-dash__panel-count">
                {aLoading ? "…" : stats.applications}
              </span>
            </div>

            {!aLoading && myApps.length === 0 ? (
              <div className="jobs-dash__empty">
                <i className="bi bi-send" aria-hidden />
                <h3>No applications yet</h3>
                <p>
                  Browse the job board and apply to open production roles that
                  match your craft.
                </p>
                <Link className="btn btn-outline-secondary btn-sm" href="/jobs">
                  Browse open roles
                </Link>
              </div>
            ) : null}

            <ul className="jobs-dash__list">
              {myApps.slice(0, 5).map((a) => {
                const display = resolveApplicationDisplayStatus({
                  status: a.status,
                  jobStatus: a.job.status,
                });
                const tone = applicationDisplayTone(display);
                return (
                  <li key={a.id} className="jobs-dash-card jobs-dash-card--app">
                    <div className="jobs-dash-card__top">
                      <div className="jobs-dash-card__title-wrap">
                        <h3 className="jobs-dash-card__title">
                          <Link href={`/jobs/${a.job.id}`}>{a.job.title}</Link>
                        </h3>
                        <span
                          className={`jobs-dash-pill jobs-dash-pill--app-${tone}`}
                        >
                          {applicationDisplayLabel(display)}
                        </span>
                      </div>
                      <p className="jobs-dash-card__meta">
                        <i className="bi bi-calendar3" aria-hidden />
                        {formatSubmittedAt(a.createdAt)}
                        {a.my_review ? " · Reviewed" : null}
                      </p>
                    </div>
                    <div className="jobs-dash-card__footer">
                      <Link
                        className="btn btn-sm btn-outline-secondary"
                        href={`/jobs/${a.job.id}`}
                      >
                        Open role
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            {myApps.length > 0 ? (
              <div className="jobs-dash__panel-foot">
                <Link
                  href="/jobs/applications"
                  className="btn btn-sm btn-outline-secondary"
                >
                  View all applications
                  {myApps.length > 5 ? ` (${myApps.length})` : ""}
                </Link>
              </div>
            ) : null}
          </section>
        </div>

        <p className="jobs-page-links jobs-dash__links">
          <Link href="/jobs/applications">My applications</Link>
          <span className="jobs-page-links__sep" aria-hidden>
            ·
          </span>
          <Link href="/jobs/pricing">Employer pricing</Link>
          <span className="jobs-page-links__sep" aria-hidden>
            ·
          </span>
          <Link href="/jobs/new">Post another role</Link>
          <span className="jobs-page-links__sep" aria-hidden>
            ·
          </span>
          <Link href="/profile">Back to profile</Link>
        </p>
      </div>
    </section>
  );
}

export default function JobsMinePage() {
  return (
    <Suspense
      fallback={
        <section className="section jobs-dash jobs-dash--loading">
          <div className="container text-center">
            <p className="text-muted mb-0">Loading dashboard…</p>
          </div>
        </section>
      }
    >
      <JobsMinePageInner />
    </Suspense>
  );
}
