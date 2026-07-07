"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useQuery, useSubscription } from "@apollo/client/react";
import {
  FORUM_THREAD_QUERY,
  FORUM_REPLIES_QUERY,
  FORUM_REPLY_SUBSCRIPTION,
} from "@/lib/forum-graphql";
import { VoteButton } from "@/components/forum/VoteButton";
import { MarkdownRenderer } from "@/components/forum/MarkdownRenderer";
import { ReplyTree, ThreadReplyForm } from "@/components/forum/ReplyTree";
import { timeAgo } from "@/components/forum/forum-utils";
import { ForumPageShell } from "@/components/forum/ForumPageShell";
import { ForumMediaGallery } from "@/components/forum/ForumMediaUploadField";

export function ThreadDetailClient({
  threadId,
  communitySlug,
}: {
  threadId: string;
  communitySlug: string;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);

  const { data: threadData, refetch: refetchThread } = useQuery(
    FORUM_THREAD_QUERY,
    {
      variables: { id: threadId },
    },
  );
  const { data: repliesData, refetch: refetchReplies } = useQuery(
    FORUM_REPLIES_QUERY,
    {
      variables: { thread_id: threadId },
    },
  );

  useSubscription(FORUM_REPLY_SUBSCRIPTION, {
    variables: { thread_id: threadId },
    onData: () => refetchReplies(),
  });

  const refresh = useCallback(() => {
    refetchThread();
    refetchReplies();
  }, [refetchThread, refetchReplies]);

  const thread = (
    threadData as {
      forumThread?: {
        id: string;
        title: string;
        body_md: string;
        score: number;
        user_vote?: number | null;
        reply_count: number;
        createdAt: string;
        author_id: string;
        accepted_reply_id?: string | null;
        author: { full_name: string };
        tags: Array<{ slug: string; name: string }>;
        accepted_reply?: {
          body_md: string;
          author: { full_name: string };
        } | null;
        media?: Array<{
          id: string;
          kind: string;
          url: string;
          meta_json?: string | null;
        }>;
      };
    }
  )?.forumThread;

  const replies =
    (repliesData as { forumReplies?: unknown[] })?.forumReplies ?? [];

  if (!thread) {
    return (
      <ForumPageShell>
        <p className="text-muted mb-0">Loading thread…</p>
      </ForumPageShell>
    );
  }

  const displayScore = score ?? thread.score;
  const displayVote = userVote ?? thread.user_vote ?? null;

  return (
    <ForumPageShell>
      <nav className="small mb-3">
        <Link href="/forum">Forum</Link>
        {" / "}
        <Link href={`/forum/c/${communitySlug}`}>Community</Link>
      </nav>

      <article className="offering-block p-4 mb-4">
        <div className="d-flex gap-3">
          <VoteButton
            targetType="thread"
            targetId={thread.id}
            score={displayScore}
            userVote={displayVote}
            onVoted={(s, v) => {
              setScore(s);
              setUserVote(v);
            }}
          />
          <div className="flex-grow-1">
            <h1 className="h3 mb-2">{thread.title}</h1>
            <div className="small text-muted mb-3">
              {thread.author.full_name} · {timeAgo(thread.createdAt)} ·{" "}
              {thread.reply_count} replies
            </div>
            <MarkdownRenderer content={thread.body_md} />
            <ForumMediaGallery media={thread.media ?? []} />
            <div className="d-flex flex-wrap gap-2 mt-3">
              {thread.tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/forum/tags/${t.slug}`}
                  className="badge forum-tag-badge text-decoration-none"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>

      {thread.accepted_reply ? (
        <div className="alert alert-success">
          <strong>Accepted answer</strong> by{" "}
          {thread.accepted_reply.author.full_name}
          <MarkdownRenderer
            content={thread.accepted_reply.body_md}
            className="mt-2"
          />
        </div>
      ) : null}

      <h2 className="h5 mb-3">{thread.reply_count} Replies</h2>
      <ReplyTree
        replies={replies as Parameters<typeof ReplyTree>[0]["replies"]}
        threadId={thread.id}
        threadAuthorId={thread.author_id}
        acceptedReplyId={thread.accepted_reply_id}
        onReplyAdded={refresh}
      />
      <ThreadReplyForm threadId={thread.id} onReplyAdded={refresh} />
    </ForumPageShell>
  );
}
