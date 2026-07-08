import { gql } from "@apollo/client";

export const MY_MARKETPLACE_LISTINGS_QUERY = gql`
  query MyMarketplaceListings {
    myMarketplaceListings {
      id
      slug
      title
      listing_type
      status
      price
      currency
      published_at
      cover_url
    }
  }
`;

export const MY_MARKETPLACE_STORE_QUERY = gql`
  query MyMarketplaceStore {
    myMarketplaceStore {
      id
      slug
      name
    }
  }
`;

export const MY_MARKETPLACE_INQUIRIES_QUERY = gql`
  query MyMarketplaceInquiries {
    myMarketplaceInquiries {
      id
      subject
      status
      createdAt
      listing {
        id
        slug
        title
        cover_url
        seller_user_id
      }
      buyer {
        id
        full_name
      }
      messages {
        id
        body
        sender_user_id
        createdAt
        sender {
          full_name
        }
      }
      digital_delivery_url
    }
  }
`;

export const MARKETPLACE_INQUIRY_QUERY = gql`
  query MarketplaceInquiry($id: ID!) {
    marketplaceInquiry(id: $id) {
      id
      subject
      status
      rental_start_date
      rental_end_date
      digital_delivery_url
      listing {
        id
        slug
        title
        seller_user_id
        listing_type
      }
      buyer {
        id
        full_name
      }
      messages {
        id
        body
        sender_user_id
        createdAt
        sender {
          full_name
        }
      }
    }
  }
`;

export const CREATE_MARKETPLACE_LISTING_MUTATION = gql`
  mutation CreateMarketplaceListing($input: CreateMarketplaceListingInput!) {
    createMarketplaceListing(input: $input) {
      id
      slug
    }
  }
`;

export const UPDATE_MARKETPLACE_LISTING_MUTATION = gql`
  mutation UpdateMyMarketplaceListing(
    $input: UpdateMyMarketplaceListingInput!
  ) {
    updateMyMarketplaceListing(input: $input) {
      id
      slug
    }
  }
`;

export const PUBLISH_MARKETPLACE_LISTING_MUTATION = gql`
  mutation PublishMarketplaceListing($id: ID!) {
    publishMarketplaceListing(id: $id) {
      id
      status
    }
  }
`;

export const UPSERT_MARKETPLACE_STORE_MUTATION = gql`
  mutation UpsertMarketplaceStore($input: UpsertMarketplaceStoreInput!) {
    upsertMarketplaceStore(input: $input) {
      id
      slug
      name
    }
  }
`;

export const CREATE_MARKETPLACE_INQUIRY_MUTATION = gql`
  mutation CreateMarketplaceInquiry($input: CreateMarketplaceInquiryInput!) {
    createMarketplaceInquiry(input: $input) {
      id
    }
  }
`;

export const REPLY_MARKETPLACE_INQUIRY_MUTATION = gql`
  mutation ReplyMarketplaceInquiry($input: ReplyMarketplaceInquiryInput!) {
    replyMarketplaceInquiry(input: $input) {
      id
      status
    }
  }
`;

export const CONFIRM_MARKETPLACE_INQUIRY_MUTATION = gql`
  mutation ConfirmMarketplaceInquiry($inquiry_id: ID!) {
    confirmMarketplaceInquiry(inquiry_id: $inquiry_id) {
      id
      status
      digital_delivery_url
    }
  }
`;

export const CREATE_WANTED_OFFER_MUTATION = gql`
  mutation CreateWantedOffer($input: CreateWantedOfferInput!) {
    createWantedOffer(input: $input) {
      id
    }
  }
`;

export const PLACE_AUCTION_BID_MUTATION = gql`
  mutation PlaceAuctionBid($input: PlaceAuctionBidInput!) {
    placeAuctionBid(input: $input) {
      id
      amount
    }
  }
`;

export const CREATE_MARKETPLACE_REVIEW_MUTATION = gql`
  mutation CreateMarketplaceReview($input: CreateMarketplaceReviewInput!) {
    createMarketplaceReview(input: $input) {
      id
    }
  }
`;

export const REPORT_MARKETPLACE_LISTING_MUTATION = gql`
  mutation ReportMarketplaceListing($input: ReportMarketplaceListingInput!) {
    reportMarketplaceListing(input: $input) {
      id
    }
  }
`;

export const ADD_RENTAL_BLOCK_MUTATION = gql`
  mutation AddMarketplaceRentalBlock(
    $listing_id: ID!
    $input: MarketplaceRentalBlockInput!
  ) {
    addMarketplaceRentalBlock(listing_id: $listing_id, input: $input) {
      id
      start_date
      end_date
      status
    }
  }
`;

export const MARKETPLACE_OFFERS_QUERY = gql`
  query MarketplaceOffersForWanted($wanted_listing_id: ID!) {
    marketplaceOffersForWanted(wanted_listing_id: $wanted_listing_id) {
      id
      message
      offered_price
      status
      createdAt
      seller {
        full_name
        is_verified_seller
        rating_avg
      }
    }
  }
`;

export const MARKETPLACE_BIDS_QUERY = gql`
  query MarketplaceBidsForAuction($auction_listing_id: ID!) {
    marketplaceBidsForAuction(auction_listing_id: $auction_listing_id) {
      id
      amount
      createdAt
      bidder {
        full_name
      }
    }
  }
`;

export const MARKETPLACE_REVIEWS_FOR_SELLER_QUERY = gql`
  query MarketplaceReviewsForSeller($seller_user_id: ID!) {
    marketplaceReviewsForSeller(seller_user_id: $seller_user_id) {
      id
      rating
      body
      createdAt
      reviewer {
        full_name
      }
    }
  }
`;

export const FOLLOW_STORE_MUTATION = gql`
  mutation FollowMarketplaceStore($store_id: ID!) {
    followMarketplaceStore(store_id: $store_id) {
      id
      follower_count
    }
  }
`;
