import { gql } from "@apollo/client";

import { USER_FIELDS } from "@/lib/election-graphql";

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    me {
      ...UserFields
    }
    myCommunityJoin {
      id
      status
      full_name
      email
      phone
      city
      role
      interests
      portfolio_url
      message
      avatar_url
      is_featured
      createdAt
      updatedAt
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_MY_IDENTITY_MUTATION = gql`
  mutation UpdateMyIdentity($input: UpdateMyIdentityInput!) {
    updateMyIdentity(input: $input) {
      me {
        id
        full_name
        phone
      }
      communityJoin {
        id
        interests
        city
        role
        portfolio_url
        message
        avatar_url
        updatedAt
      }
    }
  }
`;
