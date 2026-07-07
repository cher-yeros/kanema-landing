import type { Metadata } from "next";

import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

import "./profile.css";

export const metadata: Metadata = {
  title: "My profile — Canma",
  description:
    "View your Canma member account, community application, and quick links to jobs and events.",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main profile-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
