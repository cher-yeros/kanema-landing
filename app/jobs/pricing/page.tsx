import type { Metadata } from "next";
import Link from "next/link";

import { JobEmployerPricing } from "@/components/jobs/JobEmployerPricing";

export const metadata: Metadata = {
  title: "Employer pricing — Creative Jobs — Canma",
  description:
    "Canma employer pricing for creative job postings: free tier, pay-per-job, subscription plans, optional boosts, and value comparison in ETB.",
};

export default function JobEmployerPricingPage() {
  return (
    <>
      <section className="hero section">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="hero-heading">
                <span className="badge-label">Employer pricing</span>
                <h1>Job posting pricing</h1>
                <p>
                  Transparent plans for production houses, studios, and hirers
                  on Canma—start free, pay per post, or subscribe when you hire
                  regularly.
                </p>
                <div className="hero-actions mt-4">
                  <Link href="/jobs/new" className="btn btn-accent">
                    <i className="bi bi-plus-circle me-2" aria-hidden />
                    Post a role
                  </Link>
                  <Link href="/jobs" className="btn btn-ghost">
                    <i className="bi bi-briefcase me-2" aria-hidden />
                    Browse Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JobEmployerPricing />
    </>
  );
}
