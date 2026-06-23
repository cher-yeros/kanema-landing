"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  APPLY_TO_PRODUCTION_JOB_MUTATION,
  MY_JOB_APPLICATIONS_QUERY,
} from "@/lib/jobs-graphql";
import type { PublicProductionJob } from "@/lib/public-graphql";

function loginHrefBack(path: string) {
  return `/election/login?next=${encodeURIComponent(path)}`;
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
  const applied = Boolean(
    appsData?.myJobApplications?.some((a) => a.job_id === job.id),
  );
  const canTryApply =
    Boolean(me?.role === "member") &&
    job.status === "OPEN" &&
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

  return (
    <section className="services section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="mb-4">
          <Link href="/jobs" className="explore-btn d-inline-flex mb-4">
            <i className="bi bi-arrow-left-short" aria-hidden />
            All roles
          </Link>

          <div className="d-flex flex-wrap align-items-start gap-2 mb-3">
            <span className="featured-tag">{job.role_tag || "Production"}</span>
            <span className="badge rounded-pill text-bg-secondary text-uppercase small">
              {job.status}
            </span>
            {job.application_count > 0 ? (
              <span className="small text-muted">
                {job.application_count} applicant
                {job.application_count === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>

          <h1 className="h2">{job.title}</h1>
          <p className="text-muted small mb-4">
            {[job.location, job.modality].filter(Boolean).join(" · ")}
            {" · "}Posted by {job.poster.full_name}
          </p>

          <div className="offering-body" style={{ padding: "1rem 0" }}>
            <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
          </div>
        </div>

        {!me ? (
          <div className="info-box mb-5">
            <h3 className="h5 mb-3">Applicant?</h3>
            <p className="mb-3">
              You need to sign in with a Canma <strong>member</strong> account
              to submit an application — use the election member login (same
              workspace account).
            </p>
            <Link className="btn btn-accent" href={loginHrefBack(pathHref)}>
              Member sign-in
            </Link>
          </div>
        ) : null}

        {me?.role === "admin" ? (
          <div className="alert alert-warning">
            Signed in as <strong>admin</strong>: members apply with a standard
            member account. Use GraphQL or a member test account to exercise
            applications.
          </div>
        ) : null}

        {isEmployer ? (
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

        {me && me.role === "member" && !isEmployer && job.status !== "OPEN" ? (
          <p className="text-muted">
            This role is not accepting new applications.
          </p>
        ) : null}

        {applied || done ? (
          <div className="alert alert-success">
            You have already applied to this role. The poster can reach you
            using the contact details on your Canma profile.
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
              <button
                type="submit"
                className="dispatch-btn"
                disabled={applying}
              >
                <i className="bi bi-arrow-right-circle-fill" />
                <span>{applying ? "Sending…" : "Submit application"}</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}
