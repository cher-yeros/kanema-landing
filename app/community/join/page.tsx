import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { CommunityJoinSection } from "@/components/community/CommunityJoinSection";

export const dynamic = "force-dynamic";

export default function CommunityJoinPage() {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main">
        <CommunityJoinSection />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
