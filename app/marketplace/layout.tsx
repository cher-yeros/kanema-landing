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
    "Buy, sell, rent, and discover creative equipment, digital assets, and professional services on the Canma marketplace.",
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
