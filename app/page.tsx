import {
  AboutSection,
  ContactSection,
  HeroSection,
  LandingProvidersClient,
  PortfolioSectionClient,
  ServicesSection,
  SiteFooter,
  SiteHeader,
  TeamSectionClient,
  TestimonialsSectionClient,
  WhyUsSection,
} from "@/components/landing";
import { Preloader } from "@/components/landing/Preloader";
import { ScrollTop } from "@/components/landing/ScrollTop";

export default function Home() {
  return (
    <>
      <LandingProvidersClient />
      <Preloader />
      <SiteHeader />
      <main className="main">
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PortfolioSectionClient />
        <WhyUsSection />
        <TestimonialsSectionClient />
        <TeamSectionClient />
        <ContactSection />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
