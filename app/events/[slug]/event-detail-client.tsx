"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import {
  INITIATE_EVENT_PAYMENT_MUTATION,
  MY_EVENT_REGISTRATION_QUERY,
  PAYMENT_SETTINGS_QUERY,
  REGISTER_FOR_EVENT_MUTATION,
} from "@/lib/events-graphql";
import { MY_COMMUNITY_JOIN_QUERY } from "@/lib/graphql/community-join";
import type { PublicEvent } from "@/lib/public-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  EventPastSidebar,
  EventRecapSection,
} from "@/components/events/EventRecapSection";
import { EventPageLinks } from "@/components/events/EventPageLinks";
import { EventStatusRibbon } from "@/components/events/EventStatusRibbon";
import {
  eventDetailBodyText,
  recapSummaryText,
  shouldShowEventComingSoon,
} from "@/components/events/event-content";

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

function formatEventPrice(event: PublicEvent): string {
  if (event.is_free) return "Free";
  const amount = Number.parseFloat(event.price);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : event.price;
  return `${formatted} ${event.currency}`;
}

type RegistrationData = {
  myEventRegistration: {
    id: string;
    event_id: string;
    ticket_code: string;
    payment_status: "FREE" | "PENDING" | "CONFIRMED";
    fee_amount: string;
    fee_currency: string;
  } | null;
};

type ChapaCheckoutResponse = {
  status?: string;
  checkout_url?: string | null;
  message?: string;
};

function redirectToChapaCheckout(data: ChapaCheckoutResponse | undefined) {
  const url = data?.checkout_url?.trim();
  if (url) {
    window.location.assign(url);
    return true;
  }
  return false;
}

function communityJoinHref(pathHref: string) {
  return `/community/join?next=${encodeURIComponent(pathHref)}`;
}

export function EventDetailClient({ event }: { event: PublicEvent }) {
  const pathHref = `/events/${event.slug}`;
  const { data: meData } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
  const { data: joinData } = useQuery<{
    myCommunityJoin: { status: "PENDING" | "APPROVED" | "REJECTED" } | null;
  }>(MY_COMMUNITY_JOIN_QUERY, { skip: !me });
  const communityJoin = joinData?.myCommunityJoin;
  const communityApproved = communityJoin?.status === "APPROVED";
  const communityPending = communityJoin?.status === "PENDING";
  const { data: paymentData } = useQuery<{
    paymentSettings: { chapaEnabled: boolean };
  }>(PAYMENT_SETTINGS_QUERY);
  const chapaEnabled = paymentData?.paymentSettings.chapaEnabled === true;
  const { data: regData, refetch } = useQuery<RegistrationData>(
    MY_EVENT_REGISTRATION_QUERY,
    {
      variables: { event_id: event.id },
      skip: !me,
    },
  );
  const [register, { loading: registering }] = useMutation(
    REGISTER_FOR_EVENT_MUTATION,
  );
  const [initiatePayment, { loading: paying }] = useMutation(
    INITIATE_EVENT_PAYMENT_MUTATION,
  );
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const registration = regData?.myEventRegistration;
  const isRegistered = Boolean(registration) || done;
  const eventStarted = event.is_past;
  const canRegister =
    Boolean(me) && communityApproved && !isRegistered && !eventStarted;
  const showManualPaymentInstructions =
    !event.is_free && event.payment_instructions && !chapaEnabled;
  const awaitingChapaPayment =
    chapaEnabled &&
    !event.is_free &&
    (registration?.payment_status === "PENDING" || (!registration && done));
  const awaitingManualPayment =
    !chapaEnabled &&
    !event.is_free &&
    (registration?.payment_status === "PENDING" || (!registration && done));
  const hasTicket =
    registration?.payment_status === "CONFIRMED" ||
    registration?.payment_status === "FREE";

  async function startChapaCheckout() {
    setPaymentError(null);
    try {
      const { data } = await initiatePayment({
        variables: { event_id: event.id },
      });
      const payload = (
        data as { initiateEventPayment?: ChapaCheckoutResponse } | undefined
      )?.initiateEventPayment;

      if (!redirectToChapaCheckout(payload)) {
        throw new Error(payload?.message || "Could not start checkout.");
      }
    } catch (err: unknown) {
      setPaymentError(
        err instanceof Error ? err.message : "Could not start payment.",
      );
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      const { data } = await register({
        variables: {
          input: {
            event_id: event.id,
            note: note.trim() || null,
          },
        },
      });

      const payload = (
        data as { registerForEvent?: ChapaCheckoutResponse } | undefined
      )?.registerForEvent;

      if (payload?.status !== "success") {
        throw new Error(payload?.message || "Registration failed.");
      }

      if (chapaEnabled && !event.is_free) {
        if (!redirectToChapaCheckout(payload)) {
          throw new Error(
            "Registration saved but Chapa checkout could not start. Use Pay with Chapa below.",
          );
        }
        return;
      }

      setDone(true);
      await refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  const bodyText = eventDetailBodyText(event);
  const showComingSoon = shouldShowEventComingSoon(event);
  const recapFirst = event.is_past && event.has_recap;

  return (
    <section className="services section">
      <div className="container section-title" data-aos="fade-up">
        <p className="event-page-back mb-2">
          <Link href="/events" className="event-page-back__link">
            ← All events
          </Link>
        </p>
        <EventPageLinks className="mb-3" />
        <h1>{event.title}</h1>
        {event.short_description ? <p>{event.short_description}</p> : null}
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-8">
            <div className="event-detail-cover-wrap mb-4">
              <EventStatusRibbon isPast={event.is_past} />
              {event.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.cover_url}
                  alt={event.title}
                  className="event-detail-cover"
                />
              ) : (
                <div className="event-detail-cover event-detail-cover--placeholder">
                  <i className="bi bi-calendar-event" aria-hidden />
                </div>
              )}
            </div>
            {recapFirst ? <EventRecapSection event={event} /> : null}

            {bodyText ? (
              <div className="info-box">
                {bodyText.split("\n").map((para, i) => (
                  <p key={i} className={i === 0 ? "mb-3" : "mb-0"}>
                    {para}
                  </p>
                ))}
              </div>
            ) : showComingSoon ? (
              <p className="text-muted">More details coming soon.</p>
            ) : null}

            {!recapFirst ? <EventRecapSection event={event} /> : null}
          </div>
          <div className="col-lg-4">
            <EventPastSidebar event={event} />

            <div className="info-box mb-4">
              <h2 className="h5 mb-3">Event details</h2>
              <ul className="event-meta-list">
                <li>
                  <i className="bi bi-clock" aria-hidden />
                  <span>
                    {formatEventWhen(event.start_date, event.end_date)}
                  </span>
                </li>
                <li>
                  <i className="bi bi-pin-map" aria-hidden />
                  <span>{event.location || "Location TBA"}</span>
                </li>
                <li>
                  <i className="bi bi-broadcast" aria-hidden />
                  <span className="text-capitalize">
                    {modalityLabel(event.modality)}
                  </span>
                </li>
                <li>
                  <i className="bi bi-ticket-perforated" aria-hidden />
                  <span>{formatEventPrice(event)}</span>
                </li>
              </ul>
              {event.is_featured ? (
                <p className="mb-0 mt-3">
                  <span className="featured-tag">Featured event</span>
                </p>
              ) : null}
            </div>

            {showManualPaymentInstructions ? (
              <div className="info-box mb-4">
                <h2 className="h6 mb-2">Payment instructions</h2>
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {event.payment_instructions}
                </p>
              </div>
            ) : null}

            {!eventStarted && !me ? (
              <div className="info-box">
                <h3 className="h5 mb-3">Register for this event</h3>
                <p className="mb-3">
                  Join the Canma community first. Set a password when you join,
                  or use your phone number if you&apos;re already registered.
                </p>
                <Link
                  className="btn btn-accent"
                  href={communityJoinHref(pathHref)}
                >
                  Join the community first
                </Link>
              </div>
            ) : !eventStarted && communityPending ? (
              <div className="info-box">
                <h3 className="h5 mb-3">Membership pending</h3>
                <p className="mb-0 text-muted">
                  Your community application is awaiting admin approval. You can
                  register for events once you&apos;re approved.
                </p>
              </div>
            ) : !eventStarted && !communityApproved ? (
              <div className="info-box">
                <h3 className="h5 mb-3">Join the community</h3>
                <p className="mb-3">
                  Complete a community join request to register for this event.
                </p>
                <Link
                  className="btn btn-accent"
                  href={communityJoinHref(pathHref)}
                >
                  Join the community
                </Link>
              </div>
            ) : !eventStarted && me.role !== "member" ? (
              <div className="alert alert-warning">
                Only Canma members can register for events.
              </div>
            ) : isRegistered ? (
              <div className="info-box">
                <h3 className="h5 mb-3">You&apos;re registered</h3>
                {registration?.ticket_code ? (
                  <p className="small mb-3">
                    Registration code:{" "}
                    <strong className="font-monospace">
                      {registration.ticket_code}
                    </strong>
                  </p>
                ) : null}
                {awaitingChapaPayment ? (
                  <>
                    <p className="mb-3">
                      Your spot is reserved. Pay{" "}
                      <strong>{formatEventPrice(event)}</strong> securely with
                      Chapa to confirm your registration.
                    </p>
                    {paymentError ? (
                      <div className="text-danger small mb-2">
                        {paymentError}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-accent"
                      disabled={paying}
                      onClick={() => void startChapaCheckout()}
                    >
                      {paying ? "Starting checkout…" : "Pay with Chapa"}
                    </button>
                  </>
                ) : awaitingManualPayment ? (
                  <>
                    <p className="mb-2">
                      Your spot is reserved. Complete payment of{" "}
                      <strong>{formatEventPrice(event)}</strong> using the
                      instructions above.
                    </p>
                    <span className="badge text-bg-warning">
                      Payment pending confirmation
                    </span>
                  </>
                ) : hasTicket ? (
                  <>
                    <span className="badge text-bg-success mb-3">
                      {registration?.payment_status === "CONFIRMED"
                        ? "Registration confirmed"
                        : "Registered"}
                    </span>
                    <div>
                      <Link
                        href={`/events/${event.slug}/ticket`}
                        className="btn btn-accent"
                      >
                        View ticket
                      </Link>
                    </div>
                  </>
                ) : (
                  <span className="badge text-bg-success">Registered</span>
                )}
              </div>
            ) : eventStarted ? null : (
              <div className="info-box">
                <h3 className="h5 mb-3">Register for this event</h3>
                {!event.is_free ? (
                  <p className="small text-muted mb-3">
                    Ticket price: <strong>{formatEventPrice(event)}</strong>.
                    {chapaEnabled
                      ? " Submitting will take you to Chapa to complete payment."
                      : " After registering, follow the payment instructions to complete your booking."}
                  </p>
                ) : null}
                <form
                  onSubmit={(e) => void onRegister(e)}
                  className="space-y-3"
                >
                  {/* <div>
                    <label
                      htmlFor="event-reg-note"
                      className="form-label small"
                    >
                      Note (optional)
                    </label>
                    <textarea
                      id="event-reg-note"
                      className="form-control"
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Dietary needs, accessibility requests, etc."
                    />
                  </div> */}
                  {formError ? (
                    <div className="text-danger small">{formError}</div>
                  ) : null}
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={!canRegister || registering || paying}
                  >
                    {registering || paying
                      ? "Processing…"
                      : event.is_free
                        ? "Register free"
                        : chapaEnabled
                          ? "Register & pay"
                          : "Register"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
