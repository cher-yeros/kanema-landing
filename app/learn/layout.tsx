import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

import "./learn.css";

export const metadata: Metadata = {
  title: "Learn — Kanema",
  description:
    "Free courses and learning paths for Ethiopian photographers, videographers, and filmmakers on Kanema.",
};

export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main learn-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
