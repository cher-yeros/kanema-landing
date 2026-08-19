"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";

import { JobWorkStars } from "@/components/jobs/JobWorkReviewForm";
import { JOB_WORK_REVIEWS_FOR_USER_QUERY } from "@/lib/jobs-graphql";
import "./job-work-reviews.css";

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  reviewer: { id: string; full_name: string };
  job?: { id: string; title: string } | null;
};

type ReviewsData = {
  jobWorkReviewsForUser: ReviewRow[];
};

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JobWorkProfileSection({ userId }: { userId: string }) {
  const { data, loading } = useQuery<ReviewsData>(
    JOB_WORK_REVIEWS_FOR_USER_QUERY,
    { variables: { user_id: userId } },
  );

  const reviews = data?.jobWorkReviewsForUser ?? [];
  const count = reviews.length;
  const avg =
    count > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
      : null;

  if (loading) {
    return <p className="text-muted mb-0">Loading work reviews…</p>;
  }

  if (count === 0) {
    return (
      <div className="job-work-profile__empty">
        <p className="text-muted mb-0">
          No job collaboration reviews yet. Reviews appear after hired work on
          Creative Jobs.
        </p>
        <Link href="/jobs" className="btn btn-sm btn-outline-secondary mt-3">
          Browse jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="job-work-profile">
      <div className="job-work-profile__summary">
        <JobWorkStars avg={avg} count={count} />
        <span className="text-muted small">
          From hired Creative Jobs collaborations
        </span>
      </div>

      <ul className="job-work-profile__list">
        {reviews.map((review) => (
          <li key={review.id} className="job-work-profile__item">
            <div className="job-work-profile__item-head">
              <strong>{review.reviewer.full_name}</strong>
              <span className="job-work-profile__rating">
                <i className="bi bi-star-fill" aria-hidden />
                {review.rating}/5
              </span>
              <span className="text-muted small">
                {formatReviewDate(review.createdAt)}
              </span>
            </div>
            {review.job ? (
              <p className="job-work-profile__job">
                On{" "}
                <Link href={`/jobs/${review.job.id}`}>{review.job.title}</Link>
              </p>
            ) : null}
            {review.body ? (
              <p className="job-work-profile__body">{review.body}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
