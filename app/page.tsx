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

export default function Home() {
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
        <TestimonialsSectionClient />
        <ContactSection />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
