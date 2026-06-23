import { gql } from "@apollo/client";

export const PAYMENT_SETTINGS_QUERY = gql`
  query PaymentSettings {
    paymentSettings {
      chapaEnabled
    }
  }
`;

export const MY_EVENT_REGISTRATION_QUERY = gql`
  query MyEventRegistration($event_id: ID!) {
    myEventRegistration(event_id: $event_id) {
      id
      event_id
      ticket_code
      payment_status
      fee_amount
      fee_currency
      chapa_tx_ref
      createdAt
    }
  }
`;

export const MY_EVENT_TICKET_QUERY = gql`
  query MyEventTicket($event_id: ID!) {
    me {
      id
      full_name
      email
      phone
    }
    myEventRegistration(event_id: $event_id) {
      id
      ticket_code
      payment_status
      fee_amount
      fee_currency
      chapa_tx_ref
      note
      createdAt
      event {
        id
        slug
        title
        short_description
        location
        modality
        cover_url
        start_date
        end_date
        is_free
        price
        currency
      }
    }
  }
`;

export const MY_EVENT_REGISTRATION_BY_TX_REF_QUERY = gql`
  query MyEventRegistrationByTxRef($tx_ref: String!) {
    myEventRegistrationByTxRef(tx_ref: $tx_ref) {
      id
      ticket_code
      payment_status
      chapa_tx_ref
      event {
        id
        slug
        title
      }
    }
  }
`;

export const REGISTER_FOR_EVENT_MUTATION = gql`
  mutation RegisterForEvent($input: RegisterForEventInput!) {
    registerForEvent(input: $input) {
      status
      message
      checkout_url
      tx_ref
      registration {
        id
        event_id
        payment_status
        fee_amount
        fee_currency
        ticket_code
        createdAt
      }
    }
  }
`;

export const INITIATE_EVENT_PAYMENT_MUTATION = gql`
  mutation InitiateEventPayment($event_id: ID!) {
    initiateEventPayment(event_id: $event_id) {
      status
      message
      checkout_url
      tx_ref
    }
  }
`;
