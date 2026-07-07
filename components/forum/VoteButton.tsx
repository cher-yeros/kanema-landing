"use client";

import { useMutation } from "@apollo/client/react";
import { VOTE_THREAD_MUTATION, VOTE_REPLY_MUTATION } from "@/lib/forum-graphql";
import { useForumToast } from "@/components/forum/ForumToast";
type VoteButtonProps = {
  targetType: "thread" | "reply";
  targetId: string;
  score: number;
  userVote?: number | null;
  onVoted?: (score: number, userVote: number | null) => void;
};

export function VoteButton({
  targetType,
  targetId,
  score,
  userVote,
  onVoted,
}: VoteButtonProps) {
  const [voteThread, { loading: loadingThread }] =
    useMutation(VOTE_THREAD_MUTATION);
  const [voteReply, { loading: loadingReply }] =
    useMutation(VOTE_REPLY_MUTATION);
  const loading = loadingThread || loadingReply;
  const { showApolloError } = useForumToast();

  async function cast(value: 1 | -1) {    const mutation = targetType === "thread" ? voteThread : voteReply;
    const field =
      targetType === "thread" ? "voteForumContent" : "voteForumReply";
    try {
      const { data } = await mutation({
        variables: {
          input: { target_type: targetType, target_id: targetId, value },
        },
      });
      const result = data as Record<
        string,
        { score: number; user_vote: number | null }
      >;
      const updated = result[field];
      onVoted?.(updated.score, updated.user_vote);
    } catch (e) {
      showApolloError(e, "Could not register your vote.");
    }
  }
  return (
    <div className="vote-stack d-flex flex-column align-items-center gap-1">
      <button
        type="button"
        className={`btn btn-sm p-0 border-0 ${userVote === 1 ? "text-success" : "text-muted"}`}
        disabled={loading}
        onClick={() => cast(1)}
        aria-label="Upvote"
      >
        <i className="bi bi-caret-up-fill fs-5" />
      </button>
      <span className="fw-bold small">{score}</span>
      <button
        type="button"
        className={`btn btn-sm p-0 border-0 ${userVote === -1 ? "text-danger" : "text-muted"}`}
        disabled={loading}
        onClick={() => cast(-1)}
        aria-label="Downvote"
      >
        <i className="bi bi-caret-down-fill fs-5" />
      </button>
    </div>
  );
}
