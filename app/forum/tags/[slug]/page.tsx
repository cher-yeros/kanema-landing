import Link from "next/link";
import { fetchForumThreads } from "@/lib/forum-public";
import { ThreadList } from "@/components/forum/ThreadCard";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

type Props = { params: Promise<{ slug: string }> };

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  let threads = {
    threads: [] as Awaited<ReturnType<typeof fetchForumThreads>>["threads"],
    total: 0,
  };
  try {
    const data = await fetchGraphQLThreads(slug);
    threads = data;
  } catch {
    /* ignore */
  }

  const label = slug.replace(/-/g, " ");

  return (
    <ForumPageShell
      title={`#${label}`}
      description={`${threads.total} discussions`}
      backHref="/forum/search"
      backLabel="Search forum"
    >
      <ThreadList threads={threads.threads} />
      <Link href="/forum/search" className="btn btn-ghost mt-3">
        <i className="bi bi-search" />
        Search all tags
      </Link>
    </ForumPageShell>
  );
}

async function fetchGraphQLThreads(tagSlug: string) {
  const { graphqlHttpUrlServer } = await import("@/lib/graphql-env");
  const res = await fetch(graphqlHttpUrlServer(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `query($tag_slug: String) {
        forumThreads(tag_slug: $tag_slug, limit: 30) {
          threads {
            id title body_md score reply_count createdAt is_featured
            author { id full_name }
            community { slug name icon_url }
            tags { slug name }
          }
          total
        }
      }`,
      variables: { tag_slug: tagSlug },
    }),
    cache: "no-store",
  });
  const json = await res.json();
  return json.data.forumThreads as Awaited<
    ReturnType<typeof fetchForumThreads>
  >;
}
