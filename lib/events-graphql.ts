import { gql } from "@apollo/client";

export const MY_EVENT_REGISTRATION_QUERY = gql`
  query MyEventRegistration($event_id: ID!) {
    myEventRegistration(event_id: $event_id) {
      id
      event_id
      payment_status
      fee_amount
      fee_currency
      createdAt
    }
  }
`;

export const REGISTER_FOR_EVENT_MUTATION = gql`
  mutation RegisterForEvent($input: RegisterForEventInput!) {
    registerForEvent(input: $input) {
      id
      event_id
      payment_status
      fee_amount
      fee_currency
      createdAt
    }
  }
`;
