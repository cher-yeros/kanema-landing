import { gql } from "@apollo/client";

export const USER_FIELDS = gql`
  fragment UserFields on CanmaUser {
    id
    full_name
    email
    phone
    role
    is_verified
    has_voted
    admin_approved
    createdAt
    updatedAt
  }
`;

export const CANDIDATE_FIELDS = gql`
  fragment CandidateFields on Candidate {
    id
    user_id
    bio
    manifesto
    image_url
    experience
    portfolio_urls
    approved
    createdAt
    updatedAt
    user {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const ELECTION_FIELDS = gql`
  fragment ElectionFields on Election {
    id
    title
    description
    start_date
    end_date
    is_active
    createdAt
    updatedAt
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const ELECTIONS_QUERY = gql`
  query Elections($activeOnly: Boolean) {
    elections(activeOnly: $activeOnly) {
      ...ElectionFields
    }
  }
  ${ELECTION_FIELDS}
`;

export const ELECTION_QUERY = gql`
  query Election($id: ID!) {
    election(id: $id) {
      ...ElectionFields
    }
  }
  ${ELECTION_FIELDS}
`;

export const CANDIDATES_QUERY = gql`
  query CandidatesApproved {
    candidates(approvedOnly: true) {
      ...CandidateFields
    }
  }
  ${CANDIDATE_FIELDS}
`;

export const CANDIDATE_QUERY = gql`
  query Candidate($id: ID!) {
    candidate(id: $id) {
      ...CandidateFields
    }
  }
  ${CANDIDATE_FIELDS}
`;

export const MY_VOTE_QUERY = gql`
  query MyVote($election_id: ID!) {
    myVote(election_id: $election_id) {
      id
      candidate_id
      election_id
      createdAt
      candidate {
        ...CandidateFields
      }
    }
  }
  ${CANDIDATE_FIELDS}
`;

export const ELECTION_RESULTS_QUERY = gql`
  query ElectionResults($election_id: ID!) {
    electionResults(election_id: $election_id) {
      election_id
      total_votes
      updatedAt
      tallies {
        votes
        percentage
        candidate {
          ...CandidateFields
        }
      }
    }
  }
  ${CANDIDATE_FIELDS}
`;

export const ELECTION_RESULTS_SUB = gql`
  subscription ElectionResultsUpdated($election_id: ID!) {
    electionResultsUpdated(election_id: $election_id) {
      election_id
      total_votes
      updatedAt
      tallies {
        votes
        percentage
        candidate {
          ...CandidateFields
        }
      }
    }
  }
  ${CANDIDATE_FIELDS}
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const REQUEST_VERIFICATION_OTP_MUTATION = gql`
  mutation RequestVerificationOtp($input: RequestOtpInput!) {
    requestVerificationOtp(input: $input) {
      success
      message
      dev_code
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      success
      message
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const CAST_VOTE_MUTATION = gql`
  mutation CastVote($input: CastVoteInput!) {
    castVote(input: $input) {
      id
      election_id
      candidate_id
      createdAt
      candidate {
        ...CandidateFields
      }
    }
  }
  ${CANDIDATE_FIELDS}
`;
