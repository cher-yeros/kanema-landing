import {
  LandingProvidersClient,
  SiteFooter,
  SiteHeader,
} from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";
import { ForgotPasswordSection } from "@/components/community/ForgotPasswordSection";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <>
      <LandingProvidersClient />
      <SiteHeader />
      <main className="main">
        <ForgotPasswordSection />
      </main>
      <SiteFooter />
      <ScrollTop />
    </>
  );
}
