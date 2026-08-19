"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { PublicProductionJob } from "@/lib/public-graphql";
import { JobWorkStars } from "@/components/jobs/JobWorkReviewForm";
import {
  formatApplicantCount,
  formatJobDetailsLine,
  formatJobSchedule,
  formatPostedLabel,
  getJobTags,
} from "@/lib/jobs-board-utils";
import { jobPostingTypeLabel } from "@/lib/jobs-filter-config";

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
  const schedule = formatJobSchedule(job);
  const postingType = String(job.posting_type ?? "ROLE").toUpperCase();
  const typeLabel = jobPostingTypeLabel(postingType);
  const typeTone = postingType.toLowerCase().replace(/_/g, "-");
  const iconClass =
    postingType === "QUICK_GIG"
      ? "bi-lightning-charge"
      : postingType === "SHOOT_CALL"
        ? "bi-camera-reels"
        : "bi-briefcase";

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
        <i className={`bi ${iconClass}`} />
      </div>
      <div className="offering-body">
        <div className="job-list-card__top">
          <div className="job-list-card__badges">
            <span
              className={`job-list-card__type job-list-card__type--${typeTone}`}
            >
              {typeLabel}
            </span>
            <span className="job-list-card__posted">
              {formatPostedLabel(job.createdAt)}
            </span>
          </div>
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

        {(schedule || job.location) &&
        (postingType === "QUICK_GIG" || postingType === "SHOOT_CALL") ? (
          <p className="job-list-card__schedule">
            {schedule ? (
              <span>
                <i className="bi bi-calendar3" aria-hidden /> {schedule}
              </span>
            ) : null}
            {job.location ? (
              <span>
                <i className="bi bi-geo-alt" aria-hidden /> {job.location}
              </span>
            ) : null}
          </p>
        ) : null}

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
          <JobWorkStars
            avg={job.poster.work_rating_avg}
            count={job.poster.work_review_count}
          />
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
