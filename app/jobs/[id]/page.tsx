import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  jobJsonLd,
  jobOgImage,
  jobOgImageAlt,
  jobPath,
  jobShareDescription,
  jobShareTitle,
} from "@/components/jobs/job-content";
import { fetchProductionJob } from "@/lib/public-graphql";
import { absoluteSiteUrl } from "@/lib/site-url";

import { JobDetailClient } from "./job-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchProductionJob(id).catch(() => null);

  if (!job) {
    return { title: "Job not found — Canma" };
  }

  const title = jobShareTitle(job);
  const description = jobShareDescription(job);
  const url = absoluteSiteUrl(jobPath(job.id));
  const image = jobOgImage();
  const imageAlt = jobOgImageAlt(job);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Canma",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: image,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await fetchProductionJob(id).catch(() => null);
  if (!job) notFound();

  const jsonLd = jobJsonLd(job);

  return (
    <>
      <JobDetailClient job={job} pathHref={jobPath(job.id)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
