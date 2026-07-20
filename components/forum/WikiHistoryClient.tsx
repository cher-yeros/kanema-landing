"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client/react";
import { WIKI_HISTORY_QUERY, REVERT_WIKI_MUTATION } from "@/lib/forum-graphql";
import { timeAgo } from "@/components/forum/forum-utils";
import { ForumPageShell } from "@/components/forum/ForumPageShell";
import { useForumToast } from "@/components/forum/ForumToast";
export function WikiHistoryClient({ slug }: { slug: string }) {
  const { data, refetch } = useQuery(WIKI_HISTORY_QUERY, {
    variables: { slug },
  });
  const [revert, { loading }] = useMutation(REVERT_WIKI_MUTATION);
  const { showApolloError } = useForumToast();
  const history =
    (
      data as {
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

  return (
    <ForumPageShell
      title="Version history"
      backHref={`/discussion/wiki/${slug}`}
      backLabel="Back to article"
      narrow
    >
      <ul className="list-unstyled mb-0">
        {history.map((v) => (
          <li
            key={v.id}
            className="offering-block p-3 mb-2 d-flex justify-content-between align-items-center gap-3"
          >
            <div>
              <strong>v{v.version_number}</strong> — {v.title}
              <div className="small text-muted">
                {v.author.full_name} · {timeAgo(v.createdAt)}
                {v.change_note ? ` · ${v.change_note}` : ""}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-shrink-0"
              disabled={loading}
              onClick={() =>
                revert({ variables: { slug, version_id: v.id } })
                  .then(() => refetch())
                  .catch((err) =>
                    showApolloError(err, "Could not revert version."),
                  )
              }            >
              <i className="bi bi-arrow-counterclockwise" />
              Revert
            </button>
          </li>
        ))}
      </ul>
    </ForumPageShell>
  );
}
