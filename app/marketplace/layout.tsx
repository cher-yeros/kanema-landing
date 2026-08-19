import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

export const metadata: Metadata = {
  title: "Marketplace — Canma",
  description:
    "Buy and sell creative equipment on the Canma marketplace — cameras, lenses, lighting, and production gear from verified members.",
};

export default function MarketplaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main marketplace-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
