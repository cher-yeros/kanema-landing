"use client";

import dynamic from "next/dynamic";

export const LandingProvidersClient = dynamic(
  () =>
    import("./LandingProviders").then((m) => ({
      default: m.LandingProviders,
    })),
  { ssr: false },
);

export const PortfolioSectionClient = dynamic(
  () =>
    import("./PortfolioSection").then((m) => ({
      default: m.PortfolioSection,
    })),
  { ssr: false },
);

export const TestimonialsSectionClient = dynamic(
  () =>
    import("./TestimonialsSection").then((m) => ({
      default: m.TestimonialsSection,
    })),
  { ssr: false },
);

export const TeamSectionClient = dynamic(
  () =>
    import("./TeamSection").then((m) => ({
      default: m.TeamSection,
    })),
  { ssr: false },
);
