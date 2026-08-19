/** Employer job-posting pricing (ETB). Single source of truth for UI and future billing. */

export const JOBS_PRICING_CURRENCY = "ETB";

export const JOBS_ANNUAL_BILLING_DISCOUNT_PERCENT = 30;

export const JOBS_FREE_MONTHLY_POST_LIMIT = 2;

export const JOBS_STANDARD_PER_JOB_PRICE = 400;

export type JobsPayPerJobPlan = {
  id: "free" | "standard";
  name: string;
  priceLabel: string;
  features: string;
};

export const JOBS_PAY_PER_JOB_PLANS: JobsPayPerJobPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "Free",
    features: `Up to ${JOBS_FREE_MONTHLY_POST_LIMIT} job posts per month`,
  },
  {
    id: "standard",
    name: "Standard",
    priceLabel: `${JOBS_STANDARD_PER_JOB_PRICE} ${JOBS_PRICING_CURRENCY} / job`,
    features: "Single job posting",
  },
];

export type JobsSubscriptionPlan = {
  id: "starter" | "business" | "enterprise";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  jobsIncluded: string;
  monthlyJobLimit: number | null;
  highlighted?: boolean;
};

export const JOBS_SUBSCRIPTION_PLANS: JobsSubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 1500,
    yearlyPrice: 12600,
    jobsIncluded: "15 jobs/month",
    monthlyJobLimit: 15,
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 2500,
    yearlyPrice: 21000,
    jobsIncluded: "40 jobs/month",
    monthlyJobLimit: 40,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 5000,
    yearlyPrice: 42000,
    jobsIncluded: "Unlimited job postings",
    monthlyJobLimit: null,
  },
];

export const JOBS_SUBSCRIPTION_INCLUDES = [
  "Employer dashboard",
  "Applicant management",
  "Company profile",
  "Job posting analytics",
  "Email notifications",
  "Priority customer support",
] as const;

export type JobsBoostAddon = {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
};

export const JOBS_BOOST_ADDONS: JobsBoostAddon[] = [
  {
    id: "featured",
    name: "Featured Listing",
    price: 300,
    description:
      "Pin your role higher in board results so serious applicants see it first.",
    icon: "bi-star",
  },
  {
    id: "urgent",
    name: "Urgent Hiring Badge",
    price: 500,
    description:
      "Add a clear urgent signal for roles that need crew on a tight timeline.",
    icon: "bi-lightning-charge",
  },
  {
    id: "homepage",
    name: "Homepage Spotlight",
    price: 800,
    description:
      "Surface your posting in Canma’s homepage spotlight for broader reach.",
    icon: "bi-house-heart",
  },
  {
    id: "social",
    name: "Social Media Promotion",
    price: 1500,
    description:
      "Promote the role across Canma social channels to attract more applicants.",
    icon: "bi-share",
  },
];

export type JobsValueComparisonRow = {
  usage: string;
  payPerJobCost: string;
  bestPlan: string;
};

export const JOBS_VALUE_COMPARISON: JobsValueComparisonRow[] = [
  { usage: "2 jobs/month", payPerJobCost: "Free", bestPlan: "Free" },
  {
    usage: "5 jobs/month",
    payPerJobCost: "2,000 ETB",
    bestPlan: "Starter (1,500 ETB)",
  },
  {
    usage: "15 jobs/month",
    payPerJobCost: "6,000 ETB",
    bestPlan: "Starter (1,500 ETB)",
  },
  {
    usage: "25 jobs/month",
    payPerJobCost: "10,000 ETB",
    bestPlan: "Business (2,500 ETB)",
  },
  {
    usage: "40 jobs/month",
    payPerJobCost: "16,000 ETB",
    bestPlan: "Business (2,500 ETB)",
  },
  {
    usage: "Unlimited",
    payPerJobCost: "Varies",
    bestPlan: "Enterprise (5,000 ETB)",
  },
];

export function formatJobsPrice(
  amount: number,
  opts?: { suffix?: string },
): string {
  const formatted = amount.toLocaleString("en-US");
  const base = `${formatted} ${JOBS_PRICING_CURRENCY}`;
  return opts?.suffix ? `${base} ${opts.suffix}` : base;
}

/** Jobs/month above which Starter beats pay-per-job at standard rate. */
export function jobsPerMonthStarterBreakEven(): number {
  const starter = JOBS_SUBSCRIPTION_PLANS.find((p) => p.id === "starter");
  if (!starter) return 4;
  return Math.ceil(starter.monthlyPrice / JOBS_STANDARD_PER_JOB_PRICE);
}
