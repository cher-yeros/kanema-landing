import type { PublicEvent } from "@/lib/public-graphql";
import { BRAND_LOGO_SQUARE } from "@/lib/brand-assets";
import { absoluteMediaUrl, absoluteSiteUrl, eventPath } from "@/lib/site-url";

export function eventDetailBodyText(event: PublicEvent): string | null {
  const description = event.description?.trim();
  if (description) return description;

  const shortDescription = event.short_description?.trim();
  if (shortDescription) return shortDescription;

  return null;
}

export function shouldShowEventComingSoon(event: PublicEvent): boolean {
  if (eventDetailBodyText(event)) return false;
  if (event.is_past && event.has_recap) return false;
  return true;
}

export function isLikelyUrlBlob(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  return (trimmed.match(/https?:\/\//gi)?.length ?? 0) >= 2;
}

export function recapSummaryText(event: PublicEvent): string | null {
  const summary = event.recap_summary?.trim();
  if (!summary || isLikelyUrlBlob(summary)) return null;
  return summary;
}

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function formatEventShareWhen(start: string, end?: string | null): string {
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

function formatEventSharePrice(event: PublicEvent): string {
  if (event.is_free) return "Free";
  const amount = Number.parseFloat(event.price);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : event.price;
  return `${formatted} ${event.currency}`;
}

function eventShareAttendance(event: PublicEvent): number {
  if (event.attendance_count != null) return event.attendance_count;
  return event.confirmed_registration_count;
}

export function eventShareTitle(event: PublicEvent): string {
  return `${event.title} — Canma Events`;
}

export function eventShareDescription(event: PublicEvent): string {
  const recap = recapSummaryText(event);
  if (recap) {
    const attended = eventShareAttendance(event);
    return truncateText(`${attended.toLocaleString()} attended. ${recap}`, 200);
  }

  const body = eventDetailBodyText(event);
  if (body) return truncateText(body, 200);

  const parts = [
    formatEventShareWhen(event.start_date, event.end_date),
    event.location,
    event.modality.replace(/_/g, " ").toLowerCase(),
    formatEventSharePrice(event),
  ].filter(Boolean);

  return truncateText(
    parts.join(" · ") ||
      "Canma community event for Ethiopian visual storytellers.",
    200,
  );
}

export function eventOgImage(event: PublicEvent): string {
  const cover = event.cover_url?.trim();
  if (cover) return absoluteMediaUrl(cover);

  const galleryImage = event.gallery.find((url) => url.trim());
  if (galleryImage) return absoluteMediaUrl(galleryImage);

  return absoluteSiteUrl(BRAND_LOGO_SQUARE);
}

export function eventOgImageAlt(event: PublicEvent): string {
  if (event.cover_url?.trim() || event.gallery.length > 0) {
    return `${event.title} event photo`;
  }
  return "Canma";
}

export function eventJsonLd(event: PublicEvent): Record<string, unknown> {
  const url = absoluteSiteUrl(eventPath(event.slug));
  const image = eventOgImage(event);
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: eventShareDescription(event),
    startDate: event.start_date,
    image: [image],
    url,
    organizer: {
      "@type": "Organization",
      name: "Canma",
      url: absoluteSiteUrl("/"),
    },
    offers: {
      "@type": "Offer",
      price: event.is_free ? "0" : event.price,
      priceCurrency: event.currency,
      availability: event.is_past
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url,
    },
  };

  if (event.end_date) payload.endDate = event.end_date;

  if (event.location?.trim()) {
    if (event.modality === "ONLINE") {
      payload.eventAttendanceMode =
        "https://schema.org/OnlineEventAttendanceMode";
      payload.location = {
        "@type": "VirtualLocation",
        url,
      };
    } else {
      payload.eventAttendanceMode =
        event.modality === "HYBRID"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode";
      payload.location = {
        "@type": "Place",
        name: event.location,
        address: event.location,
      };
    }
  }

  return payload;
}
