import { gql } from "@apollo/client";

export const PRODUCTION_JOB_FIELDS = gql`
  fragment ProductionJobFields on ProductionJob {
    id
    employer_user_id
    title
    description
    modality
    location
    role_tag
    skills
    budget_type
    budget_min
    budget_max
    budget_currency
    status
    posting_fee_amount
    posting_fee_currency
    posting_payment_status
    chapa_tx_ref
    boost_ids
    poster {
      id
      full_name
      is_verified
    }
    application_count
    createdAt
    updatedAt
  }
`;

export const PRODUCTION_JOBS_QUERY = gql`
  query ProductionJobsClient($openOnly: Boolean) {
    productionJobs(openOnly: $openOnly) {
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const PRODUCTION_JOB_QUERY = gql`
  query ProductionJobClient($id: ID!) {
    productionJob(id: $id) {
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const JOB_POSTING_QUOTA_QUERY = gql`
  query JobPostingQuota {
    jobPostingQuota {
      free_posts_used_this_month
      free_posts_limit
      next_post_fee_amount
      next_post_fee_currency
      active_subscription_plan
      subscription_jobs_used_this_month
      subscription_jobs_limit
      subscription_expires_at
      subscription_quota_exceeded
    }
  }
`;

export const MY_EMPLOYER_JOB_PAYMENT_BY_TX_REF_QUERY = gql`
  query MyEmployerJobPaymentByTxRef($tx_ref: String!) {
    myEmployerJobPaymentByTxRef(tx_ref: $tx_ref) {
      id
      product_type
      product_id
      billing_period
      payment_status
      product_label
      amount
      currency
    }
  }
`;

export const INITIATE_EMPLOYER_JOB_PAYMENT_MUTATION = gql`
  mutation InitiateEmployerJobPayment(
    $input: InitiateEmployerJobPaymentInput!
  ) {
    initiateEmployerJobPayment(input: $input) {
      status
      message
      checkout_url
      tx_ref
    }
  }
`;

export const MY_POSTED_JOBS_QUERY = gql`
  query MyPostedJobs {
    myPostedJobs {
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const MY_PRODUCTION_JOB_BY_TX_REF_QUERY = gql`
  query MyProductionJobByTxRef($tx_ref: String!) {
    myProductionJobByTxRef(tx_ref: $tx_ref) {
      id
      title
      posting_payment_status
      chapa_tx_ref
    }
  }
`;

export const MY_JOB_APPLICATIONS_QUERY = gql`
  query MyJobApplications {
    myJobApplications {
      id
      job_id
      cover_message
      portfolio_links
      createdAt
      job {
        ...ProductionJobFields
      }
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const JOB_APPLICANTS_QUERY = gql`
  query JobApplicants($job_id: ID!) {
    jobApplicants(job_id: $job_id) {
      id
      job_id
      applicant_user_id
      cover_message
      portfolio_links
      createdAt
      applicant {
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

export const CREATE_PRODUCTION_JOB_MUTATION = gql`
  mutation CreateProductionJob($input: CreateProductionJobInput!) {
    createProductionJob(input: $input) {
      status
      message
      checkout_url
      tx_ref
      job {
        ...ProductionJobFields
      }
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const INITIATE_JOB_POSTING_PAYMENT_MUTATION = gql`
  mutation InitiateJobPostingPayment($job_id: ID!, $boost_ids: [String!]) {
    initiateJobPostingPayment(job_id: $job_id, boost_ids: $boost_ids) {
      status
      message
      checkout_url
      tx_ref
    }
  }
`;

export const UPDATE_MY_PRODUCTION_JOB_MUTATION = gql`
  mutation UpdateMyProductionJob($input: UpdateMyProductionJobInput!) {
    updateMyProductionJob(input: $input) {
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
`;

export const APPLY_TO_PRODUCTION_JOB_MUTATION = gql`
  mutation ApplyToProductionJob($input: ApplyToProductionJobInput!) {
    applyToProductionJob(input: $input) {
      id
      job_id
      createdAt
    }
  }
`;

export type ChapaCheckoutResponse = {
  status?: string;
  checkout_url?: string | null;
  message?: string;
};

export function redirectToChapaCheckout(
  data: ChapaCheckoutResponse | undefined,
): boolean {
  const url = data?.checkout_url?.trim();
  if (url) {
    window.location.assign(url);
    return true;
  }
  return false;
}
