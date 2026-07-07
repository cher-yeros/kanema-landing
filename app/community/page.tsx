import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
  TeamSectionClient,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { CommunityJoinSection } from "@/components/community/CommunityJoinSection";
import { loadLandingPublicData } from "@/lib/load-landing-data";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { communityMembers, teamMembers, featuredMembers } =
    await loadLandingPublicData();

  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main">
        <CommunityJoinSection />
        <TeamSectionClient
          initialMembers={communityMembers}
          initialTeamMembers={teamMembers}
          initialFeaturedMembers={featuredMembers}
        />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
