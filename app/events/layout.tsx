import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

import "./events.css";

export const metadata: Metadata = {
  title: "Events — Kanema",
  description:
    "Workshops, screenings, and community gatherings for Ethiopian photographers, videographers, and filmmakers.",
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
