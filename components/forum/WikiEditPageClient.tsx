"use client";

import { useQuery } from "@apollo/client/react";
import { WIKI_ARTICLE_QUERY } from "@/lib/forum-graphql";
import { WikiEditorClient } from "@/components/forum/WikiEditorClient";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

export default function WikiEditPageClient({ slug }: { slug: string }) {
  const { data } = useQuery(WIKI_ARTICLE_QUERY, { variables: { slug } });
  const article = (
    data as {
      wikiArticle?: {
        title: string;
        current_version: {
          title: string;
          body_md: string;
          summary: string | null;
        } | null;
      };
    }
  )?.wikiArticle;

  if (!article?.current_version) {
    return (
      <ForumPageShell title="Edit article" narrow>
        <p className="text-muted mb-0">Loading…</p>
      </ForumPageShell>
    );
  }

  return (
    <ForumPageShell
      title="Edit article"
      description={article.title}
      backHref={`/discussion/wiki/${slug}`}
      backLabel="Back to article"
      narrow
    >
      <WikiEditorClient
        slug={slug}
        initialTitle={article.current_version.title}
        initialBody={article.current_version.body_md}
        initialSummary={article.current_version.summary}
      />
    </ForumPageShell>
  );
}
