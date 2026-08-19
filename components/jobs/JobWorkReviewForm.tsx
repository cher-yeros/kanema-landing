"use client";

import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { CREATE_JOB_WORK_REVIEW_MUTATION } from "@/lib/jobs-graphql";
import "./job-work-reviews.css";

type Props = {
  applicationId: string;
  revieweeLabel: string;
  onDone?: () => void;
  onCancel?: () => void;
};

export function JobWorkReviewForm({
  applicationId,
  revieweeLabel,
  onDone,
  onCancel,
}: Props) {
  const [rating, setRating] = useState(5);
  const [communication, setCommunication] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createReview, { loading }] = useMutation(
    CREATE_JOB_WORK_REVIEW_MUTATION,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createReview({
        variables: {
          input: {
            application_id: applicationId,
            rating,
            communication_rating: communication > 0 ? communication : null,
            professionalism_rating:
              professionalism > 0 ? professionalism : null,
            body: body.trim() || null,
          },
        },
      });
      onDone?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not submit review.");
    }
  }

  return (
    <form className="job-work-review-form" onSubmit={(e) => void onSubmit(e)}>
      <p className="job-work-review-form__lede">
        Rate your collaboration with <strong>{revieweeLabel}</strong>
      </p>

      <fieldset className="job-work-review-form__stars">
        <legend>Overall</legend>
        <div className="job-work-review-form__star-row" role="radiogroup">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className={`job-work-review-form__star${rating >= value ? " is-active" : ""}`}
              onClick={() => setRating(value)}
            >
              <i className="bi bi-star-fill" aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="job-work-review-form__subs">
        <label>
          Communication
          <select
            value={communication}
            onChange={(e) => setCommunication(Number(e.target.value))}
          >
            <option value={0}>Optional</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Professionalism
          <select
            value={professionalism}
            onChange={(e) => setProfessionalism(Number(e.target.value))}
          >
            <option value={0}>Optional</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="job-work-review-form__body">
        Comment
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What went well? Anything to note for future collaborations?"
          maxLength={2000}
        />
      </label>

      {error ? (
        <p className="job-work-review-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="job-work-review-form__actions">
        {onCancel ? (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="btn btn-sm btn-accent"
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </form>
  );
}

export function JobWorkStars({
  avg,
  count,
  className = "",
}: {
  avg?: string | null;
  count?: number | null;
  className?: string;
}) {
  if (!avg || !count || count <= 0) return null;
  return (
    <span className={`job-work-stars ${className}`.trim()}>
      <i className="bi bi-star-fill" aria-hidden />
      {avg}
      <span className="job-work-stars__count">({count})</span>
    </span>
  );
}
