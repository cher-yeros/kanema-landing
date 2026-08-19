/** Marketplace seller pricing (ETB). Single source of truth for UI and future billing. */

export const MARKETPLACE_PRICING_CURRENCY = "ETB";

export const MARKETPLACE_ANNUAL_BILLING_DISCOUNT_PERCENT = 30;

export const MARKETPLACE_FREE_ACTIVE_LISTING_LIMIT = 2;

export const MARKETPLACE_STANDARD_PER_LISTING_PRICE = 100;

export type MarketplacePayPerListingPlan = {
  id: "free" | "standard";
  name: string;
  priceLabel: string;
  features: string;
};

export const MARKETPLACE_PAY_PER_LISTING_PLANS: MarketplacePayPerListingPlan[] =
  [
    {
      id: "free",
      name: "Free",
      priceLabel: "Free",
      features: `Up to ${MARKETPLACE_FREE_ACTIVE_LISTING_LIMIT} active listings, standard visibility`,
    },
    {
      id: "standard",
      name: "Standard Listing",
      priceLabel: `${MARKETPLACE_STANDARD_PER_LISTING_PRICE} ${MARKETPLACE_PRICING_CURRENCY} / listing`,
      features: "Single marketplace listing",
    },
  ];

export type MarketplaceSubscriptionPlan = {
  id: "starter" | "business" | "pro";
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  activeListings: string;
  highlighted?: boolean;
};

export const MARKETPLACE_SUBSCRIPTION_PLANS: MarketplaceSubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter Seller",
    monthlyPrice: 1000,
    yearlyPrice: 8400,
    activeListings: "30 active listings",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business Seller",
    monthlyPrice: 2000,
    yearlyPrice: 16800,
    activeListings: "100 active listings",
  },
  {
    id: "pro",
    name: "Pro Seller",
    monthlyPrice: 4000,
    yearlyPrice: 33600,
    activeListings: "Unlimited active listings",
  },
];

export const MARKETPLACE_SUBSCRIPTION_INCLUDES = [
  "Dedicated seller storefront",
  "Buyer messaging",
  "Listing management dashboard",
  "Sales & listing analytics",
  "Order management",
  "Priority customer support",
  "Reduced marketplace transaction fees (if applicable)",
] as const;

export type MarketplaceBoostAddon = {
  id: string;
  name: string;
  price: number;
};

export const MARKETPLACE_BOOST_ADDONS: MarketplaceBoostAddon[] = [
  { id: "featured", name: "Featured Listing", price: 300 },
  { id: "homepage", name: "Homepage Spotlight", price: 500 },
  {
    id: "category-top",
    name: "Category Top Placement (7 Days)",
    price: 400,
  },
  { id: "social", name: "Social Media Promotion", price: 1500 },
];

export type MarketplaceValueComparisonRow = {
  usage: string;
  payPerListingCost: string;
  bestPlan: string;
};

export const MARKETPLACE_VALUE_COMPARISON: MarketplaceValueComparisonRow[] = [
  {
    usage: "2 active listings",
    payPerListingCost: "Free",
    bestPlan: "Free",
  },
  {
    usage: "5 active listings",
    payPerListingCost: "300 ETB",
    bestPlan: "Pay per listing",
  },
  {
    usage: "12 active listings",
    payPerListingCost: "1,000 ETB",
    bestPlan: "Starter Seller (1,000 ETB)",
  },
  {
    usage: "30 active listings",
    payPerListingCost: "2,800 ETB",
    bestPlan: "Starter Seller (1,000 ETB)",
  },
  {
    usage: "50 active listings",
    payPerListingCost: "4,800 ETB",
    bestPlan: "Business Seller (2,000 ETB)",
  },
  {
    usage: "100 active listings",
    payPerListingCost: "9,800 ETB",
    bestPlan: "Business Seller (2,000 ETB)",
  },
  {
    usage: "Unlimited",
    payPerListingCost: "Varies",
    bestPlan: "Pro Seller (4,000 ETB)",
  },
];

export function formatMarketplacePrice(
  amount: number,
  opts?: { suffix?: string },
): string {
  const formatted = amount.toLocaleString("en-US");
  const base = `${formatted} ${MARKETPLACE_PRICING_CURRENCY}`;
  return opts?.suffix ? `${base} ${opts.suffix}` : base;
}

/** Active listings above which Starter beats pay-per-listing at standard rate. */
export function activeListingsStarterBreakEven(): number {
  const starter = MARKETPLACE_SUBSCRIPTION_PLANS.find(
    (p) => p.id === "starter",
  );
  if (!starter) return 12;
  const paidListings =
    starter.monthlyPrice / MARKETPLACE_STANDARD_PER_LISTING_PRICE;
  return MARKETPLACE_FREE_ACTIVE_LISTING_LIMIT + paidListings;
}
