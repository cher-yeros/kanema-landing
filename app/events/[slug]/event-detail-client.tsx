"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

import { ME_QUERY } from "@/lib/election-graphql";
import {
  MY_EVENT_REGISTRATION_QUERY,
  REGISTER_FOR_EVENT_MUTATION,
} from "@/lib/events-graphql";
import type { PublicEvent } from "@/lib/public-graphql";
import type { MeQuery } from "@/types/election-apollo";

function loginHrefBack(path: string) {
  return `/election/login?next=${encodeURIComponent(path)}`;
}

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
    payment_status: "FREE" | "PENDING" | "CONFIRMED";
    fee_amount: string;
    fee_currency: string;
  } | null;
};

export function EventDetailClient({
  event,
  pathHref,
}: {
  event: PublicEvent;
  pathHref: string;
}) {
  const { data: meData } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;
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
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const registration = regData?.myEventRegistration;
  const isRegistered = Boolean(registration) || done;
  const eventStarted = new Date(event.start_date).getTime() < Date.now();
  const canRegister =
    Boolean(me?.role === "member") &&
    Boolean(me?.is_verified) &&
    !isRegistered &&
    !eventStarted;

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await register({
        variables: {
          input: {
            event_id: event.id,
            note: note.trim() || null,
          },
        },
      });
      setDone(true);
      void refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <section className="services section">
      <div className="container section-title" data-aos="fade-up">
        <p className="small text-muted mb-2">
          <Link href="/events" className="link-body-emphasis">
            ← All events
          </Link>
        </p>
        <h1>{event.title}</h1>
        {event.short_description ? <p>{event.short_description}</p> : null}
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-8">
            {event.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.cover_url}
                alt={event.title}
                className="event-detail-cover mb-4"
              />
            ) : null}
            {event.description ? (
              <div className="info-box">
                {event.description.split("\n").map((para, i) => (
                  <p key={i} className={i === 0 ? "mb-3" : "mb-0"}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted">More details coming soon.</p>
            )}
          </div>
          <div className="col-lg-4">
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

            {!event.is_free && event.payment_instructions ? (
              <div className="info-box mb-4">
                <h2 className="h6 mb-2">Payment instructions</h2>
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {event.payment_instructions}
                </p>
              </div>
            ) : null}

            {!me ? (
              <div className="info-box">
                <h3 className="h5 mb-3">Register</h3>
                <p className="mb-3">
                  Sign in with your Kanema member account to register for this
                  event.
                </p>
                <Link className="btn btn-accent" href={loginHrefBack(pathHref)}>
                  Member sign-in
                </Link>
              </div>
            ) : me.role !== "member" ? (
              <div className="alert alert-warning">
                Only Kanema members can register for events.
              </div>
            ) : !me.is_verified ? (
              <div className="info-box">
                <h3 className="h5 mb-3">Verify your account</h3>
                <p className="mb-3">
                  Complete OTP verification before registering for events.
                </p>
                <Link className="btn btn-accent" href="/election/verify">
                  Verify account
                </Link>
              </div>
            ) : eventStarted ? (
              <div className="info-box">
                <p className="mb-0 text-muted">
                  Registration is closed — this event has already started.
                </p>
              </div>
            ) : isRegistered ? (
              <div className="info-box">
                <h3 className="h5 mb-3">You&apos;re registered</h3>
                {registration?.payment_status === "PENDING" ||
                (!event.is_free && !registration && done) ? (
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
                ) : registration?.payment_status === "CONFIRMED" ? (
                  <span className="badge text-bg-success">
                    Registration confirmed
                  </span>
                ) : (
                  <span className="badge text-bg-success">Registered</span>
                )}
              </div>
            ) : (
              <div className="info-box">
                <h3 className="h5 mb-3">Register for this event</h3>
                {!event.is_free ? (
                  <p className="small text-muted mb-3">
                    Ticket price: <strong>{formatEventPrice(event)}</strong>.
                    After registering, follow the payment instructions to
                    complete your booking.
                  </p>
                ) : null}
                <form
                  onSubmit={(e) => void onRegister(e)}
                  className="space-y-3"
                >
                  <div>
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
                  </div>
                  {formError ? (
                    <div className="text-danger small">{formError}</div>
                  ) : null}
                  <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={!canRegister || registering}
                  >
                    {registering
                      ? "Registering…"
                      : event.is_free
                        ? "Register free"
                        : "Register & pay"}
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
