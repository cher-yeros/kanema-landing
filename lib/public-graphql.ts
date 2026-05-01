import { graphqlHttpUrlServer } from "./graphql-env";

type GraphQLErrorLike = { message?: string };

async function fetchGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  const res = await fetch(graphqlHttpUrlServer(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
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

export type PublicTestimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  author_city: string | null;
  author_type: "CREATIVE" | "CLIENT" | "PARTNER";
  quote: string;
  avatar_url: string | null;
  is_featured: boolean;
  published_at: string | null;
};

export async function fetchTestimonials(): Promise<PublicTestimonial[]> {
  const data = await fetchGraphQL<{
    testimonials: PublicTestimonial[];
  }>(
    `
      query Testimonials($publishedOnly: Boolean, $featuredOnly: Boolean) {
        testimonials(publishedOnly: $publishedOnly, featuredOnly: $featuredOnly) {
          id
          author_name
          author_title
          author_city
          author_type
          quote
          avatar_url
          is_featured
          published_at
        }
      }
    `,
    { publishedOnly: true, featuredOnly: false }
  );
  return data.testimonials ?? [];
}

export type PublicTeamMember = {
  id: string;
  full_name: string;
  role_title: string;
  category: "GOVERNANCE" | "OPERATIONS" | "ADVISOR";
  bio: string | null;
  photo_url: string | null;
  display_order: number;
};

export async function fetchTeamMembers(): Promise<PublicTeamMember[]> {
  const data = await fetchGraphQL<{
    teamMembers: PublicTeamMember[];
  }>(
    `
      query TeamMembers($activeOnly: Boolean) {
        teamMembers(activeOnly: $activeOnly) {
          id
          full_name
          role_title
          category
          bio
          photo_url
          display_order
        }
      }
    `,
    { activeOnly: true }
  );
  return data.teamMembers ?? [];
}

export type PublicTalent = {
  id: string;
  headline: string | null;
  city: string | null;
  avatar_url: string | null;
  specialties: string | null;
  user: { id: string; full_name: string };
};

export type PublicProductionJob = {
  id: string;
  title: string;
  description: string;
  modality: string | null;
  location: string | null;
  role_tag: string | null;
  status: string;
  poster: { id: string; full_name: string };
  application_count: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchProductionJobs(): Promise<PublicProductionJob[]> {
  const data = await fetchGraphQL<{ productionJobs: PublicProductionJob[] }>(
    `
      query ProductionJobsBoard {
        productionJobs(openOnly: true) {
          id
          title
          description
          modality
          location
          role_tag
          status
          poster {
            id
            full_name
          }
          application_count
          createdAt
          updatedAt
        }
      }
    `
  );
  return data.productionJobs ?? [];
}

export async function fetchProductionJob(
  id: string
): Promise<PublicProductionJob | null> {
  const data = await fetchGraphQL<{ productionJob: PublicProductionJob | null }>(
    `
      query ProductionJobPublic($id: ID!) {
        productionJob(id: $id) {
          id
          title
          description
          modality
          location
          role_tag
          status
          poster {
            id
            full_name
          }
          application_count
          createdAt
          updatedAt
        }
      }
    `,
    { id }
  );
  return data.productionJob ?? null;
}

export async function fetchTalents(): Promise<PublicTalent[]> {
  const data = await fetchGraphQL<{
    talentProfiles: PublicTalent[];
  }>(
    `
      query TalentProfiles($publicOnly: Boolean) {
        talentProfiles(publicOnly: $publicOnly) {
          id
          headline
          city
          avatar_url
          specialties
          user {
            id
            full_name
          }
        }
      }
    `,
    { publicOnly: true }
  );
  return data.talentProfiles ?? [];
}

