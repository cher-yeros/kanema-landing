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
        <section id="join" className="contact section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Join the community</h2>
            <p>
              Become part of Canma’s network—connect with creators, find
              opportunities, and collaborate on productions.
            </p>
          </div>

          <CommunityJoinSection />
        </section>
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
