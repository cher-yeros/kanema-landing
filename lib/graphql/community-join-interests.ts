import { gql } from "@apollo/client";

export type CommunityJoinInterestsQuery = {
  communityJoinInterests: CommunityJoinInterestRow[];
};

export const COMMUNITY_JOIN_INTERESTS_QUERY = gql`
  query CommunityJoinInterests($activeOnly: Boolean) {
    communityJoinInterests(activeOnly: $activeOnly) {
      id
      slug
      label
      display_order
      is_active
    }
  }
`;

export type CommunityJoinInterestRow = {
  id: string;
  slug: string;
  label: string;
  display_order: number;
  is_active: boolean;
};

export function mapCommunityJoinInterestOptions(
  rows: CommunityJoinInterestRow[] | undefined,
): { id: string; label: string }[] {
  return (rows ?? []).map((row) => ({
    id: row.slug,
    label: row.label,
  }));
}

export function communityJoinInterestLabelMap(
  rows: CommunityJoinInterestRow[] | undefined,
): Map<string, string> {
  return new Map((rows ?? []).map((row) => [row.slug, row.label] as const));
}
