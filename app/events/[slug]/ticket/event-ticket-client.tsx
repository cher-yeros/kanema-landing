"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import type { ReactNode } from "react";

import { MY_EVENT_TICKET_QUERY } from "@/lib/events-graphql";
import type { PublicEvent } from "@/lib/public-graphql";

function formatEventWhen(start: string, end?: string | null): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  const startStr = s.toLocaleString(undefined, opts);
  if (!end) return startStr;
  const e = new Date(end);
  if (Number.isNaN(e.getTime())) return startStr;
  return `${startStr} – ${e.toLocaleString(undefined, opts)}`;
}

function modalityLabel(modality: string): string {
  return modality.replace(/_/g, " ").toLowerCase();
}

function formatTicketPrice(
  isFree: boolean,
  amount: string,
  currency: string,
): string {
  if (isFree) return "Free";
  const n = Number.parseFloat(amount);
  const formatted = Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : amount;
  return `${formatted} ${currency}`;
}

function ticketRef(registration: {
  id: string;
  chapa_tx_ref?: string | null;
}): string {
  if (registration.chapa_tx_ref) return registration.chapa_tx_ref;
  return registration.id.replace(/-/g, "").slice(0, 12).toUpperCase();
}

function hasValidTicket(
  paymentStatus: "FREE" | "PENDING" | "CONFIRMED" | undefined,
): boolean {
  return paymentStatus === "CONFIRMED" || paymentStatus === "FREE";
}

const FIELD_ICONS: Record<string, string> = {
  attendee: "bi-person-fill",
  ticket: "bi-upc-scan",
  when: "bi-calendar-event",
  where: "bi-geo-alt-fill",
  format: "bi-broadcast",
  price: "bi-ticket-perforated-fill",
  status: "bi-patch-check-fill",
};

function TicketField({
  icon,
  label,
  wide,
  children,
}: {
  icon: string;
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`event-ticket__field${wide ? " event-ticket__field--wide" : ""}`}
    >
      <span className="event-ticket__field-icon" aria-hidden>
        <i className={`bi ${icon}`} />
      </span>
      <div className="event-ticket__field-content">
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

export function EventTicketClient({ event }: { event: PublicEvent }) {
  const { data, loading, error } = useQuery<{
    me: { full_name: string; email: string; phone: string } | null;
    myEventRegistration: {
      id: string;
      payment_status: "FREE" | "PENDING" | "CONFIRMED";
      fee_amount: string;
      fee_currency: string;
      chapa_tx_ref: string | null;
      note: string | null;
      createdAt: string;
      event: PublicEvent | null;
    } | null;
  }>(MY_EVENT_TICKET_QUERY, {
    variables: { event_id: event.id },
    fetchPolicy: "network-only",
  });

  const me = data?.me;
  const registration = data?.myEventRegistration;
  const ticketEvent = registration?.event ?? event;
  const valid = hasValidTicket(registration?.payment_status);

  if (loading) {
    return (
      <section className="services section">
        <div className="container py-5 text-center text-muted">
          Loading your ticket…
        </div>
      </section>
    );
  }

  if (!me) {
    return (
      <section className="services section">
        <div className="container py-5">
          <div className="info-box text-center">
            <h1 className="h4 mb-3">Sign in to view your ticket</h1>
            <p className="mb-4 text-muted">
              Your event ticket is linked to your Kanema member account.
            </p>
            <Link
              className="btn btn-accent"
              href={`/election/login?next=${encodeURIComponent(`/events/${event.slug}/ticket`)}`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (error || !registration || !valid) {
    return (
      <section className="services section">
        <div className="container py-5">
          <div className="info-box text-center">
            <h1 className="h4 mb-3">No ticket available</h1>
            <p className="mb-4 text-muted">
              {registration?.payment_status === "PENDING"
                ? "Complete payment to unlock your ticket."
                : "Register for this event first, then return here."}
            </p>
            <Link className="btn btn-accent" href={`/events/${event.slug}`}>
              Back to event
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const ref = ticketRef(registration);
  const hasCover = Boolean(ticketEvent.cover_url);

  return (
    <section className="services section event-ticket-page">
      <div className="container section-title no-print" data-aos="fade-up">
        <p className="small text-muted mb-2">
          <Link href={`/events/${event.slug}`} className="link-body-emphasis">
            ← Back to event
          </Link>
        </p>
        <h1>Your ticket</h1>
        <p className="mb-0">
          Present this at check-in for {ticketEvent.title}.
        </p>
      </div>

      <div
        className="container event-ticket-page__content"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="row justify-content-center">
          <div className="col-lg-10 col-print-12">
            <article className="event-ticket" id="event-ticket-print">
              <div
                className={`event-ticket__hero${hasCover ? " event-ticket__hero--has-cover" : ""}`}
              >
                {hasCover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ticketEvent.cover_url!}
                    alt=""
                    className="event-ticket__cover"
                  />
                ) : null}
                <div className="event-ticket__hero-top">
                  <div>
                    <p className="event-ticket__brand">Kanema</p>
                    <span className="event-ticket__badge">Admit one</span>
                  </div>
                </div>
                <div className="event-ticket__hero-bottom">
                  <h2 className="event-ticket__title">{ticketEvent.title}</h2>
                </div>
              </div>

              <div className="event-ticket__body">
                <dl className="event-ticket__grid">
                  <TicketField icon={FIELD_ICONS.attendee} label="Attendee">
                    {me.full_name}
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.ticket} label="Ticket no.">
                    <span className="event-ticket__mono">{ref}</span>
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.when} label="When" wide>
                    {formatEventWhen(
                      ticketEvent.start_date,
                      ticketEvent.end_date,
                    )}
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.where} label="Where">
                    {ticketEvent.location || "Location TBA"}
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.format} label="Format">
                    <span className="text-capitalize">
                      {modalityLabel(ticketEvent.modality)}
                    </span>
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.price} label="Price">
                    {formatTicketPrice(
                      ticketEvent.is_free,
                      registration.fee_amount,
                      registration.fee_currency,
                    )}
                  </TicketField>
                  <TicketField icon={FIELD_ICONS.status} label="Status">
                    <span className="event-ticket__status">
                      {registration.payment_status === "FREE"
                        ? "Registered"
                        : "Confirmed"}
                    </span>
                  </TicketField>
                </dl>

                {registration.note ? (
                  <div className="event-ticket__note">
                    <p className="event-ticket__label mb-1">Your note</p>
                    <p className="mb-0">{registration.note}</p>
                  </div>
                ) : null}
              </div>

              <div className="event-ticket__stub" aria-hidden>
                <span />
              </div>

              <div className="event-ticket__footer">
                <p className="event-ticket__footer-meta">
                  Registered{" "}
                  {new Date(registration.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                <p className="event-ticket__footer-brand">kanema.et</p>
              </div>
            </article>

            <div className="event-ticket-actions no-print d-flex flex-wrap gap-2 justify-content-center mt-4">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => window.print()}
              >
                Print ticket
              </button>
              <Link
                href={`/events/${event.slug}`}
                className="btn btn-outline-secondary"
              >
                Event details
              </Link>
              <Link href="/events" className="btn btn-outline-secondary">
                All events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
