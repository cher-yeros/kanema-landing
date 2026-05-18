"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  ENROLL_ELEARN_COURSE_MUTATION,
  MY_ELEARN_ENROLLMENTS_QUERY,
  PUBLISHED_CURRICULUM_QUERY,
  SUBMIT_ELEARN_REVIEW_MUTATION,
} from "@/lib/learn-graphql";
import {
  formatLessonDuration,
  lessonTypeIcon,
  toVimeoEmbed,
  toYouTubeEmbed,
} from "@/lib/media-embed";
import type {
  PublicCourseReview,
  PublicPublishedCourse,
} from "@/lib/public-graphql";
import { apolloErrorMessage } from "@/lib/apollo-error";

function loginHref(next: string) {
  return `/election/login?next=${encodeURIComponent(next)}`;
}

function StarRow({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={className ?? "learn-reviews-stars"}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <i
          key={n}
          className={n <= rating ? "bi bi-star-fill" : "bi bi-star"}
          aria-hidden
        />
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type CurriculumLesson = {
  id: string;
  title: string;
  sort_order: number;
  content_type: string;
  duration_seconds: number | null;
  is_free_preview: boolean;
  content_unlocked: boolean;
  is_completed: boolean;
};

type CurriculumSection = {
  id: string;
  title: string;
  sort_order: number;
  is_free_preview: boolean;
  lessons: CurriculumLesson[];
};

type CurriculumData = {
  publishedCourseCurriculum: CurriculumSection[];
};

type EnrollData = {
  myEnrollments: { id: string; course_id: string; status: string }[];
};

function CoursePreviewMedia({ course }: { course: PublicPublishedCourse }) {
  const previewUrl = course.preview_video_url?.trim() ?? "";
  const thumbUrl = course.thumbnail_url?.trim() ?? "";
  const yt = previewUrl ? toYouTubeEmbed(previewUrl) : null;
  const vimeo = previewUrl ? toVimeoEmbed(previewUrl) : null;

  if (previewUrl) {
    return (
      <div className="learn-course-hero learn-course-hero__video">
        {yt ? (
          <iframe
            src={yt}
            title={`${course.title} preview`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : vimeo ? (
          <iframe
            src={vimeo}
            title={`${course.title} preview`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={previewUrl} controls preload="metadata" playsInline />
        )}
      </div>
    );
  }

  if (thumbUrl) {
    return (
      <div className="learn-course-hero learn-course-hero__thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbUrl} alt={course.title} />
      </div>
    );
  }

  return null;
}

function LessonRow({ les, slug }: { les: CurriculumLesson; slug: string }) {
  const duration = formatLessonDuration(les.duration_seconds);
  const sub = [les.content_type, duration].filter(Boolean).join(" · ");

  const content = (
    <>
      <span className="learn-lesson-icon" aria-hidden>
        <i
          className={
            les.is_completed
              ? "bi bi-check-lg"
              : lessonTypeIcon(les.content_type)
          }
        />
      </span>
      <div className="learn-lesson-body">
        <p className="learn-lesson-title">{les.title}</p>
        {sub ? <p className="learn-lesson-sub">{sub}</p> : null}
      </div>
      <div className="learn-lesson-badges">
        {les.is_free_preview ? (
          <span className="learn-badge-preview">Preview</span>
        ) : null}
        {!les.content_unlocked ? (
          <span className="learn-badge-locked">Locked</span>
        ) : null}
      </div>
    </>
  );

  if (les.content_unlocked) {
    return (
      <li className="learn-lesson-row">
        <Link
          href={`/learn/${slug}/lesson/${les.id}`}
          className={`learn-lesson-link${les.is_completed ? " is-completed" : ""}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="learn-lesson-row">
      <div className="learn-lesson-link is-locked">{content}</div>
    </li>
  );
}

export function LearnCourseDetailClient({
  course,
  slug,
  initialReviews,
  pathHref,
}: {
  course: PublicPublishedCourse;
  slug: string;
  initialReviews: PublicCourseReview[];
  pathHref: string;
}) {
  const { data: meData } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const { data: currData, refetch: refetchCurr } = useQuery<CurriculumData>(
    PUBLISHED_CURRICULUM_QUERY,
    { variables: { slug } },
  );

  const { data: enrollData, refetch: refetchEnroll } = useQuery<EnrollData>(
    MY_ELEARN_ENROLLMENTS_QUERY,
    { skip: !me },
  );

  const [enroll, { loading: enrolling }] = useMutation(
    ENROLL_ELEARN_COURSE_MUTATION,
  );
  const [submitReview, { loading: reviewing }] = useMutation<{
    submitELearnCourseReview: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: string;
      author: { id: string; full_name: string };
    };
  }>(SUBMIT_ELEARN_REVIEW_MUTATION);

  const [msg, setMsg] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState(initialReviews);

  const enrolled = useMemo(() => {
    return Boolean(
      enrollData?.myEnrollments?.some(
        (e) =>
          e.course_id === course.id &&
          (e.status === "ACTIVE" || e.status === "COMPLETED"),
      ),
    );
  }, [enrollData, course.id]);

  const sections = useMemo(() => {
    const raw = currData?.publishedCourseCurriculum ?? [];
    return [...raw]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((sec) => ({
        ...sec,
        lessons: [...sec.lessons].sort((a, b) => a.sort_order - b.sort_order),
      }));
  }, [currData]);

  const totalLessons = sections.reduce((n, s) => n + s.lessons.length, 0);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  async function onEnroll() {
    setMsg(null);
    try {
      await enroll({ variables: { course_id: course.id } });
      await refetchCurr();
      await refetchEnroll();
      setMsg("You are enrolled. Open any lesson below to start learning.");
    } catch (e: unknown) {
      setMsg(apolloErrorMessage(e, "Could not enroll."));
    }
  }

  async function onSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await submitReview({
        variables: {
          course_id: course.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        },
      });
      const created = res.data?.submitELearnCourseReview;
      if (created) {
        setReviews((prev) => {
          const rest = prev.filter((x) => x.id !== created.id);
          return [
            {
              id: created.id,
              user_id: me?.id ?? "",
              course_id: course.id,
              rating: created.rating,
              comment: created.comment,
              createdAt: created.createdAt,
              author: created.author,
            },
            ...rest,
          ];
        });
      }
      setReviewComment("");
      setMsg("Thanks for your review.");
    } catch (err: unknown) {
      setMsg(apolloErrorMessage(err, "Could not submit review."));
    }
  }

  const priceNum = parseFloat(course.price || "0");
  const isFree = !Number.isFinite(priceNum) || priceNum <= 0;

  return (
    <section className="services section">
      <div className="container learn-course-detail">
        <Link href="/learn" className="explore-btn d-inline-flex mb-4">
          <i className="bi bi-arrow-left-short" aria-hidden />
          All courses
        </Link>

        <CoursePreviewMedia course={course} />

        <h1 className="h2 mb-2">{course.title}</h1>

        <div className="learn-course-meta">
          {course.level ? (
            <span className="featured-tag">{course.level}</span>
          ) : null}
          {course.category ? (
            <span className="featured-tag">{course.category}</span>
          ) : null}
          {course.language ? (
            <span className="featured-tag">{course.language}</span>
          ) : null}
          <span className="featured-tag">
            {isFree ? "Free" : `${course.price} ${course.currency}`}
          </span>
        </div>

        {course.short_description || course.description ? (
          <div
            className="offering-body mb-4"
            style={{ whiteSpace: "pre-wrap", maxWidth: "72ch" }}
          >
            {course.short_description ? (
              <p className="lead mb-3" style={{ fontSize: "1.05rem" }}>
                {course.short_description}
              </p>
            ) : null}
            {course.description ? <div>{course.description}</div> : null}
          </div>
        ) : null}

        <div className="learn-cta-card">
          {msg ? (
            <div className="alert alert-info mb-3 py-2" role="status">
              {msg}
            </div>
          ) : null}

          {!me ? (
            <p className="mb-0">
              <Link href={loginHref(pathHref)} className="btn btn-accent">
                Sign in to enroll
              </Link>
            </p>
          ) : !me.is_verified ? (
            <p className="text-muted mb-0">
              Verify your account (OTP) before you can enroll in courses.
            </p>
          ) : !isFree ? (
            <p className="text-muted mb-0">
              Paid courses are not available yet.
            </p>
          ) : enrolled ? (
            <p className="mb-0">
              <span className="badge text-bg-success me-2">Enrolled</span>
              <span className="text-muted">
                Pick a lesson below. Free-preview lessons are open to everyone;
                other lessons unlock when you are enrolled.
              </span>
            </p>
          ) : (
            <button
              type="button"
              className="btn btn-accent"
              disabled={enrolling}
              onClick={() => void onEnroll()}
            >
              {enrolling ? "Enrolling…" : "Enroll for free"}
            </button>
          )}
        </div>

        <div className="learn-section-heading">
          <h2 className="h4">Curriculum</h2>
          {totalLessons > 0 ? (
            <span className="small text-muted">
              {sections.length} section{sections.length === 1 ? "" : "s"} ·{" "}
              {totalLessons} lesson{totalLessons === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {sections.length === 0 ? (
          <p className="learn-empty-state mb-5">
            Curriculum for this course is being prepared.
          </p>
        ) : (
          <div className="learn-curriculum">
            {sections.map((sec, sectionIndex) => (
              <article key={sec.id} className="learn-curriculum-section">
                <header className="learn-curriculum-section__head">
                  <span className="learn-curriculum-section__index">
                    {sectionIndex + 1}
                  </span>
                  <div>
                    <h3 className="learn-curriculum-section__title">
                      {sec.title}
                    </h3>
                    <p className="learn-curriculum-section__meta">
                      {sec.lessons.length} chapter
                      {sec.lessons.length === 1 ? "" : "s"}
                      {sec.is_free_preview ? " · Free preview section" : ""}
                    </p>
                  </div>
                </header>
                <ul className="learn-lesson-list">
                  {sec.lessons.map((les) => (
                    <LessonRow key={les.id} les={les} slug={slug} />
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}

        <div className="learn-section-heading">
          <h2 className="h4">Reviews</h2>
          {reviews.length > 0 && avgRating != null ? (
            <span className="small text-muted">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {reviews.length > 0 && avgRating != null ? (
          <div className="learn-reviews-summary">
            <div>
              <div className="learn-reviews-score">{avgRating}</div>
              <StarRow rating={Math.round(avgRating)} />
            </div>
            <p className="mb-0 small text-muted">
              Average from {reviews.length} learner
              {reviews.length === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}

        {reviews.length === 0 ? (
          <p className="learn-empty-state">
            No reviews yet. Enroll and be the first to share feedback.
          </p>
        ) : (
          <div className="learn-reviews-grid">
            {reviews.map((r) => (
              <article key={r.id} className="learn-review-card">
                <div className="learn-review-card__head">
                  <span className="learn-review-avatar" aria-hidden>
                    {initials(r.author.full_name)}
                  </span>
                  <div className="flex-grow-1 min-w-0">
                    <p className="learn-review-card__name">
                      {r.author.full_name}
                    </p>
                    <p className="learn-review-card__meta">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StarRow
                    rating={r.rating}
                    className="learn-review-card__stars"
                  />
                </div>
                {r.comment ? (
                  <p className="learn-review-card__text">{r.comment}</p>
                ) : (
                  <p className="learn-review-card__text text-muted mb-0">
                    No written comment.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {me && enrolled ? (
          <form onSubmit={onSubmitReview} className="learn-review-form-card">
            <h3 className="h5 mb-3">Write a review</h3>
            <div className="mb-3">
              <label className="form-label" htmlFor="rating">
                Rating
              </label>
              <select
                id="rating"
                className="form-select w-auto"
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} —{" "}
                    {n === 5
                      ? "Excellent"
                      : n === 4
                        ? "Good"
                        : n === 3
                          ? "Okay"
                          : n === 2
                            ? "Fair"
                            : "Poor"}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="revcomment">
                Comment (optional)
              </label>
              <textarea
                id="revcomment"
                className="form-control"
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="What did you learn? What stood out?"
              />
            </div>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={reviewing}
            >
              {reviewing ? "Sending…" : "Submit review"}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
