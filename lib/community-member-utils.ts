import { communityRoleLabel } from "@/lib/community-member-labels";
import type { PublicCommunityMember } from "@/lib/public-graphql";

export function filterCommunityMembers(
  members: PublicCommunityMember[],
  search: string,
): PublicCommunityMember[] {
  const query = search.trim().toLowerCase();
  if (!query) return members;

  return members.filter((member) => {
    const haystack = [
      member.full_name,
      member.city,
      communityRoleLabel(member.role),
      member.message,
      ...(member.interests ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
