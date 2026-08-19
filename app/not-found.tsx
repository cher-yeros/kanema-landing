import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/landing";
import { ScrollTop } from "@/components/landing/ScrollTop";

export default function NotFound() {
  return (
    <div className="not-found-layout">
      <SiteHeader />
      <main className="main not-found-main">
        <section className="hero section not-found-page">
          <div className="container">
            <div className="hero-heading text-center mx-auto">
              <span className="badge-label">404</span>
              <h1>Page not found</h1>
              <p>
                We could not find the page you were looking for. It may have
                moved, or the link might be outdated.
              </p>
              <div className="hero-actions justify-content-center">
                <Link href="/" className="btn btn-accent">
                  Back to home
                </Link>
                <Link href="/#contact" className="btn btn-ghost">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ScrollTop />
    </div>
  );
}
