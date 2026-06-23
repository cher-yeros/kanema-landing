import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

import "../events/events.css";
import "./payment-success.css";

export const metadata: Metadata = {
  title: "Payment successful — Canma",
  description: "Your event payment was received.",
};

export default function PaymentSuccessLayout({
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
