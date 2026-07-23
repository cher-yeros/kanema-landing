import type { Metadata } from "next";

import { JobEmployerPricing } from "@/components/jobs/JobEmployerPricing";

export const metadata: Metadata = {
  title: "Employer pricing — Creative Jobs — Canma",
  description:
    "Canma employer pricing for creative job postings: free tier, pay-per-job, subscription plans, optional boosts, and value comparison in ETB.",
};

export default function JobEmployerPricingPage() {
  return <JobEmployerPricing />;
}
