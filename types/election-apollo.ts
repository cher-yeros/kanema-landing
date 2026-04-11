/** Minimal shapes for Apollo `useQuery` / `useMutation` until codegen is added. */

export type GqlUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  has_voted: boolean;
  admin_approved: boolean;
};

export type GqlCandidate = {
  id: string;
  bio: string | null;
  manifesto: string | null;
  image_url: string | null;
  experience: string | null;
  portfolio_urls: string | null;
  approved: boolean;
  user: GqlUser;
};

export type GqlElection = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

export type MeQuery = { me: GqlUser | null };
export type ElectionsQuery = { elections: GqlElection[] };
export type ElectionQuery = { election: GqlElection | null };
export type CandidatesQuery = { candidates: GqlCandidate[] };
export type CandidateQuery = { candidate: GqlCandidate | null };
export type MyVoteQuery = {
  myVote: {
    id: string;
    candidate_id: string;
    election_id: string;
    createdAt: string;
    candidate: GqlCandidate;
  } | null;
};
export type ElectionResultsQuery = {
  electionResults: {
    election_id: string;
    total_votes: number;
    updatedAt: string;
    tallies: {
      votes: number;
      percentage: number;
      candidate: GqlCandidate;
    }[];
  } | null;
};
export type ElectionResultsSub = {
  electionResultsUpdated: ElectionResultsQuery["electionResults"];
};
export type LoginMutation = {
  login: {
    success: boolean;
    message: string;
    token: string | null;
    user: GqlUser | null;
  };
};

export type RegisterMutation = {
  register: {
    success: boolean;
    message: string;
    user: GqlUser | null;
  };
};

export type RequestVerificationOtpMutation = {
  requestVerificationOtp: {
    success: boolean;
    message: string;
    dev_code: string | null;
  };
};

export type VerifyOtpMutation = {
  verifyOtp: {
    success: boolean;
    message: string;
    user: GqlUser | null;
  };
};

export type CastVoteMutation = {
  castVote: {
    id: string;
    election_id: string;
    candidate_id: string;
    createdAt: string;
    candidate: GqlCandidate;
  };
};
