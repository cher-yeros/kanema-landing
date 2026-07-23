export type ApplicationStatus = "NEW" | "SHORTLISTED" | "REJECTED" | "HIRED";

export type ApplicationDisplayStatus =
  | "UNDER_REVIEW"
  | "INVITED"
  | "HIRED"
  | "PASSED"
  | "ARCHIVED";

export function normalizeApplicationStatus(
  status: string | null | undefined,
): ApplicationStatus {
  const value = String(status ?? "NEW").toUpperCase();
  if (
    value === "SHORTLISTED" ||
    value === "REJECTED" ||
    value === "HIRED" ||
    value === "NEW"
  ) {
    return value;
  }
  return "NEW";
}

/**
 * Applicant-facing status.
 * Archived = employer closed or filled the job (not an applicant action).
 */
export function resolveApplicationDisplayStatus(opts: {
  status?: string | null;
  jobStatus?: string | null;
}): ApplicationDisplayStatus {
  const status = normalizeApplicationStatus(opts.status);
  if (status === "HIRED") return "HIRED";
  const jobStatus = String(opts.jobStatus ?? "").toUpperCase();
  if (jobStatus === "CLOSED" || jobStatus === "FILLED") return "ARCHIVED";
  if (status === "SHORTLISTED") return "INVITED";
  if (status === "REJECTED") return "PASSED";
  return "UNDER_REVIEW";
}

export function applicationDisplayLabel(
  status: ApplicationDisplayStatus,
): string {
  switch (status) {
    case "INVITED":
      return "Invited";
    case "HIRED":
      return "Hired";
    case "PASSED":
      return "Passed";
    case "ARCHIVED":
      return "Archived";
    default:
      return "Under review";
  }
}

export function applicationDisplayTone(
  status: ApplicationDisplayStatus,
): string {
  return status.toLowerCase().replace(/_/g, "-");
}
