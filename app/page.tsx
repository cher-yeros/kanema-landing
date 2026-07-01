import {
  AboutSection,
  ContactSection,
  HeroSection,
  LandingProvidersClient,
  ServicesSection,
  SiteFooter,
  SiteHeader,
  TestimonialsSectionClient,
  WhyUsSection,
} from "@/components/landing";
import { Preloader } from "@/components/landing/Preloader";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { loadLandingPublicData } from "@/lib/load-landing-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { testimonials } = await loadLandingPublicData();

  return (
    <>
      <LandingProvidersClient />
      <Preloader />
      <SiteHeader />
      <main className="main">
        <HeroSection />
        <AboutSection />
        <WhyUsSection />
        {/* <ServicesSection /> */}
        {/* <PortfolioSectionClient /> */}
        <TestimonialsSectionClient initialRows={testimonials} />
        <ContactSection />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
