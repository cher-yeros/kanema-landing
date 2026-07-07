import { graphqlHttpUrlServer } from "./graphql-env";

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
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: TData;
    errors?: { message?: string }[];
  };
  if (json.errors?.length)
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  if (!json.data) throw new Error("Missing GraphQL data");
  return json.data;
}

export type ForumCommunityPublic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  icon_url: string | null;
  member_count: number;
  display_order: number;
};

export type ForumThreadPublic = {
  id: string;
  title: string;
  body_md: string;
  score: number;
  reply_count: number;
  view_count: number;
  is_featured: boolean;
  createdAt: string;
  author: { id: string; full_name: string };
  community: { slug: string; name: string; icon_url: string | null };
  tags: Array<{ slug: string; name: string }>;
};

export async function fetchForumCommunities(): Promise<ForumCommunityPublic[]> {
  const data = await fetchGraphQL<{
    forumCommunities: ForumCommunityPublic[];
  }>(
    `query { forumCommunities(activeOnly: true) {
      id slug name description cover_url icon_url member_count display_order
    }}`,
  );
  return data.forumCommunities;
}

export async function fetchForumCommunity(slug: string) {
  const data = await fetchGraphQL<{
    forumCommunity:
      | (ForumCommunityPublic & {
          rules_md: string | null;
          categories: Array<{ id: string; name: string; slug: string }>;
        })
      | null;
  }>(
    `query($slug: String!) { forumCommunity(slug: $slug) {
      id slug name description cover_url icon_url rules_md member_count
      categories { id name slug display_order }
    }}`,
    { slug },
  );
  return data.forumCommunity;
}

export async function fetchForumThreads(opts: {
  community_slug?: string;
  sort?: string;
  limit?: number;
}) {
  const data = await fetchGraphQL<{
    forumThreads: { threads: ForumThreadPublic[]; total: number };
  }>(
    `query($community_slug: String, $sort: ForumFeedSort, $limit: Int) {
      forumThreads(community_slug: $community_slug, sort: $sort, limit: $limit) {
        threads {
          id title body_md score reply_count view_count is_featured createdAt
          author { id full_name }
          community { slug name icon_url }
          tags { slug name }
        }
        total
      }
    }`,
    opts,
  );
  return data.forumThreads;
}

export async function fetchTrendingFeed(sort = "trending", limit = 10) {
  const data = await fetchGraphQL<{ trendingFeed: ForumThreadPublic[] }>(
    `query($sort: ForumFeedSort, $limit: Int) {
      trendingFeed(sort: $sort, limit: $limit) {
        id title score reply_count createdAt
        author { id full_name }
        community { slug name icon_url }
        tags { slug name }
      }
    }`,
    { sort, limit },
  );
  return data.trendingFeed;
}

export async function fetchForumThread(id: string) {
  const data = await fetchGraphQL<{
    forumThread:
      | (ForumThreadPublic & {
          category_id: string | null;
          accepted_reply_id: string | null;
        })
      | null;
  }>(
    `query($id: ID!) { forumThread(id: $id) {
      id title body_md score reply_count view_count createdAt community_id category_id accepted_reply_id
      author { id full_name }
      community { slug name icon_url }
      tags { slug name }
    }}`,
    { id },
  );
  return data.forumThread;
}

export async function fetchWikiArticles(limit = 20) {
  const data = await fetchGraphQL<{
    wikiArticles: {
      articles: Array<{
        id: string;
        slug: string;
        title: string;
        view_count: number;
        community: { slug: string; name: string } | null;
        current_version: { summary: string | null } | null;
      }>;
      total: number;
    };
  }>(
    `query($limit: Int) {
      wikiArticles(limit: $limit) {
        articles {
          id slug title view_count
          community { slug name }
          current_version { summary }
        }
        total
      }
    }`,
    { limit },
  );
  return data.wikiArticles;
}

export async function fetchWikiArticle(slug: string) {
  const data = await fetchGraphQL<{
    wikiArticle: {
      id: string;
      slug: string;
      title: string;
      view_count: number;
      community: { slug: string; name: string } | null;
      author: { full_name: string };
      current_version: {
        id: string;
        version_number: number;
        title: string;
        body_md: string;
        summary: string | null;
        createdAt: string;
        author: { full_name: string };
      } | null;
      tags: Array<{ slug: string; name: string }>;
    };
  }>(
    `query($slug: String!) {
      wikiArticle(slug: $slug) {
        id slug title view_count
        community { slug name }
        author { full_name }
        current_version {
          id version_number title body_md summary createdAt
          author { full_name }
        }
        tags { slug name }
      }
    }`,
    { slug },
  );
  return data.wikiArticle;
}
