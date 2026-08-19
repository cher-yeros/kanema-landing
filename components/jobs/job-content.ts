import { BRAND_LOGO_SQUARE } from "@/lib/brand-assets";
import {
  formatApplicantCount,
  formatJobBudget,
  formatJobDetailsLine,
} from "@/lib/jobs-board-utils";
import type { PublicProductionJob } from "@/lib/public-graphql";
import { absoluteSiteUrl } from "@/lib/site-url";

function truncateText(text: string, maxLength: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function jobPath(id: string): string {
  return `/jobs/${encodeURIComponent(id)}`;
}

export function jobShareTitle(job: PublicProductionJob): string {
  return `${job.title} — Canma Jobs`;
}

export function jobShareDescription(job: PublicProductionJob): string {
  const body = job.description?.trim();
  if (body) return truncateText(body, 200);

  const parts = [
    formatJobDetailsLine(job),
    job.location?.trim(),
    job.poster.full_name,
    formatApplicantCount(job.application_count),
  ].filter(Boolean);

  return truncateText(
    parts.join(" · ") ||
      "Creative production job for Ethiopian visual storytellers on Canma.",
    200,
  );
}

export function jobOgImage(): string {
  return absoluteSiteUrl(BRAND_LOGO_SQUARE);
}

export function jobOgImageAlt(job: PublicProductionJob): string {
  return `${job.title} on Canma Jobs`;
}

function mapEmploymentType(
  modality: string | null | undefined,
): string | undefined {
  const normalized = modality?.trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized.includes("part")) return "PART_TIME";
  if (normalized.includes("contract") || normalized.includes("freelance")) {
    return "CONTRACTOR";
  }
  if (normalized.includes("temp")) return "TEMPORARY";
  if (normalized.includes("intern")) return "INTERN";
  if (normalized.includes("permanent") || normalized.includes("full")) {
    return "FULL_TIME";
  }

  return undefined;
}

export function jobJsonLd(job: PublicProductionJob): Record<string, unknown> {
  const url = absoluteSiteUrl(jobPath(job.id));
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: jobShareDescription(job),
    datePosted: job.createdAt,
    url,
    image: [jobOgImage()],
    identifier: {
      "@type": "PropertyValue",
      name: "Canma job ID",
      value: job.id,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: job.poster.full_name,
    },
    directApply: true,
    applicantLocationRequirements: job.location?.trim()
      ? {
          "@type": "Country",
          name: job.location.trim(),
        }
      : undefined,
  };

  const employmentType = mapEmploymentType(job.modality);
  if (employmentType) payload.employmentType = employmentType;

  if (job.location?.trim()) {
    payload.jobLocation = {
      "@type": "Place",
      name: job.location.trim(),
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location.trim(),
      },
    };
  }

  const budget = formatJobBudget(job);
  if (budget) {
    payload.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.budget_currency?.trim() || "ETB",
      value: {
        "@type": "QuantitativeValue",
        name: budget,
      },
    };
  }

  if (job.status !== "OPEN") {
    payload.jobPostingAvailability = "Closed";
  }

  return payload;
}
