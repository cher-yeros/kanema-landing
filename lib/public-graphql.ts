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
    { publishedOnly: true, featuredOnly: false },
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
    { activeOnly: true },
  );
  return data.teamMembers ?? [];
}

export type PublicCommunityMember = {
  id: string;
  full_name: string;
  role: string;
  city: string | null;
  avatar_url: string | null;
  message: string | null;
  portfolio_url: string | null;
  interests: string[];
  is_featured: boolean;
};

export async function fetchCommunityMembers(options?: {
  featuredOnly?: boolean;
}): Promise<PublicCommunityMember[]> {
  const data = await fetchGraphQL<{
    communityMembers: PublicCommunityMember[];
  }>(
    `
      query CommunityMembers($featuredOnly: Boolean) {
        communityMembers(featuredOnly: $featuredOnly) {
          id
          full_name
          role
          city
          avatar_url
          message
          portfolio_url
          interests
          is_featured
        }
      }
    `,
    { featuredOnly: options?.featuredOnly ?? false },
  );
  return data.communityMembers ?? [];
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
    `,
  );
  return data.productionJobs ?? [];
}

export async function fetchProductionJob(
  id: string,
): Promise<PublicProductionJob | null> {
  const data = await fetchGraphQL<{
    productionJob: PublicProductionJob | null;
  }>(
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
    { id },
  );
  return data.productionJob ?? null;
}

export type PublicPublishedCourse = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  category: string | null;
  language: string | null;
  level: string | null;
  tags: string | null;
  price: string;
  currency: string;
  published_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicCurriculumLesson = {
  id: string;
  section_id: string;
  title: string;
  sort_order: number;
  content_type: string;
  content_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  content_unlocked: boolean;
  resources_json: string | null;
  is_completed: boolean;
  watch_time_seconds: number;
};

export type PublicCourseSection = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  is_free_preview: boolean;
  lessons: PublicCurriculumLesson[];
};

export type PublicCourseReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; full_name: string };
};

export async function fetchPublishedCourses(): Promise<
  PublicPublishedCourse[]
> {
  const data = await fetchGraphQL<{
    publishedCourses: PublicPublishedCourse[];
  }>(
    `
      query PublishedCourses {
        publishedCourses(limit: 50, skip: 0, sort: newest) {
          id
          slug
          title
          short_description
          description
          thumbnail_url
          preview_video_url
          category
          language
          level
          tags
          price
          currency
          published_at
          createdAt
          updatedAt
        }
      }
    `,
  );
  return data.publishedCourses ?? [];
}

export async function fetchPublishedCourse(
  slug: string,
): Promise<PublicPublishedCourse | null> {
  const data = await fetchGraphQL<{
    publishedCourse: PublicPublishedCourse | null;
  }>(
    `
      query PublishedCourse($slug: String!) {
        publishedCourse(slug: $slug) {
          id
          slug
          title
          short_description
          description
          thumbnail_url
          preview_video_url
          category
          language
          level
          tags
          price
          currency
          published_at
          createdAt
          updatedAt
        }
      }
    `,
    { slug },
  );
  return data.publishedCourse ?? null;
}

export async function fetchPublishedCourseCurriculum(
  slug: string,
): Promise<PublicCourseSection[]> {
  const data = await fetchGraphQL<{
    publishedCourseCurriculum: PublicCourseSection[];
  }>(
    `
      query Curriculum($slug: String!) {
        publishedCourseCurriculum(slug: $slug) {
          id
          course_id
          title
          sort_order
          is_free_preview
          lessons {
            id
            section_id
            title
            sort_order
            content_type
            content_url
            duration_seconds
            is_free_preview
            content_unlocked
            resources_json
            is_completed
            watch_time_seconds
          }
        }
      }
    `,
    { slug },
  );
  return data.publishedCourseCurriculum ?? [];
}

export async function fetchPublishedCourseReviews(
  slug: string,
): Promise<PublicCourseReview[]> {
  const data = await fetchGraphQL<{
    publishedCourseReviews: PublicCourseReview[];
  }>(
    `
      query Reviews($slug: String!) {
        publishedCourseReviews(slug: $slug) {
          id
          user_id
          course_id
          rating
          comment
          createdAt
          author {
            id
            full_name
          }
        }
      }
    `,
    { slug },
  );
  return data.publishedCourseReviews ?? [];
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
    { publicOnly: true },
  );
  return data.talentProfiles ?? [];
}

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  location: string | null;
  modality: "ONLINE" | "IN_PERSON" | "HYBRID";
  cover_url: string | null;
  start_date: string;
  end_date: string | null;
  is_featured: boolean;
  display_order: number;
  published_at: string | null;
  is_free: boolean;
  price: string;
  currency: string;
  payment_instructions: string | null;
};

export async function fetchPublishedEvents(): Promise<PublicEvent[]> {
  const data = await fetchGraphQL<{
    events: PublicEvent[];
  }>(
    `
      query Events($publishedOnly: Boolean) {
        events(publishedOnly: $publishedOnly) {
          id
          slug
          title
          short_description
          description
          location
          modality
          cover_url
          start_date
          end_date
          is_featured
          display_order
          published_at
          is_free
          price
          currency
          payment_instructions
        }
      }
    `,
    { publishedOnly: true },
  );
  return data.events ?? [];
}

export async function fetchPublishedEventBySlug(
  slug: string,
): Promise<PublicEvent | null> {
  const data = await fetchGraphQL<{
    eventBySlug: PublicEvent | null;
  }>(
    `
      query EventBySlug($slug: String!) {
        eventBySlug(slug: $slug) {
          id
          slug
          title
          short_description
          description
          location
          modality
          cover_url
          start_date
          end_date
          is_featured
          display_order
          published_at
          is_free
          price
          currency
          payment_instructions
        }
      }
    `,
    { slug },
  );
  return data.eventBySlug ?? null;
}
