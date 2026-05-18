import { notFound } from "next/navigation";

import { fetchPublishedCourseCurriculum } from "@/lib/public-graphql";

import { LearnLessonPlayer } from "./learn-lesson-player";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const curriculum = await fetchPublishedCourseCurriculum(slug).catch(
    () => null,
  );
  if (!curriculum) notFound();

  const exists = curriculum.some((s) =>
    s.lessons.some((l) => l.id === lessonId),
  );
  if (!exists) notFound();

  return <LearnLessonPlayer slug={slug} lessonId={lessonId} />;
}
