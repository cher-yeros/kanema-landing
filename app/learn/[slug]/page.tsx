import { notFound } from "next/navigation";

import {
  fetchPublishedCourse,
  fetchPublishedCourseReviews,
} from "@/lib/public-graphql";

import { LearnCourseDetailClient } from "./learn-course-detail-client";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await fetchPublishedCourse(slug).catch(() => null);
  if (!course) notFound();

  let reviews: Awaited<ReturnType<typeof fetchPublishedCourseReviews>> = [];
  try {
    reviews = await fetchPublishedCourseReviews(slug);
  } catch {
    reviews = [];
  }

  const pathHref = `/learn/${slug}`;

  return (
    <LearnCourseDetailClient
      course={course}
      slug={slug}
      initialReviews={reviews}
      pathHref={pathHref}
    />
  );
}
