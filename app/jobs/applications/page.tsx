"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  JobWorkReviewForm,
  JobWorkStars,
} from "@/components/jobs/JobWorkReviewForm";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  applicationDisplayLabel,
  applicationDisplayTone,
  resolveApplicationDisplayStatus,
  type ApplicationDisplayStatus,
} from "@/lib/job-application-status";
import { MY_JOB_APPLICATIONS_QUERY } from "@/lib/jobs-graphql";

type AppRow = {
  id: string;
  job_id: string;
  status?: string | null;
  createdAt: string;
  my_review?: { id: string; rating: number } | null;
  job: {
    id: string;
    title: string;
    status: string;
    location?: string | null;
    poster: {
      id: string;
      full_name: string;
      is_verified: boolean;
      work_rating_avg?: string | null;
      work_review_count?: number;
    };
  };
};

type AppsData = { myJobApplications: AppRow[] };

type Filter = "ALL" | ApplicationDisplayStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "UNDER_REVIEW", label: "Under review" },
  { id: "INVITED", label: "Invited" },
  { id: "HIRED", label: "Hired" },
  { id: "PASSED", label: "Passed" },
  { id: "ARCHIVED", label: "Archived" },
];

function formatAppliedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyJobApplicationsPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data, loading, refetch } = useQuery<AppsData>(
    MY_JOB_APPLICATIONS_QUERY,
    { skip: !me },
  );
  const [filter, setFilter] = useState<Filter>("ALL");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/community/join?mode=signin&next=${encodeURIComponent("/jobs/applications")}`,
      );
    }
  }, [me, meLoading, router]);

  const rows = data?.myJobApplications ?? [];

  const withDisplay = useMemo(
    () =>
      rows.map((row) => ({
        row,
        display: resolveApplicationDisplayStatus({
          status: row.status,
          jobStatus: row.job.status,
        }),
      })),
    [rows],
  );

  const counts = useMemo(() => {
    const next: Record<Filter, number> = {
      ALL: withDisplay.length,
      UNDER_REVIEW: 0,
      INVITED: 0,
      HIRED: 0,
      PASSED: 0,
      ARCHIVED: 0,
    };
    for (const item of withDisplay) {
      next[item.display] += 1;
    }
    return next;
  }, [withDisplay]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return withDisplay;
    return withDisplay.filter((item) => item.display === filter);
  }, [withDisplay, filter]);

  if (meLoading || !me) {
    return (
      <section className="section jobs-applications jobs-applications--loading">
        <div className="container text-center">
          <p className="text-muted mb-0">
            {!meLoading && !me
              ? "Redirecting to sign in…"
              : "Loading applications…"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section jobs-applications">
      <div className="container">
        <Link href="/jobs/mine" className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" aria-hidden />
          My jobs
        </Link>

        <header className="jobs-applications__header">
          <div>
            <p className="jobs-applications__eyebrow">Your pipeline</p>
            <h1>My applications</h1>
            <p className="jobs-applications__lede">
              Track every role you applied to — invited, hired, passed, or
              archived when the employer closes the listing — and leave a review
              after you are hired.
            </p>
          </div>
          <Link href="/jobs" className="btn btn-outline-secondary btn-sm">
            Browse open roles
          </Link>
        </header>

        <div
          className="jobs-applications__stats"
          aria-label="Application counts"
        >
          <div className="jobs-applications__stat">
            <span className="jobs-applications__stat-value">{counts.ALL}</span>
            <span className="jobs-applications__stat-label">Total</span>
          </div>
          <div className="jobs-applications__stat">
            <span className="jobs-applications__stat-value">
              {counts.INVITED}
            </span>
            <span className="jobs-applications__stat-label">Invited</span>
          </div>
          <div className="jobs-applications__stat">
            <span className="jobs-applications__stat-value">
              {counts.HIRED}
            </span>
            <span className="jobs-applications__stat-label">Hired</span>
          </div>
          <div className="jobs-applications__stat">
            <span className="jobs-applications__stat-value">
              {counts.ARCHIVED}
            </span>
            <span className="jobs-applications__stat-label">Archived</span>
          </div>
        </div>

        <div className="jobs-applications__filters" role="tablist">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`jobs-applications__filter${filter === item.id ? " is-active" : ""}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span>{counts[item.id]}</span>
            </button>
          ))}
        </div>

        {loading ? <p className="text-muted">Loading applications…</p> : null}

        {!loading && filtered.length === 0 ? (
          <div className="jobs-applications__empty">
            <i className="bi bi-send" aria-hidden />
            <h2>
              {rows.length === 0
                ? "No applications yet"
                : "No applications in this view"}
            </h2>
            <p>
              {rows.length === 0
                ? "Browse open production roles and apply to roles that match your craft."
                : "Try another filter to see more applications."}
            </p>
            {rows.length === 0 ? (
              <Link href="/jobs" className="btn btn-outline-secondary btn-sm">
                Browse open roles
              </Link>
            ) : null}
          </div>
        ) : null}

        <ul className="jobs-applications__list">
          {filtered.map(({ row, display }) => {
            const tone = applicationDisplayTone(display);
            const reviewing = reviewingId === row.id;

            return (
              <li key={row.id} className="jobs-application-card">
                <div className="jobs-application-card__top">
                  <div>
                    <div className="jobs-application-card__title-row">
                      <h2 className="jobs-application-card__title">
                        <Link href={`/jobs/${row.job.id}`}>
                          {row.job.title}
                        </Link>
                      </h2>
                      <span
                        className={`jobs-application-card__status jobs-application-card__status--${tone}`}
                      >
                        {applicationDisplayLabel(display)}
                      </span>
                    </div>
                    <div className="jobs-application-card__meta">
                      <span>
                        Poster{" "}
                        <Link href={`/discussion/u/${row.job.poster.id}`}>
                          {row.job.poster.full_name}
                        </Link>
                        <JobWorkStars
                          avg={row.job.poster.work_rating_avg}
                          count={row.job.poster.work_review_count}
                          className="ms-1"
                        />
                      </span>
                      <span>Applied {formatAppliedAt(row.createdAt)}</span>
                      {row.job.location ? (
                        <span>{row.job.location}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="jobs-application-card__actions">
                  <Link
                    href={`/jobs/${row.job.id}`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Open role
                  </Link>
                  {display === "HIRED" && !row.my_review ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-accent"
                      onClick={() => setReviewingId(reviewing ? null : row.id)}
                    >
                      <i className="bi bi-star" aria-hidden />
                      Rate employer
                    </button>
                  ) : null}
                  {row.my_review ? (
                    <span className="jobs-application-card__reviewed">
                      <i className="bi bi-check2-circle" aria-hidden />
                      Reviewed ({row.my_review.rating}/5)
                    </span>
                  ) : null}
                </div>

                {reviewing ? (
                  <JobWorkReviewForm
                    applicationId={row.id}
                    revieweeLabel={row.job.poster.full_name}
                    onCancel={() => setReviewingId(null)}
                    onDone={() => {
                      setReviewingId(null);
                      void refetch();
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
