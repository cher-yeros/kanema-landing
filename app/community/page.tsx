import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
  TeamSectionClient,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { JoinCommunityForm } from "@/components/community/JoinCommunityForm";

export default function CommunityPage() {
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

          <JoinCommunityForm />
        </section>
        <TeamSectionClient />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
