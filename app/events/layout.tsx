import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { BRAND_LOGO_SQUARE } from "@/lib/brand-assets";
import { absoluteSiteUrl } from "@/lib/site-url";

import "./events.css";
import "./event-ticket.css";

export const metadata: Metadata = {
  title: "Events — Canma",
  description:
    "Workshops, screenings, and community gatherings for Ethiopian photographers, videographers, and filmmakers.",
  alternates: { canonical: absoluteSiteUrl("/events") },
  openGraph: {
    title: "Events — Canma",
    description:
      "Workshops, screenings, and community gatherings for Ethiopian photographers, videographers, and filmmakers.",
    url: absoluteSiteUrl("/events"),
    siteName: "Canma",
    type: "website",
    images: [
      {
        url: absoluteSiteUrl(BRAND_LOGO_SQUARE),
        alt: "Canma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events — Canma",
    description:
      "Workshops, screenings, and community gatherings for Ethiopian photographers, videographers, and filmmakers.",
    images: [absoluteSiteUrl(BRAND_LOGO_SQUARE)],
  },
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main events-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
