import type { PublicCommunityMember } from "@/lib/public-graphql";

function normalizeId(id: string | null | undefined): string | null {
  const trimmed = id?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

export function sortCommunityMembersWithCurrentUserFirst(
  members: PublicCommunityMember[],
  options: {
    userId?: string | null;
    communityJoinId?: string | null;
  },
): PublicCommunityMember[] {
  const userId = normalizeId(options.userId);
  const communityJoinId = normalizeId(options.communityJoinId);
  if (!userId && !communityJoinId) return members;

  const index = members.findIndex((member) => {
    const memberUserId = normalizeId(member.user_id);
    const memberJoinId = normalizeId(member.id);
    return (
      (communityJoinId != null && memberJoinId === communityJoinId) ||
      (userId != null && memberUserId != null && memberUserId === userId)
    );
  });

  if (index <= 0) return members;

  const sorted = [...members];
  const [current] = sorted.splice(index, 1);
  sorted.unshift(current);
  return sorted;
}
