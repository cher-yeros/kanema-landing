"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  MARK_ELEARN_LESSON_COMPLETE_MUTATION,
  PUBLISHED_CURRICULUM_QUERY,
} from "@/lib/learn-graphql";
import { apolloErrorMessage } from "@/lib/apollo-error";

type LessonRow = {
  id: string;
  section_id: string;
  title: string;
  sort_order: number;
  content_type: string;
  content_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  content_unlocked: boolean;
  resources_json: string | null;
  is_completed: boolean;
  watch_time_seconds: number;
};

type CurriculumData = {
  publishedCourseCurriculum: {
    id: string;
    title: string;
    lessons: LessonRow[];
  }[];
};

function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function LearnLessonPlayer({
  slug,
  lessonId,
}: {
  slug: string;
  lessonId: string;
}) {
  const { data: meData } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const { data: currData, refetch } = useQuery<CurriculumData>(
    PUBLISHED_CURRICULUM_QUERY,
    { variables: { slug } },
  );

  const [markComplete, { loading: marking }] = useMutation(
    MARK_ELEARN_LESSON_COMPLETE_MUTATION,
  );

  const [msg, setMsg] = useState<string | null>(null);

  const lesson = useMemo(() => {
    const sections = currData?.publishedCourseCurriculum ?? [];
    for (const s of sections) {
      const hit = s.lessons.find((l) => l.id === lessonId);
      if (hit) return hit;
    }
    return null;
  }, [currData, lessonId]);

  async function onMarkComplete() {
    setMsg(null);
    try {
      await markComplete({ variables: { lesson_id: lessonId } });
      await refetch();
      setMsg("Lesson marked complete.");
    } catch (e: unknown) {
      setMsg(apolloErrorMessage(e, "Could not update progress."));
    }
  }

  if (!currData) {
    return (
      <section className="services section">
        <div className="container">Loading…</div>
      </section>
    );
  }

  if (!lesson) {
    return (
      <section className="services section">
        <div className="container">
          <p>Lesson not found.</p>
          <Link href={`/learn/${slug}`}>Back to course</Link>
        </div>
      </section>
    );
  }

  const yt = lesson.content_url ? toYouTubeEmbed(lesson.content_url) : null;

  return (
    <section className="services section">
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="row gy-4">
          <div className="col-lg-4 order-lg-2">
            <div className="offering-block mb-3">
              <h2 className="h6 mb-2">Curriculum</h2>
              <ul className="list-unstyled small mb-0">
                {(currData.publishedCourseCurriculum ?? []).map((sec) => (
                  <li key={sec.id} className="mb-2">
                    <div className="fw-semibold">{sec.title}</div>
                    <ul className="list-unstyled ms-2 mt-1">
                      {sec.lessons.map((l) => (
                        <li key={l.id}>
                          <Link
                            href={`/learn/${slug}/lesson/${l.id}`}
                            className={
                              l.id === lessonId ? "fw-bold" : "text-muted"
                            }
                          >
                            {l.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-8 order-lg-1">
            <Link
              href={`/learn/${slug}`}
              className="explore-btn d-inline-flex mb-3"
            >
              <i className="bi bi-arrow-left-short" aria-hidden />
              Course overview
            </Link>

            <h1 className="h3">{lesson.title}</h1>

            {msg ? (
              <div className="alert alert-info py-2 small">{msg}</div>
            ) : null}

            {!lesson.content_unlocked ? (
              <div className="alert alert-warning">
                {!me ? (
                  <span>
                    <Link
                      href={`/election/login?next=${encodeURIComponent(`/learn/${slug}/lesson/${lessonId}`)}`}
                    >
                      Sign in
                    </Link>{" "}
                    and enroll on the course page to unlock this lesson (or it
                    may be a free-preview lesson on a section marked for
                    preview).
                  </span>
                ) : (
                  <span>
                    Enroll on the{" "}
                    <Link href={`/learn/${slug}`}>course page</Link> to access
                    this lesson.
                  </span>
                )}
              </div>
            ) : !lesson.content_url ? (
              <p className="text-muted">
                No media URL configured for this lesson yet.
              </p>
            ) : yt ? (
              <div className="ratio ratio-16x9 mb-3">
                <iframe
                  src={yt}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : lesson.content_type === "DOCUMENT" ||
              (lesson.content_url &&
                /\.pdf($|\?)/i.test(lesson.content_url)) ? (
              <div className="ratio ratio-4x3 mb-3" style={{ minHeight: 480 }}>
                <iframe
                  src={lesson.content_url}
                  title={lesson.title}
                  className="border-0"
                />
              </div>
            ) : (
              <div className="mb-3">
                <a
                  href={lesson.content_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent"
                >
                  Open lesson content
                </a>
              </div>
            )}

            {lesson.content_unlocked && me ? (
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={marking || lesson.is_completed}
                  onClick={() => void onMarkComplete()}
                >
                  {lesson.is_completed ? "Completed" : "Mark as complete"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
