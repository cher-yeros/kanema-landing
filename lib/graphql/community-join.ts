import { gql } from "@apollo/client";

export const SUBMIT_COMMUNITY_JOIN = gql`
  mutation SubmitCommunityJoin($input: SubmitCommunityJoinInput!) {
    submitCommunityJoin(input: $input) {
      success
      message
      token
      user {
        id
        full_name
        email
        phone
        role
        is_verified
      }
    }
  }
`;

export const LOGIN_COMMUNITY_MEMBER = gql`
  mutation LoginCommunityMember($input: LoginCommunityMemberInput!) {
    loginCommunityMember(input: $input) {
      success
      message
      token
      user {
        id
        full_name
        email
        phone
        role
        is_verified
      }
    }
  }
`;

export const MY_COMMUNITY_JOIN_QUERY = gql`
  query MyCommunityJoin {
    myCommunityJoin {
      id
      status
      full_name
      phone
      email
    }
  }
`;

export const HEADER_USER_QUERY = gql`
  query HeaderUser {
    me {
      id
      full_name
    }
    myCommunityJoin {
      avatar_url
    }
  }
`;
