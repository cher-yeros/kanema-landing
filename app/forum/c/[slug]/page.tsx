import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchForumCommunity, fetchForumThreads } from "@/lib/forum-public";
import { ThreadList } from "@/components/forum/ThreadCard";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

type Props = { params: Promise<{ slug: string }> };

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params;
  let community: Awaited<ReturnType<typeof fetchForumCommunity>> = null;
  let threads = {
    threads: [] as Awaited<ReturnType<typeof fetchForumThreads>>["threads"],
    total: 0,
  };

  try {
    community = await fetchForumCommunity(slug);
    if (community) {
      threads = await fetchForumThreads({
        community_slug: slug,
        sort: "trending",
        limit: 30,
      });
    }
  } catch {
    /* ignore */
  }

  if (!community) notFound();

  return (
    <ForumPageShell
      backHref="/forum#forum-communities"
      backLabel="All communities"
    >
      <div className="offering-block p-4 mb-4">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
            <span className="fs-1">{community.icon_url ?? "💬"}</span>
            <div className="flex-grow-1 min-w-0">
              <h1 className="h3 mb-1">{community.name}</h1>
              <p className="text-muted mb-2">{community.description}</p>
              <span className="small text-muted">
                {community.member_count.toLocaleString()} members
              </span>
            </div>
          </div>
          <Link
            href={`/forum/c/${slug}/new`}
            className="btn btn-accent flex-shrink-0"
          >
            <i className="bi bi-plus-circle" />
            New thread
          </Link>
        </div>
        {community.rules_md ? (
          <details className="mt-3">
            <summary className="small fw-semibold">Community rules</summary>
            <p className="small text-muted mb-0 mt-2">{community.rules_md}</p>
          </details>
        ) : null}
      </div>

      {community.categories.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {community.categories.map((cat) => (
            <span key={cat.id} className="badge forum-tag-badge">
              {cat.name}
            </span>
          ))}
        </div>
      ) : null}

      <ThreadList threads={threads.threads} />
    </ForumPageShell>
  );
}
