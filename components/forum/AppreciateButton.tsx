"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { selectAuthToken } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";
import { useForumToast } from "@/components/forum/ForumToast";

const HAS_APPRECIATED = gql`
  query HasAppreciated(
    $target_type: StandingAppreciationTargetType!
    $target_id: ID!
  ) {
    hasAppreciated(target_type: $target_type, target_id: $target_id)
  }
`;

const APPRECIATE = gql`
  mutation AppreciateStanding(
    $target_type: StandingAppreciationTargetType!
    $target_id: ID!
  ) {
    appreciateStanding(target_type: $target_type, target_id: $target_id) {
      id
    }
  }
`;

export function AppreciateButton({
  targetType,
  targetId,
}: {
  targetType: "thread" | "reply" | "listing" | "job_application";
  targetId: string;
}) {
  const token = useAppSelector(selectAuthToken);
  const { showApolloError } = useForumToast();
  const { data, refetch } = useQuery(HAS_APPRECIATED, {
    variables: { target_type: targetType, target_id: targetId },
    skip: !token,
  });
  const [appreciate, { loading }] = useMutation(APPRECIATE);

  if (!token) return null;

  const done = Boolean(
    (data as { hasAppreciated?: boolean } | undefined)?.hasAppreciated,
  );

  return (
    <button
      type="button"
      className="btn btn-link btn-sm p-0"
      disabled={done || loading}
      onClick={async () => {
        try {
          await appreciate({
            variables: { target_type: targetType, target_id: targetId },
          });
          await refetch();
        } catch (err) {
          showApolloError(err, "Could not send appreciation.");
        }
      }}
    >
      {done ? "Appreciated" : "Appreciate"}
    </button>
  );
}
