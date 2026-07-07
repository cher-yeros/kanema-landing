"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
  CREATE_REPLY_MUTATION,
  ACCEPT_REPLY_MUTATION,
} from "@/lib/forum-graphql";
import { VoteButton } from "./VoteButton";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { timeAgo, formatReputationTier, tierBadgeClass } from "./forum-utils";
import { useForumToast } from "@/components/forum/ForumToast";
export type ReplyNode = {
  id: string;
  thread_id: string;
  parent_reply_id: string | null;
  body_md: string;
  depth: number;
  score: number;
  user_vote?: number | null;
  createdAt: string;
  author: { id: string; full_name: string };
  author_profile?: {
    avatar_url?: string | null;
    reputation_tier?: string;
  } | null;
};

type ReplyTreeProps = {
  replies: ReplyNode[];
  threadId: string;
  threadAuthorId: string;
  acceptedReplyId?: string | null;
  onReplyAdded?: () => void;
};

function ReplyItem({
  reply,
  allReplies,
  threadId,
  threadAuthorId,
  acceptedReplyId,
  onReplyAdded,
}: {
  reply: ReplyNode;
  allReplies: ReplyNode[];
  threadId: string;
  threadAuthorId: string;
  acceptedReplyId?: string | null;
  onReplyAdded?: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [body, setBody] = useState("");
  const [score, setScore] = useState(reply.score);
  const [userVote, setUserVote] = useState(reply.user_vote);
  const [createReply, { loading }] = useMutation(CREATE_REPLY_MUTATION);
  const [acceptReply, { loading: accepting }] = useMutation(
    ACCEPT_REPLY_MUTATION,
  );
  const { showApolloError } = useForumToast();

  const children = allReplies.filter((r) => r.parent_reply_id === reply.id);

  async function submitReply() {
    if (!body.trim()) return;
    try {
      await createReply({
        variables: {
          input: {
            thread_id: threadId,
            parent_reply_id: reply.id,
            body_md: body,
          },
        },
      });
      setBody("");
      setShowReply(false);
      onReplyAdded?.();
    } catch (err) {
      showApolloError(err, "Could not post reply.");
    }
  }

  async function accept() {
    try {
      await acceptReply({
        variables: { thread_id: threadId, reply_id: reply.id },
      });
      onReplyAdded?.();
    } catch (err) {
      showApolloError(err, "Could not accept answer.");
    }
  }
  const isAccepted = acceptedReplyId === reply.id;

  return (
    <div className="mb-3" style={{ marginLeft: Math.min(reply.depth, 4) * 16 }}>
      <div
        className={`d-flex gap-2 ${isAccepted ? "border border-success rounded p-2 bg-success bg-opacity-10" : ""}`}
      >
        <VoteButton
          targetType="reply"
          targetId={reply.id}
          score={score}
          userVote={userVote}
          onVoted={(s, v) => {
            setScore(s);
            setUserVote(v);
          }}
        />
        <div className="flex-grow-1">
          <div className="d-flex flex-wrap gap-2 align-items-center mb-1 small">
            <strong>{reply.author.full_name}</strong>
            {reply.author_profile?.reputation_tier ? (
              <span
                className={`badge ${tierBadgeClass(reply.author_profile.reputation_tier)}`}
              >
                {formatReputationTier(reply.author_profile.reputation_tier)}
              </span>
            ) : null}
            <span className="text-muted">{timeAgo(reply.createdAt)}</span>
            {isAccepted ? (
              <span className="badge bg-success">
                <i className="bi bi-check-circle me-1" />
                Accepted Answer
              </span>
            ) : null}
          </div>
          <MarkdownRenderer content={reply.body_md} className="mb-2" />
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={() => setShowReply(!showReply)}
            >
              Reply
            </button>
            {threadAuthorId !== reply.author.id && !isAccepted ? (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-success"
                disabled={accepting}
                onClick={accept}
              >
                Accept answer
              </button>
            ) : null}
          </div>
          {showReply ? (
            <div className="form-panel form-panel--compact mt-2">
              <form
                className="php-email-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitReply();
                }}
              >
                <label className="form-label" htmlFor={`reply-${reply.id}`}>
                  Your reply
                </label>
                <textarea
                  id={`reply-${reply.id}`}
                  className="form-control mb-3"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a reply…"
                />
                <button
                  type="submit"
                  className="btn btn-accent btn-sm"
                  disabled={loading}
                >
                  <i className="bi bi-send-fill" />
                  Post reply
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
      {children.map((child) => (
        <ReplyItem
          key={child.id}
          reply={child}
          allReplies={allReplies}
          threadId={threadId}
          threadAuthorId={threadAuthorId}
          acceptedReplyId={acceptedReplyId}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  );
}

export function ReplyTree({
  replies,
  threadId,
  threadAuthorId,
  acceptedReplyId,
  onReplyAdded,
}: ReplyTreeProps) {
  const roots = replies.filter((r) => !r.parent_reply_id);
  return (
    <div>
      {roots.map((r) => (
        <ReplyItem
          key={r.id}
          reply={r}
          allReplies={replies}
          threadId={threadId}
          threadAuthorId={threadAuthorId}
          acceptedReplyId={acceptedReplyId}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  );
}

export function ThreadReplyForm({
  threadId,
  onReplyAdded,
}: {
  threadId: string;
  onReplyAdded?: () => void;
}) {
  const [body, setBody] = useState("");
  const [createReply, { loading }] = useMutation(CREATE_REPLY_MUTATION);
  const { showApolloError } = useForumToast();

  async function submit() {
    if (!body.trim()) return;
    try {
      await createReply({
        variables: { input: { thread_id: threadId, body_md: body } },
      });
      setBody("");
      onReplyAdded?.();
    } catch (err) {
      showApolloError(err, "Could not post reply.");
    }
  }
  return (
    <div className="form-panel mt-4">
      <div className="form-intro">
        <i className="bi bi-reply" />
        <h3>Add a reply</h3>
        <p>Markdown is supported.</p>
      </div>
      <form
        className="php-email-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="form-label" htmlFor="thread-reply-body">
          Your reply
        </label>
        <textarea
          id="thread-reply-body"
          className="form-control mb-3"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts…"
        />
        <button type="submit" className="dispatch-btn" disabled={loading}>
          <i className="bi bi-arrow-right-circle-fill" />
          <span>{loading ? "Posting…" : "Post reply"}</span>
        </button>
      </form>
    </div>
  );
}
