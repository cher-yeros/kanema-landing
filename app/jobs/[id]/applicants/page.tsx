"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  JobWorkReviewForm,
  JobWorkStars,
} from "@/components/jobs/JobWorkReviewForm";
import {
  JOB_APPLICANTS_QUERY,
  PRODUCTION_JOB_QUERY,
  UPDATE_JOB_APPLICATION_STATUS_MUTATION,
  UPDATE_MY_PRODUCTION_JOB_MUTATION,
} from "@/lib/jobs-graphql";

type ApplicationStatus = "NEW" | "SHORTLISTED" | "REJECTED" | "HIRED";

type ApplicantRow = {
  id: string;
  job_id: string;
  applicant_user_id: string;
  cover_message: string | null;
  portfolio_links: string | null;
  status?: ApplicationStatus | null;
  createdAt: string;
  my_review?: { id: string; rating: number } | null;
  applicant: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    is_verified: boolean;
    work_rating_avg?: string | null;
    work_review_count?: number;
  };
};

type JobApplicantsRows = {
  jobApplicants: ApplicantRow[];
};

type ProdJobQr = {
  productionJob: {
    id: string;
    title: string;
    status: string;
    poster: { id: string; full_name: string };
  } | null;
};

type StatusFilter = "ALL" | ApplicationStatus;

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "NEW", label: "New" },
  { id: "SHORTLISTED", label: "Shortlisted" },
  { id: "HIRED", label: "Hired" },
  { id: "REJECTED", label: "Passed" },
];

function normalizeStatus(status: string | null | undefined): ApplicationStatus {
  const value = String(status ?? "NEW").toUpperCase();
  if (
    value === "SHORTLISTED" ||
    value === "REJECTED" ||
    value === "HIRED" ||
    value === "NEW"
  ) {
    return value;
  }
  return "NEW";
}

function statusLabel(status: ApplicationStatus): string {
  switch (status) {
    case "SHORTLISTED":
      return "Shortlisted";
    case "REJECTED":
      return "Passed";
    case "HIRED":
      return "Hired";
    default:
      return "New";
  }
}

function parsePortfolioLinks(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatAppliedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JobApplicantsPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: jobData, loading: jobLoading } = useQuery<ProdJobQr>(
    PRODUCTION_JOB_QUERY,
    {
      variables: { id },
      skip: !id,
    },
  );
  const job = jobData?.productionJob;
  const { data, loading, error, refetch } = useQuery<JobApplicantsRows>(
    JOB_APPLICANTS_QUERY,
    {
      variables: { job_id: id },
      skip: !id || !me,
    },
  );
  const [updateJob, { loading: closing }] = useMutation(
    UPDATE_MY_PRODUCTION_JOB_MUTATION,
  );
  const [updateStatus, { loading: updatingStatus }] = useMutation(
    UPDATE_JOB_APPLICATION_STATUS_MUTATION,
  );
  const [closeMsg, setCloseMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/community/join?mode=signin&next=${encodeURIComponent(`/jobs/${id}/applicants`)}`,
      );
    }
  }, [me, meLoading, router, id]);

  const isEmployer = Boolean(me && job && me.id === job.poster.id);
  const isAdmin = me?.role === "admin";
  const canManage = isEmployer || isAdmin;

  const rows = data?.jobApplicants ?? [];

  const counts = useMemo(() => {
    const next = {
      ALL: rows.length,
      NEW: 0,
      SHORTLISTED: 0,
      REJECTED: 0,
      HIRED: 0,
    };
    for (const row of rows) {
      next[normalizeStatus(row.status)] += 1;
    }
    return next;
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((row) => normalizeStatus(row.status) === filter);
  }, [rows, filter]);

  async function closeListing() {
    setCloseMsg(null);
    try {
      await updateJob({
        variables: { input: { id, status: "CLOSED" } },
      });
      setCloseMsg("Role closed to new applicants.");
      void refetch();
    } catch (e: unknown) {
      setCloseMsg(e instanceof Error ? e.message : "Could not update role.");
    }
  }

  async function setApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    setActionError(null);
    setBusyId(applicationId);
    try {
      await updateStatus({
        variables: { id: applicationId, status },
      });
      await refetch();
    } catch (e: unknown) {
      setActionError(
        e instanceof Error ? e.message : "Could not update applicant status.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (meLoading || !me || jobLoading) {
    return (
      <section className="section jobs-applicants jobs-applicants--loading">
        <div className="container text-center">
          <p className="text-muted mb-0">
            {!meLoading && !me
              ? "Redirecting to sign in…"
              : "Loading applicants…"}
          </p>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="section jobs-applicants">
        <div className="container">
          <p className="text-muted">This listing could not be loaded.</p>
          <Link href="/jobs" className="explore-btn d-inline-flex">
            <i className="bi bi-arrow-left-short" aria-hidden />
            Job center
          </Link>
        </div>
      </section>
    );
  }

  const errText = error?.message;

  return (
    <section className="section jobs-applicants">
      <div className="container">
        <Link href={`/jobs/${id}`} className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" aria-hidden />
          Back to role
        </Link>

        <header className="jobs-applicants__header">
          <div>
            <p className="jobs-applicants__eyebrow">Applicant review</p>
            <h1>Applicants</h1>
            <p className="jobs-applicants__lede">{job.title}</p>
          </div>
          {canManage ? (
            <div className="jobs-applicants__header-actions">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={closing || job.status !== "OPEN"}
                onClick={() => void closeListing()}
              >
                {closing
                  ? "Updating…"
                  : job.status === "OPEN"
                    ? "Close to new applications"
                    : "Applications closed"}
              </button>
              {closeMsg ? (
                <span className="jobs-applicants__toast">{closeMsg}</span>
              ) : null}
            </div>
          ) : null}
        </header>

        {!canManage ? (
          <div className="jobs-applicants__notice" role="alert">
            {errText ||
              "Only the member who posted this role (or an administrator) can view applicants."}
          </div>
        ) : null}

        {canManage && actionError ? (
          <div className="jobs-applicants__notice" role="alert">
            {actionError}
          </div>
        ) : null}

        {canManage ? (
          <>
            <div
              className="jobs-applicants__stats"
              aria-label="Applicant counts"
            >
              <div className="jobs-applicants__stat">
                <span className="jobs-applicants__stat-value">
                  {counts.ALL}
                </span>
                <span className="jobs-applicants__stat-label">Total</span>
              </div>
              <div className="jobs-applicants__stat">
                <span className="jobs-applicants__stat-value">
                  {counts.NEW}
                </span>
                <span className="jobs-applicants__stat-label">New</span>
              </div>
              <div className="jobs-applicants__stat">
                <span className="jobs-applicants__stat-value">
                  {counts.SHORTLISTED}
                </span>
                <span className="jobs-applicants__stat-label">Shortlisted</span>
              </div>
              <div className="jobs-applicants__stat">
                <span className="jobs-applicants__stat-value">
                  {counts.HIRED}
                </span>
                <span className="jobs-applicants__stat-label">Hired</span>
              </div>
            </div>

            <div className="jobs-applicants__filters" role="tablist">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  className={`jobs-applicants__filter${filter === item.id ? " is-active" : ""}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                  <span>{counts[item.id]}</span>
                </button>
              ))}
            </div>

            {loading ? <p className="text-muted">Loading applicants…</p> : null}

            {!loading && filteredRows.length === 0 ? (
              <div className="jobs-applicants__empty">
                <i className="bi bi-people" aria-hidden />
                <h2>
                  {rows.length === 0
                    ? "No applications yet"
                    : "No applicants in this view"}
                </h2>
                <p>
                  {rows.length === 0
                    ? "When members apply, they will show up here with contact details and actions."
                    : "Try another filter to see more applicants."}
                </p>
              </div>
            ) : null}

            <ul className="jobs-applicants__list">
              {filteredRows.map((row) => {
                const status = normalizeStatus(row.status);
                const links = parsePortfolioLinks(row.portfolio_links);
                const expanded = expandedId === row.id;
                const busy = busyId === row.id || updatingStatus;

                return (
                  <li key={row.id} className="jobs-applicant-card">
                    <div className="jobs-applicant-card__top">
                      <div className="jobs-applicant-card__identity">
                        <div
                          className="jobs-applicant-card__avatar"
                          aria-hidden
                        >
                          {(
                            row.applicant.full_name.trim().charAt(0) || "?"
                          ).toUpperCase()}
                        </div>
                        <div>
                          <div className="jobs-applicant-card__name-row">
                            <h2 className="jobs-applicant-card__name">
                              {row.applicant.full_name}
                            </h2>
                            <span
                              className={`jobs-applicant-card__status jobs-applicant-card__status--${status.toLowerCase()}`}
                            >
                              {statusLabel(status)}
                            </span>
                          </div>
                          <div className="jobs-applicant-card__meta">
                            {row.applicant.is_verified ? (
                              <span className="jobs-applicant-card__verified">
                                <i
                                  className="bi bi-patch-check-fill"
                                  aria-hidden
                                />
                                Verified
                              </span>
                            ) : (
                              <span className="jobs-applicant-card__unverified">
                                <i
                                  className="bi bi-shield-exclamation"
                                  aria-hidden
                                />
                                Unverified
                              </span>
                            )}
                            <JobWorkStars
                              avg={row.applicant.work_rating_avg}
                              count={row.applicant.work_review_count}
                            />
                            <span>
                              Applied {formatAppliedAt(row.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="jobs-applicant-card__contacts">
                      <a
                        className="jobs-applicant-card__contact"
                        href={`mailto:${row.applicant.email}`}
                      >
                        <i className="bi bi-envelope" aria-hidden />
                        {row.applicant.email}
                      </a>
                      {row.applicant.phone ? (
                        <a
                          className="jobs-applicant-card__contact"
                          href={`tel:${row.applicant.phone}`}
                        >
                          <i className="bi bi-telephone" aria-hidden />
                          {row.applicant.phone}
                        </a>
                      ) : null}
                    </div>

                    {row.cover_message ? (
                      <div className="jobs-applicant-card__message">
                        <p className={expanded ? undefined : "is-clamped"}>
                          {row.cover_message}
                        </p>
                        {row.cover_message.length > 180 ? (
                          <button
                            type="button"
                            className="jobs-applicant-card__expand"
                            onClick={() =>
                              setExpandedId(expanded ? null : row.id)
                            }
                          >
                            {expanded ? "Show less" : "Read full message"}
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <p className="jobs-applicant-card__empty-note">
                        No cover message provided.
                      </p>
                    )}

                    {links.length > 0 ? (
                      <div className="jobs-applicant-card__links">
                        {links.map((link) => (
                          <a
                            key={link}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="jobs-applicant-card__link"
                          >
                            <i
                              className="bi bi-box-arrow-up-right"
                              aria-hidden
                            />
                            {link.replace(/^https?:\/\//, "")}
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <div className="jobs-applicant-card__actions">
                      <Link
                        href={`/discussion/u/${row.applicant.id}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-person" aria-hidden />
                        View profile
                      </Link>
                      <a
                        href={`mailto:${row.applicant.email}?subject=${encodeURIComponent(`Re: ${job.title}`)}`}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-envelope" aria-hidden />
                        Email
                      </a>
                      {row.applicant.phone ? (
                        <a
                          href={`tel:${row.applicant.phone}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="bi bi-telephone" aria-hidden />
                          Call
                        </a>
                      ) : null}
                      {status !== "SHORTLISTED" ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-accent"
                          disabled={busy}
                          onClick={() =>
                            void setApplicationStatus(row.id, "SHORTLISTED")
                          }
                        >
                          <i className="bi bi-star" aria-hidden />
                          {busyId === row.id ? "Saving…" : "Add to shortlist"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={busy}
                          onClick={() =>
                            void setApplicationStatus(row.id, "NEW")
                          }
                        >
                          Remove shortlist
                        </button>
                      )}
                      {status !== "HIRED" ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={busy}
                          onClick={() =>
                            void setApplicationStatus(row.id, "HIRED")
                          }
                        >
                          <i className="bi bi-check2-circle" aria-hidden />
                          Mark hired
                        </button>
                      ) : null}
                      {status === "HIRED" && !row.my_review ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-accent"
                          onClick={() =>
                            setReviewingId(
                              reviewingId === row.id ? null : row.id,
                            )
                          }
                        >
                          <i className="bi bi-star" aria-hidden />
                          Leave review
                        </button>
                      ) : null}
                      {row.my_review ? (
                        <span className="jobs-applicant-card__reviewed">
                          <i className="bi bi-check2-circle" aria-hidden />
                          Reviewed ({row.my_review.rating}/5)
                        </span>
                      ) : null}
                      {status !== "REJECTED" ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          disabled={busy}
                          onClick={() =>
                            void setApplicationStatus(row.id, "REJECTED")
                          }
                        >
                          Pass
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          disabled={busy}
                          onClick={() =>
                            void setApplicationStatus(row.id, "NEW")
                          }
                        >
                          Restore
                        </button>
                      )}
                    </div>

                    {reviewingId === row.id ? (
                      <JobWorkReviewForm
                        applicationId={row.id}
                        revieweeLabel={row.applicant.full_name}
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
          </>
        ) : null}
      </div>
    </section>
  );
}
