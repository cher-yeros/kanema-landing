import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
  TeamSectionClient,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { loadLandingPublicData } from "@/lib/load-landing-data";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { communityMembers } = await loadLandingPublicData();

  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main">
        <TeamSectionClient initialMembers={communityMembers} />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
