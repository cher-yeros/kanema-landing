import Link from "next/link";

import { EventPageLinks } from "@/components/events/EventPageLinks";
import { EventStatusRibbon } from "@/components/events/EventStatusRibbon";
import { fetchPublishedEvents } from "@/lib/public-graphql";

function formatEventWhen(start: string, end?: string | null): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return start;
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
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

function formatEventPrice(event: {
  is_free: boolean;
  price: string;
  currency: string;
}): string {
  if (event.is_free) return "Free";
  const amount = Number.parseFloat(event.price);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : event.price;
  return `${formatted} ${event.currency}`;
}

function displayAttendance(event: {
  attendance_count: number | null;
  confirmed_registration_count: number;
}): number {
  if (event.attendance_count != null) return event.attendance_count;
  return event.confirmed_registration_count;
}

export default async function EventsCatalogPage() {
  let events: Awaited<ReturnType<typeof fetchPublishedEvents>> = [];
  try {
    events = await fetchPublishedEvents();
  } catch {
    events = [];
  }

  const upcoming = events.filter((e) => !e.is_past);
  const past = events.filter((e) => e.is_past);

  function EventList({
    items,
    pastSection = false,
  }: {
    items: typeof events;
    pastSection?: boolean;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="row gy-4">
        {items.map((ev) => (
          <div className="col-lg-4 col-md-6" key={ev.id}>
            <article className="offering-block event-card h-100">
              <div className="offering-indicator" />
              <div className="event-card__media-wrap">
                <EventStatusRibbon isPast={ev.is_past} />
                <Link
                  href={`/events/${ev.slug}`}
                  className="event-card__media d-block"
                  tabIndex={-1}
                  aria-hidden
                >
                  {ev.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ev.cover_url} alt={ev.title} />
                  ) : (
                    <div className="event-card__placeholder">
                      <i className="bi bi-calendar-event" aria-hidden />
                    </div>
                  )}
                </Link>
              </div>
              <div className="offering-body">
                <div className="offering-header">
                  <h4>{ev.title}</h4>
                  {pastSection && ev.has_recap ? (
                    <span className="featured-tag">Recap</span>
                  ) : ev.is_featured ? (
                    <span className="featured-tag">Featured</span>
                  ) : (
                    <span className="featured-tag">{formatEventPrice(ev)}</span>
                  )}
                </div>
                <p className="small text-muted mb-2">
                  {[
                    modalityLabel(ev.modality),
                    ev.location,
                    pastSection ? null : formatEventPrice(ev),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {pastSection && (ev.has_recap || ev.is_past) ? (
                  <p className="small mb-2">
                    <i className="bi bi-people me-1" aria-hidden />
                    {displayAttendance(ev).toLocaleString()} attended
                    {ev.has_recap && ev.gallery.length > 0
                      ? ` · ${ev.gallery.length} photo${ev.gallery.length === 1 ? "" : "s"}`
                      : ""}
                  </p>
                ) : null}
                <p className="small mb-2">
                  <i className="bi bi-clock me-1" aria-hidden />
                  {formatEventWhen(ev.start_date, ev.end_date)}
                </p>
                <p
                  className="text-truncate-3-lines"
                  style={{ minHeight: "4.5rem" }}
                >
                  {pastSection && ev.has_recap && ev.recap_summary
                    ? ev.recap_summary
                    : ev.short_description ||
                      ev.description ||
                      (pastSection
                        ? "View photos and highlights from this event."
                        : "Open the event for details.")}
                </p>
                <Link
                  href={`/events/${ev.slug}${pastSection && ev.has_recap ? "#event-recap" : ""}`}
                  className="explore-btn d-inline-flex"
                >
                  {pastSection && ev.has_recap ? "View recap" : "View event"}{" "}
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Events</h1>
        <p>
          Workshops, screenings, and community gatherings from Canma and
          partners.
        </p>
        <EventPageLinks className="mb-0" />
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        {upcoming.length > 0 ? (
          <>
            <h2 className="h4 mb-4">Upcoming</h2>
            <EventList items={upcoming} />
          </>
        ) : null}

        {past.length > 0 ? (
          <div className={upcoming.length > 0 ? "mt-5 pt-2" : ""}>
            <h2 className="h4 mb-4">Past events</h2>
            <EventList items={past} pastSection />
          </div>
        ) : null}

        {events.length === 0 ? (
          <div className="info-box text-center py-5 mt-4">
            <p className="lead mb-2">No published events yet.</p>
            <p className="text-muted">
              Check back soon for workshops and gatherings.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
