"use client";

import { useState } from "react";

import type { PublicEvent } from "@/lib/public-graphql";

import { recapSummaryText } from "./event-content";
import { EventStatusRibbon } from "./EventStatusRibbon";

function displayAttendance(event: PublicEvent): number {
  if (event.attendance_count != null) return event.attendance_count;
  return event.confirmed_registration_count;
}

export function EventRecapSection({ event }: { event: PublicEvent }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!event.is_past || !event.has_recap) return null;

  const attended = displayAttendance(event);
  const summaryText = recapSummaryText(event);

  return (
    <section className="event-recap mt-5" id="event-recap">
      <div className="event-recap__header mb-4">
        <h2 className="h4 mb-2">Event recap</h2>
        <div className="event-recap__stats d-flex flex-wrap gap-3 small text-muted">
          <span>
            <i className="bi bi-people me-1" aria-hidden />
            <strong className="text-body">
              {attended.toLocaleString()}
            </strong>{" "}
            attended
          </span>
          <span>
            <i className="bi bi-ticket-perforated me-1" aria-hidden />
            <strong className="text-body">
              {event.confirmed_registration_count.toLocaleString()}
            </strong>{" "}
            registered
          </span>
        </div>
      </div>

      {summaryText ? (
        <div className="info-box mb-4">
          {summaryText.split("\n").map((para, i) => (
            <p key={i} className={i === 0 ? "mb-3" : "mb-0"}>
              {para}
            </p>
          ))}
        </div>
      ) : null}

      {event.recap_highlights.length > 0 ? (
        <div className="info-box mb-4">
          <h3 className="h6 mb-3">Highlights</h3>
          <ul className="event-recap__highlights mb-0">
            {event.recap_highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {event.gallery.length > 0 ? (
        <div className="event-recap__gallery">
          <h3 className="h6 mb-3">Gallery</h3>
          <div className="event-recap__gallery-grid">
            {event.gallery.map((url, index) => (
              <button
                key={`${url}-${index}`}
                type="button"
                className="event-recap__gallery-item"
                onClick={() => setLightboxIndex(index)}
                aria-label={`Open gallery image ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {lightboxIndex != null && event.gallery[lightboxIndex] ? (
        <div
          className="event-recap-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="event-recap-lightbox__close"
            aria-label="Close gallery preview"
            onClick={() => setLightboxIndex(null)}
          >
            ×
          </button>
          {event.gallery.length > 1 ? (
            <>
              <button
                type="button"
                className="event-recap-lightbox__nav event-recap-lightbox__nav--prev"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + event.gallery.length) %
                      event.gallery.length,
                  );
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="event-recap-lightbox__nav event-recap-lightbox__nav--next"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % event.gallery.length);
                }}
              >
                ›
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.gallery[lightboxIndex]}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}

export function EventPastSidebar({ event }: { event: PublicEvent }) {
  if (!event.is_past) return null;

  const attended = displayAttendance(event);

  return (
    <div className="info-box mb-4">
      <EventStatusRibbon isPast className="event-status-ribbon--inline mb-3" />
      <ul className="event-meta-list mb-0">
        <li>
          <i className="bi bi-people" aria-hidden />
          <span>
            <strong>{attended.toLocaleString()}</strong> attended
          </span>
        </li>
        <li>
          <i className="bi bi-ticket-perforated" aria-hidden />
          <span>
            <strong>
              {event.confirmed_registration_count.toLocaleString()}
            </strong>{" "}
            registered
          </span>
        </li>
      </ul>
      {event.has_recap ? (
        <a
          href="#event-recap"
          className="btn btn-outline-secondary btn-sm mt-3"
        >
          View recap & gallery
        </a>
      ) : (
        <p className="small text-muted mb-0 mt-3">
          Registration is closed — this event has ended.
        </p>
      )}
    </div>
  );
}
