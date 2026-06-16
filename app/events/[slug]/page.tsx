import { notFound } from "next/navigation";

import { fetchPublishedEventBySlug } from "@/lib/public-graphql";

import { EventDetailClient } from "./event-detail-client";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchPublishedEventBySlug(slug).catch(() => null);
  if (!event) notFound();

  return <EventDetailClient event={event} pathHref={`/events/${slug}`} />;
}
