import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  eventJsonLd,
  eventOgImage,
  eventOgImageAlt,
  eventShareDescription,
  eventShareTitle,
} from "@/components/events/event-content";
import { fetchPublishedEventBySlug } from "@/lib/public-graphql";
import { absoluteSiteUrl, eventPath } from "@/lib/site-url";

import { EventDetailClient } from "./event-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchPublishedEventBySlug(slug).catch(() => null);

  if (!event) {
    return { title: "Event not found — Canma" };
  }

  const title = eventShareTitle(event);
  const description = eventShareDescription(event);
  const url = absoluteSiteUrl(eventPath(event.slug));
  const image = eventOgImage(event);
  const imageAlt = eventOgImageAlt(event);

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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchPublishedEventBySlug(slug).catch(() => null);
  if (!event) notFound();

  const jsonLd = eventJsonLd(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetailClient event={event} />
    </>
  );
}
