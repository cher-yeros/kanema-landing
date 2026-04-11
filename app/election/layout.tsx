import type { Metadata } from "next";
import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { ElectionApolloProvider } from "@/components/election/ElectionApolloProvider";
import "./election.css";

export const metadata: Metadata = {
  title: "Kanema Presidential Election 2026 — ካነማ",
  description:
    "Official Kanema member ballot: one verified vote per election, transparent live results, built on the same trusted community hub.",
};

export default function ElectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ElectionApolloProvider>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main election-page">{children}</main>
      <SiteFooter />
      <ScrollTop />
    </ElectionApolloProvider>
  );
}
