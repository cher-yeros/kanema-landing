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
    status
    poster {
      id
      full_name
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

export const MY_POSTED_JOBS_QUERY = gql`
  query MyPostedJobs {
    myPostedJobs {
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
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
      ...ProductionJobFields
    }
  }
  ${PRODUCTION_JOB_FIELDS}
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
