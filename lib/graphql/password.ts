import { gql } from "@apollo/client";

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
      message
      dev_code
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
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

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
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
