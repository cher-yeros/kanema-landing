import Link from "next/link";

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

export default async function EventsCatalogPage() {
  let events: Awaited<ReturnType<typeof fetchPublishedEvents>> = [];
  try {
    events = await fetchPublishedEvents();
  } catch {
    events = [];
  }

  const now = Date.now();
  const upcoming = events.filter(
    (e) => new Date(e.start_date).getTime() >= now,
  );
  const past = events.filter((e) => new Date(e.start_date).getTime() < now);

  function EventList({ items }: { items: typeof events }) {
    if (items.length === 0) return null;
    return (
      <div className="row gy-4">
        {items.map((ev) => (
          <div className="col-lg-4 col-md-6" key={ev.id}>
            <article className="offering-block event-card h-100">
              <div className="offering-indicator" />
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
              <div className="offering-body">
                <div className="offering-header">
                  <h4>{ev.title}</h4>
                  {ev.is_featured ? (
                    <span className="featured-tag">Featured</span>
                  ) : (
                    <span className="featured-tag">{formatEventPrice(ev)}</span>
                  )}
                </div>
                <p className="small text-muted mb-2">
                  {[
                    modalityLabel(ev.modality),
                    ev.location,
                    formatEventPrice(ev),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="small mb-2">
                  <i className="bi bi-clock me-1" aria-hidden />
                  {formatEventWhen(ev.start_date, ev.end_date)}
                </p>
                <p
                  className="text-truncate-3-lines"
                  style={{ minHeight: "4.5rem" }}
                >
                  {ev.short_description ||
                    ev.description ||
                    "Open the event for details."}
                </p>
                <Link
                  href={`/events/${ev.slug}`}
                  className="explore-btn d-inline-flex"
                >
                  View event{" "}
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
          Workshops, screenings, and community gatherings from Kanema and
          partners.
        </p>
        <p className="small text-muted mb-0">
          <Link href="/" className="link-body-emphasis">
            Home
          </Link>
          {" · "}
          <Link href="/community" className="link-body-emphasis">
            Join the community
          </Link>
        </p>
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
            <EventList items={past} />
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
