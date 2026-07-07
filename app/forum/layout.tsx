import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { ForumProviders } from "@/components/forum/ForumProviders";

export const metadata: Metadata = {
  title: "Forum — Canma",
  description:
    "Canma creative forum: photography, filmmaking, editing, gear, and more.",
};

export default function ForumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ForumProviders>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main forum-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </ForumProviders>
  );
}