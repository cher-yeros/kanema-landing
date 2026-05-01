import { gql } from "@apollo/client";

export const SUBMIT_COMMUNITY_JOIN = gql`
  mutation SubmitCommunityJoin($input: SubmitCommunityJoinInput!) {
    submitCommunityJoin(input: $input) {
      success
      message
    }
  }
`;
