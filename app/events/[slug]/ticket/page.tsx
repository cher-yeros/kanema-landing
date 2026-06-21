import { notFound } from "next/navigation";

import { fetchPublishedEventBySlug } from "@/lib/public-graphql";

import { EventTicketClient } from "./event-ticket-client";

export default async function EventTicketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchPublishedEventBySlug(slug).catch(() => null);
  if (!event) notFound();

  return <EventTicketClient event={event} />;
}
