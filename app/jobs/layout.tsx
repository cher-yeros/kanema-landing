import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

import "./jobs.css";

export const metadata: Metadata = {
  title: "Creative Jobs — Canma",
  description:
    "Film and commercial creative jobs on Canma: crew, set, and post—structured listings so Ethiopian visual storytellers find serious work in one hub.",
};

export default function JobsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main jobs-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
