"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { PublicProductionJob } from "@/lib/public-graphql";
import {
  formatApplicantCount,
  formatJobDetailsLine,
  formatPostedLabel,
  getJobTags,
} from "@/lib/jobs-board-utils";

const SAVED_JOBS_KEY = "canma-saved-jobs";

type Props = {
  job: PublicProductionJob;
};

function readSavedJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSavedJobIds(ids: Set<string>) {
  window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...ids]));
}

export function JobListCard({ job }: Props) {
  const [saved, setSaved] = useState(false);
  const tags = getJobTags(job);
  const detailsLine = formatJobDetailsLine(job);

  useEffect(() => {
    setSaved(readSavedJobIds().has(job.id));
  }, [job.id]);

  const toggleSaved = useCallback(() => {
    const ids = readSavedJobIds();
    if (ids.has(job.id)) ids.delete(job.id);
    else ids.add(job.id);
    writeSavedJobIds(ids);
    setSaved(ids.has(job.id));
  }, [job.id]);

  return (
    <article className="offering-block job-list-card">
      <div className="offering-indicator" />
      <div className="offering-icon-wrap">
        <i className="bi bi-briefcase" />
      </div>
      <div className="offering-body">
        <div className="job-list-card__top">
          <span className="job-list-card__posted">
            {formatPostedLabel(job.createdAt)}
          </span>
          <div className="job-list-card__actions">
            <button
              type="button"
              className={`job-list-card__icon-btn${saved ? " is-active" : ""}`}
              onClick={toggleSaved}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved jobs" : "Save job"}
              title={saved ? "Saved" : "Save job"}
            >
              <i className={`bi ${saved ? "bi-heart-fill" : "bi-heart"}`} />
            </button>
          </div>
        </div>

        <div className="offering-header">
          <h4>
            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
          </h4>
        </div>

        <div className="job-list-card__client">
          {job.poster.is_verified ? (
            <span className="job-list-card__verified">
              <i className="bi bi-patch-check-fill" aria-hidden />
              Member verified
            </span>
          ) : (
            <span className="job-list-card__unverified">
              <i className="bi bi-exclamation-circle" aria-hidden />
              Member unverified
            </span>
          )}
          <span className="job-list-card__client-name">
            {job.poster.full_name}
          </span>
          {job.location ? (
            <span className="job-list-card__location">
              <i className="bi bi-geo-alt" aria-hidden />
              {job.location}
            </span>
          ) : null}
        </div>

        {detailsLine ? (
          <p className="job-list-card__details">{detailsLine}</p>
        ) : null}

        <p className="job-list-card__description">{job.description}</p>

        {tags.length > 0 ? (
          <div className="job-list-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="featured-tag job-list-card__tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="job-list-card__footer">
          <span className="job-list-card__proposals">
            {formatApplicantCount(job.application_count)}
          </span>
          <Link href={`/jobs/${job.id}`} className="explore-btn d-inline-flex">
            View role
            <i className="bi bi-chevron-right" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
