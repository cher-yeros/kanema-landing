import { graphqlHttpUrlServer } from "./graphql-env";

type GraphQLErrorLike = { message?: string };

async function fetchGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const res = await fetch(graphqlHttpUrlServer(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    data?: TData;
    errors?: GraphQLErrorLike[];
  };
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }
  if (!json.data) throw new Error("Missing GraphQL data");
  return json.data;
}

const LISTING_FIELDS = `
  id
  slug
  listing_type
  title
  description
  condition
  location
  brand
  price
  currency
  price_type
  status
  availability
  is_featured
  view_count
  budget_min
  budget_max
  auction_ends_at
  current_bid_amount
  published_at
  cover_url
  rating_avg
  review_count
  media {
    id
    kind
    url
    sort_order
  }
  seller {
    id
    full_name
    is_verified
    is_verified_seller
    rating_avg
    review_count
  }
  category {
    id
    slug
    name
    icon
  }
  rental_details {
    daily_rate
    weekly_rate
    deposit
    pickup_location
    delivery_available
  }
`;

export type PublicMarketplaceListing = {
  id: string;
  slug: string;
  listing_type: string;
  title: string;
  description: string | null;
  specifications_json?: string | null;
  condition: string | null;
  warranty?: string | null;
  location: string | null;
  brand: string | null;
  price: string;
  currency: string;
  price_type: string;
  status: string;
  availability: string;
  is_featured: boolean;
  view_count: number;
  budget_min: string | null;
  budget_max: string | null;
  auction_ends_at: string | null;
  current_bid_amount: string | null;
  min_bid_increment?: string | null;
  published_at: string | null;
  cover_url: string | null;
  rating_avg: string | null;
  review_count: number;
  media?: { id: string; kind: string; url: string; sort_order: number }[];
  seller: {
    id: string;
    full_name: string;
    is_verified: boolean;
    is_verified_seller: boolean;
    rating_avg: string | null;
    review_count: number;
  };
  category: {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
  } | null;
  rental_details: {
    daily_rate: string | null;
    weekly_rate: string | null;
    deposit: string | null;
    pickup_location: string | null;
    delivery_available: boolean;
  } | null;
  packages?: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    delivery_days: number;
    sort_order: number;
  }[];
  rental_blocks?: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
  }[];
};

export type PublicMarketplaceStore = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  about_md?: string | null;
  policies_md?: string | null;
  logo_url: string | null;
  cover_url: string | null;
  follower_count: number;
  rating_avg: string;
  review_count: number;
  is_verified: boolean;
  listing_count: number;
  owner: {
    id: string;
    full_name: string;
    is_verified_seller: boolean;
    rating_avg: string | null;
    review_count: number;
  };
};

export type PublicMarketplaceCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  listing_type: string | null;
  display_order: number;
  children: PublicMarketplaceCategory[];
};

export async function fetchMarketplaceListings(options?: {
  listing_type?: string;
  category_slug?: string;
  search?: string;
  sort?: string;
  limit?: number;
  skip?: number;
}): Promise<PublicMarketplaceListing[]> {
  const data = await fetchGraphQL<{
    marketplaceListings: PublicMarketplaceListing[];
  }>(
    `
      query MarketplaceListings($filter: MarketplaceListingsFilter, $sort: MarketplaceListingSort, $limit: Int, $skip: Int) {
        marketplaceListings(filter: $filter, sort: $sort, limit: $limit, skip: $skip) {
          ${LISTING_FIELDS}
        }
      }
    `,
    {
      filter: {
        listing_type: options?.listing_type ?? null,
        category_slug: options?.category_slug ?? null,
        search: options?.search ?? null,
      },
      sort: options?.sort ?? "newest",
      limit: options?.limit ?? 24,
      skip: options?.skip ?? 0,
    },
  );
  return data.marketplaceListings;
}

export async function fetchMarketplaceListingBySlug(
  slug: string,
): Promise<PublicMarketplaceListing | null> {
  const data = await fetchGraphQL<{
    marketplaceListingBySlug: PublicMarketplaceListing | null;
  }>(
    `
      query MarketplaceListingBySlug($slug: String!) {
        marketplaceListingBySlug(slug: $slug) {
          ${LISTING_FIELDS}
          specifications_json
          warranty
          min_bid_increment
          media {
            id
            kind
            url
            sort_order
          }
          packages {
            id
            name
            description
            price
            delivery_days
            sort_order
          }
          rental_blocks {
            id
            start_date
            end_date
            status
          }
        }
      }
    `,
    { slug },
  );
  return data.marketplaceListingBySlug;
}

export async function fetchMarketplaceStores(options?: {
  search?: string;
  limit?: number;
}): Promise<PublicMarketplaceStore[]> {
  const data = await fetchGraphQL<{
    marketplaceStores: PublicMarketplaceStore[];
  }>(
    `
      query MarketplaceStores($search: String, $limit: Int) {
        marketplaceStores(search: $search, limit: $limit) {
          id
          slug
          name
          description
          logo_url
          cover_url
          follower_count
          rating_avg
          review_count
          is_verified
          listing_count
          owner {
            id
            full_name
            is_verified_seller
            rating_avg
            review_count
          }
        }
      }
    `,
    { search: options?.search ?? null, limit: options?.limit ?? 24 },
  );
  return data.marketplaceStores;
}

export async function fetchMarketplaceStoreBySlug(
  slug: string,
): Promise<
  (PublicMarketplaceStore & { listings: PublicMarketplaceListing[] }) | null
> {
  const data = await fetchGraphQL<{
    marketplaceStoreBySlug:
      | (PublicMarketplaceStore & {
          listings: PublicMarketplaceListing[];
          about_md: string | null;
          policies_md: string | null;
        })
      | null;
  }>(
    `
      query MarketplaceStoreBySlug($slug: String!) {
        marketplaceStoreBySlug(slug: $slug) {
          id
          slug
          name
          description
          about_md
          policies_md
          logo_url
          cover_url
          follower_count
          rating_avg
          review_count
          is_verified
          listing_count
          owner {
            id
            full_name
            is_verified_seller
            rating_avg
            review_count
          }
          listings {
            ${LISTING_FIELDS}
          }
        }
      }
    `,
    { slug },
  );
  return data.marketplaceStoreBySlug;
}

export async function fetchMarketplaceCategories(
  listing_type?: string,
): Promise<PublicMarketplaceCategory[]> {
  const data = await fetchGraphQL<{
    marketplaceCategories: PublicMarketplaceCategory[];
  }>(
    `
      query MarketplaceCategories($listing_type: MarketplaceListingType) {
        marketplaceCategories(listing_type: $listing_type) {
          id
          slug
          name
          icon
          listing_type
          display_order
          children {
            id
            slug
            name
            icon
            listing_type
            display_order
          }
        }
      }
    `,
    { listing_type: listing_type ?? null },
  );
  return data.marketplaceCategories;
}

export async function fetchMarketplaceListingsForSeller(
  sellerUserId: string,
): Promise<PublicMarketplaceListing[]> {
  const data = await fetchGraphQL<{
    marketplaceListingsForSeller: PublicMarketplaceListing[];
  }>(
    `
      query MarketplaceListingsForSeller($seller_user_id: ID!) {
        marketplaceListingsForSeller(seller_user_id: $seller_user_id) {
          ${LISTING_FIELDS}
        }
      }
    `,
    { seller_user_id: sellerUserId },
  );
  return data.marketplaceListingsForSeller;
}
