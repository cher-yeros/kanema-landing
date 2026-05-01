import { notFound } from "next/navigation";

import { fetchProductionJob } from "@/lib/public-graphql";

import { JobDetailClient } from "./job-detail-client";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await fetchProductionJob(id).catch(() => null);
  if (!job) notFound();

  return <JobDetailClient job={job} pathHref={`/jobs/${id}`} />;
}
