"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { WIKI_ARTICLE_QUERY, WIKI_HISTORY_QUERY } from "@/lib/forum-graphql";
import { MarkdownRenderer } from "@/components/forum/MarkdownRenderer";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

export function WikiArticleClient({ slug }: { slug: string }) {
  const { data } = useQuery(WIKI_ARTICLE_QUERY, {
    variables: { slug },
  });
  const { data: historyData } = useQuery(WIKI_HISTORY_QUERY, {
    variables: { slug },
  });

  const article = (
    data as {
      wikiArticle?: {
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
    }
  )?.wikiArticle;

  const history =
    (
      historyData as {
        wikiArticleHistory?: Array<{
          id: string;
          version_number: number;
          title: string;
          change_note: string | null;
          createdAt: string;
          author: { full_name: string };
        }>;
      }
    )?.wikiArticleHistory ?? [];

  if (!article) {
    return (
      <ForumPageShell>
        <p className="text-muted mb-0">Loading…</p>
      </ForumPageShell>
    );
  }

  const version = article.current_version;

  return (
    <ForumPageShell>
      <nav className="small mb-3">
        <Link href="/forum/wiki">Wiki</Link>
        {article.community ? (
          <>
            {" / "}
            <Link href={`/forum/c/${article.community.slug}`}>
              {article.community.name}
            </Link>
          </>
        ) : null}
      </nav>

      <article className="offering-block p-4 mb-4">
        <h1 className="h3 mb-2">{article.title}</h1>
        <div className="small text-muted mb-3">
          v{version?.version_number ?? 1} by{" "}
          {version?.author.full_name ?? article.author.full_name} ·{" "}
          {article.view_count} views
        </div>
        {version?.summary ? <p className="lead">{version.summary}</p> : null}
        {version ? <MarkdownRenderer content={version.body_md} /> : null}
        <div className="d-flex flex-wrap gap-2 mt-3">
          {article.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/forum/tags/${t.slug}`}
              className="badge forum-tag-badge text-decoration-none"
            >
              {t.name}
            </Link>
          ))}
        </div>
        <div className="mt-3">
          <Link
            href={`/forum/wiki/${slug}/edit`}
            className="btn btn-sm btn-outline-secondary me-2"
          >
            <i className="bi bi-pencil" />
            Edit
          </Link>
          <Link
            href={`/forum/wiki/${slug}/history`}
            className="btn btn-sm btn-ghost"
          >
            <i className="bi bi-clock-history" />
            History ({history.length})
          </Link>
        </div>
      </article>
    </ForumPageShell>
  );
}
