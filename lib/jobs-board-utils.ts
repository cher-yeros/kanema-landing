import type { PublicProductionJob } from "@/lib/public-graphql";
import { jobMatchesFilterOption } from "@/lib/jobs-filter-config";

export type JobsSort = "best" | "newest" | "oldest" | "fewest_applicants";

export type JobsBoardFilters = {
  search: string;
  postingTypes: string[];
  categories: string[];
  workTypes: string[];
  locations: string[];
  proposalRanges: string[];
};

export const PROPOSAL_RANGE_OPTIONS = [
  { id: "0", label: "Less than 5", min: 0, max: 4 },
  { id: "5-10", label: "5 to 10", min: 5, max: 10 },
  { id: "10-15", label: "10 to 15", min: 10, max: 15 },
  { id: "15-20", label: "15 to 20", min: 15, max: 20 },
  { id: "20+", label: "20+", min: 20, max: Infinity },
] as const;

export function formatPostedLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) {
    const label = mins <= 1 ? "1 minute" : `${mins} minutes`;
    return `Posted ${label} ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    const label = hrs === 1 ? "1 hour" : `${hrs} hours`;
    return `Posted ${label} ago`;
  }
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Posted yesterday";
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const label = weeks === 1 ? "1 week" : `${weeks} weeks`;
    return `Posted ${label} ago`;
  }
  return `Posted on ${new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function formatApplicantCount(count: number): string {
  if (count === 0) return "No proposals yet";
  if (count === 1) return "1 proposal";
  if (count < 5) return "Less than 5 proposals";
  if (count <= 10) return "5 to 10 proposals";
  if (count <= 15) return "10 to 15 proposals";
  if (count <= 20) return "15 to 20 proposals";
  return "20+ proposals";
}

function formatBudgetAmount(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatJobBudget(job: PublicProductionJob): string | null {
  const currency = job.budget_currency?.trim() || "ETB";
  const type = job.budget_type?.trim();
  const min = formatBudgetAmount(job.budget_min);
  const max = formatBudgetAmount(job.budget_max);

  if (type?.toLowerCase() === "negotiable") {
    return "Negotiable";
  }

  if (type?.toLowerCase() === "hourly") {
    if (min) return `Hourly · ${currency} ${min}/hr`;
    return "Hourly · Rate negotiable";
  }

  if (min && max && min !== max) {
    return `Fixed price · Est. budget: ${currency} ${min} – ${max}`;
  }

  if (min) {
    return `Fixed price · Est. budget: ${currency} ${min}`;
  }

  if (max) {
    return `Fixed price · Est. budget: ${currency} ${max}`;
  }

  return null;
}

export function formatOpenPositions(
  count: number | null | undefined,
): string | null {
  const n = typeof count === "number" ? count : Number(count);
  if (!Number.isFinite(n) || n < 1) return null;
  return n === 1 ? "1 open position" : `${n} open positions`;
}

export function formatJobSchedule(
  job: Pick<PublicProductionJob, "starts_on" | "ends_on">,
): string | null {
  if (!job.starts_on) return null;
  const start = new Date(`${job.starts_on}T00:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );
  if (!job.ends_on || job.ends_on === job.starts_on) return start;
  const end = new Date(`${job.ends_on}T00:00:00`).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  return `${start} – ${end}`;
}

export function formatJobDetailsLine(job: PublicProductionJob): string {
  return [
    job.modality,
    job.role_tag,
    job.production_kind,
    formatJobSchedule(job),
    formatOpenPositions(job.open_positions),
    formatJobBudget(job),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function collectLocationOptions(jobs: PublicProductionJob[]): string[] {
  const locations = new Set<string>();
  for (const job of jobs) {
    if (job.location?.trim()) locations.add(job.location.trim());
  }
  return [...locations].sort((a, b) => a.localeCompare(b));
}

export function getJobTags(job: PublicProductionJob): string[] {
  const tags = [...(job.skills ?? []), job.role_tag, job.modality].filter(
    (tag): tag is string => Boolean(tag?.trim()),
  );
  return [...new Set(tags.map((tag) => tag.trim()))];
}

function matchesProposalRange(count: number, rangeId: string): boolean {
  const range = PROPOSAL_RANGE_OPTIONS.find((item) => item.id === rangeId);
  if (!range) return true;
  return count >= range.min && count <= range.max;
}

export function filterJobs(
  jobs: PublicProductionJob[],
  filters: JobsBoardFilters,
  options: {
    categories: import("@/lib/jobs-filter-config").JobFilterOption[];
    workTypes: import("@/lib/jobs-filter-config").JobFilterOption[];
  },
): PublicProductionJob[] {
  const query = filters.search.trim().toLowerCase();
  const selectedCategories = options.categories.filter((item) =>
    filters.categories.includes(item.id),
  );
  const selectedWorkTypes = options.workTypes.filter((item) =>
    filters.workTypes.includes(item.id),
  );

  return jobs.filter((job) => {
    if (query) {
      const haystack = [
        job.title,
        job.description,
        job.role_tag,
        job.modality,
        job.location,
        job.production_kind,
        job.poster.full_name,
        ...(job.skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.postingTypes.length > 0) {
      const type = String(job.posting_type ?? "ROLE").toUpperCase();
      if (!filters.postingTypes.includes(type)) return false;
    }

    if (selectedCategories.length > 0) {
      const matches = selectedCategories.some((option) =>
        jobMatchesFilterOption(job, option, "modality"),
      );
      if (!matches) return false;
    }

    if (selectedWorkTypes.length > 0) {
      const matches = selectedWorkTypes.some((option) =>
        jobMatchesFilterOption(job, option, "role_tag"),
      );
      if (!matches) return false;
    }

    if (
      filters.locations.length > 0 &&
      (!job.location || !filters.locations.includes(job.location))
    ) {
      return false;
    }

    if (filters.proposalRanges.length > 0) {
      const matches = filters.proposalRanges.some((rangeId) =>
        matchesProposalRange(job.application_count, rangeId),
      );
      if (!matches) return false;
    }

    return true;
  });
}

export function sortJobs(
  jobs: PublicProductionJob[],
  sort: JobsSort,
): PublicProductionJob[] {
  const sorted = [...jobs];

  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "fewest_applicants":
      return sorted.sort((a, b) => {
        const diff = a.application_count - b.application_count;
        if (diff !== 0) return diff;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    case "best":
    default:
      return sorted.sort((a, b) => {
        const scoreA =
          new Date(a.createdAt).getTime() - a.application_count * 86_400_000;
        const scoreB =
          new Date(b.createdAt).getTime() - b.application_count * 86_400_000;
        return scoreB - scoreA;
      });
  }
}

export function tagMatchesSearch(tag: string, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return false;
  return tag.toLowerCase().includes(query);
}
