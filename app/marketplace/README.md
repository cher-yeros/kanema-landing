# Canma Marketplace — Documentation

Canma Marketplace is the commerce layer of the **Canma** platform (ካንማ): a trusted hub where Ethiopian photographers, videographers, and filmmakers can **buy, sell, rent, and discover** creative equipment, digital assets, and professional services. It is integrated with Canma member profiles, community membership, and the admin moderation stack.

---

## 1. Purpose & positioning

The marketplace serves the creative economy around visual storytelling:

| Module                  | What it covers                                                     |
| ----------------------- | ------------------------------------------------------------------ |
| **Physical products**   | Cameras, lenses, lighting, audio, drones, accessories              |
| **Equipment rental**    | Cinema cameras, gimbals, lights, drones — without upfront purchase |
| **Digital marketplace** | LUT packs, presets, templates, motion graphics, music, SFX         |
| **Creative services**   | Photography, videography, editing, color grading, design           |
| **Wanted listings**     | Buyers post what they need; sellers respond with offers            |
| **Auctions**            | Second-hand gear with transparent end times and bidding            |

Default currency is **ETB**. Listings are tied to **verified Canma community members** as sellers, with optional **storefronts** for professional shops and studios.

---

## 2. System architecture

The marketplace spans three repositories:

```
┌─────────────────────┐     GraphQL (HTTP + WS)     ┌─────────────────────┐
│  kanema-landing     │ ──────────────────────────► │  kanema-backend     │
│  /marketplace/*     │                             │  marketplace.*      │
│  Public browse +    │     Media upload REST       │  MySQL via Sequelize│
│  member actions     │ ──────────────────────────► │  /api/marketplace-  │
└─────────────────────┘                             │  media              │
                                                    └──────────▲──────────┘
┌─────────────────────┐                                      │
│  kanema-admin       │ ─────────────────────────────────────┘
│  /admin/marketplace │   Admin moderation, categories, reports
└─────────────────────┘
```

| Layer              | Location                                                       | Role                                                      |
| ------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| **Public UI**      | `kanema-landing/app/marketplace/`                              | Browse, listing detail, create/manage listings, inquiries |
| **Admin UI**       | `kanema-admin/app/admin/marketplace/`                          | Review listings, resolve reports, manage categories       |
| **API**            | `kanema-backend/src/schema/marketplace.schema.graphql`         | GraphQL queries, mutations, types                         |
| **Business logic** | `kanema-backend/src/resolvers/marketplace.resolver.ts`         | CRUD, inquiries, bids, reviews, moderation                |
| **Search**         | `kanema-backend/src/services/marketplaceSearch.service.ts`     | Filtering, sorting, auction expiry                        |
| **Moderation**     | `kanema-backend/src/services/marketplaceModeration.service.ts` | Approve/reject listings, resolve reports                  |

Public browse pages use **server-side GraphQL** (`lib/marketplace-public.ts`). Authenticated actions use **Apollo Client** (`lib/marketplace-graphql.ts`).

---

## 3. Access & eligibility

### Who can browse?

Anyone can browse published listings, stores, and categories without logging in.

### Who can sell, inquire, bid, or offer?

Authenticated users must be **approved Canma community members** (`requireApprovedCommunityMember`). That means:

1. A Canma account (login via `/election/login`)
2. An approved community join request (`community_join_requests` with status `APPROVED`)

Unapproved or pending members receive a forbidden error when creating listings, sending inquiries, placing bids, or submitting wanted offers.

### Verified seller badge

A seller earns the **verified seller** badge when all of the following are true:

- User account is verified (`is_verified`)
- Community join status is `APPROVED`
- At least **1 review** on the marketplace
- Average rating **≥ 4.0**

---

## 4. Listing types & fields

Six listing types are defined in the GraphQL schema:

| Type             | `listing_type` | Typical use                                            |
| ---------------- | -------------- | ------------------------------------------------------ |
| Physical product | `PRODUCT`      | Buy/sell gear                                          |
| Equipment rental | `RENTAL`       | Daily/weekly rates, deposit, availability blocks       |
| Digital asset    | `DIGITAL`      | Download URL revealed after confirmed deal             |
| Creative service | `SERVICE`      | Tiered service packages (name, price, delivery days)   |
| Wanted post      | `WANTED`       | Budget range; sellers submit offers                    |
| Auction          | `AUCTION`      | End time, starting price, min bid increment, live bids |

### Shared listing fields

- Title, description, slug (auto-generated from title)
- Price, currency, price type (`FIXED`, `STARTING`, `NEGOTIABLE`)
- Condition (`NEW`, `LIKE_NEW`, `USED`, `FOR_PARTS`)
- Location, brand, warranty, specifications (JSON)
- Media (images/videos)
- Category (hierarchical, per listing type)
- Optional association with a **store**

### Type-specific fields

| Type        | Extra data                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| **RENTAL**  | `rental_details` (daily/weekly rate, deposit, pickup, delivery); `rental_blocks` (booked/unavailable date ranges) |
| **SERVICE** | `packages[]` (name, description, price, delivery_days)                                                            |
| **WANTED**  | `budget_min`, `budget_max`                                                                                        |
| **AUCTION** | `auction_ends_at`, `current_bid_amount`, `min_bid_increment`                                                      |
| **DIGITAL** | `digital_delivery_url` (hidden until inquiry is confirmed)                                                        |

---

## 5. Listing lifecycle

```
DRAFT ──publish──► PUBLISHED
                      │
                      │ (price ≥ 500,000 ETB)
                      ▼
                 PENDING_REVIEW ──admin approve──► PUBLISHED
                      │
                      └── admin reject ──► REMOVED

PUBLISHED ──(auction ends)──► CLOSED
PUBLISHED ──(deal complete)──► SOLD / RENTED
PUBLISHED ──(report resolved)──► REMOVED
```

### Status values

| Status           | Meaning                                       |
| ---------------- | --------------------------------------------- |
| `DRAFT`          | Created but not published                     |
| `PENDING_REVIEW` | Awaiting admin approval (high-value listings) |
| `PUBLISHED`      | Live and visible in browse/search             |
| `SOLD`           | Transaction completed                         |
| `RENTED`         | Rental completed                              |
| `CLOSED`         | Auction ended                                 |
| `REMOVED`        | Rejected by admin or removed after report     |

### High-value moderation

Listings with price **≥ 500,000 ETB** (`MARKETPLACE_HIGH_VALUE_THRESHOLD`) are flagged with `requires_admin_review: true`. When the seller publishes:

- Normal listings → go straight to `PUBLISHED`
- High-value listings → go to `PENDING_REVIEW` until an admin approves via `adminApproveMarketplaceListing`

---

## 6. Core user flows

### 6.1 Create & publish a listing

1. Sign in → `/marketplace/new`
2. Choose listing type and fill the form (`MarketplaceListingForm`)
3. Upload media via `POST /api/marketplace-media`
4. Submit → `createMarketplaceListing` (creates as `DRAFT`)
5. From **My listings** (`/marketplace/mine`) → **Publish** → `publishMarketplaceListing`

### 6.2 Contact seller (inquiry flow)

Used for products, rentals, digital assets, and services.

```
Buyer                          Seller
  │                               │
  ├── createMarketplaceInquiry ──►│  (status: OPEN)
  │                               │
  │◄── replyMarketplaceInquiry ───┤  (status: SELLER_REPLIED)
  │                               │
  │◄── confirmMarketplaceInquiry ─┤  (status: CONFIRMED)
  │                               │
  └── digital_delivery_url        │  (visible only when CONFIRMED)
      revealed for DIGITAL        │
```

- Buyers cannot inquire on their own listings
- For **rentals**, buyer can include `rental_start_date` / `rental_end_date`; on confirm, a `BOOKED` rental block is created
- For **digital** listings, the download URL is only exposed on a confirmed inquiry to buyer, seller, or admin
- Either party can **close** an inquiry via `closeMarketplaceInquiry`

### 6.3 Wanted listings (offer flow)

1. Buyer posts a `WANTED` listing with budget range
2. Sellers submit offers via `createWantedOffer` (message + optional price)
3. Wanted owner views offers via `marketplaceOffersForWanted` / `myWantedOffers`

### 6.4 Auctions

1. Seller creates an `AUCTION` listing with end time and optional min bid increment
2. Bidders use `placeAuctionBid` — bid must be ≥ current bid + increment
3. Expired auctions are auto-closed to `CLOSED` when bids are placed or listings are queried
4. Seller receives a notification on each new bid

### 6.5 Reviews

- Only buyers with a **CONFIRMED** inquiry can leave a review (`createMarketplaceReview`)
- One review per buyer per listing
- Supports overall rating plus optional sub-ratings: quality, communication, delivery, accuracy
- Reviews feed into seller `rating_avg`, `review_count`, and verified seller eligibility

### 6.6 Reporting

Any authenticated member can `reportMarketplaceListing` with a reason. Admins resolve reports in the admin panel; non-dismissed resolutions remove the listing.

### 6.7 Storefronts

- Members can create one store via `upsertMarketplaceStore` (`/marketplace/stores/new`)
- Stores have slug, name, description, about/policies (markdown), logo, cover
- Other members can **follow** stores (`followMarketplaceStore` / `unfollowMarketplaceStore`)
- Listings can be linked to a store; store pages show published listings and follower count

---

## 7. Frontend routes (kanema-landing)

| Route                        | Purpose                                      | Auth                        |
| ---------------------------- | -------------------------------------------- | --------------------------- |
| `/marketplace`               | Hub — modules, popular listings, storefronts | Public                      |
| `/marketplace/products`      | Physical products browse                     | Public                      |
| `/marketplace/rentals`       | Equipment rental browse                      | Public                      |
| `/marketplace/digital`       | Digital assets browse                        | Public                      |
| `/marketplace/services`      | Creative services browse                     | Public                      |
| `/marketplace/wanted`        | Wanted posts browse                          | Public                      |
| `/marketplace/auctions`      | Auctions browse                              | Public                      |
| `/marketplace/l/[slug]`      | Listing detail + actions panel               | Public (actions need login) |
| `/marketplace/stores/[slug]` | Store profile + listings                     | Public                      |
| `/marketplace/new`           | Create listing                               | Login + approved member     |
| `/marketplace/mine`          | Manage own listings                          | Login                       |
| `/marketplace/inquiries`     | Buyer/seller message threads                 | Login                       |
| `/marketplace/stores/new`    | Create/edit store                            | Login                       |

Browse pages support query params: `q` (search), `category`, `sort` (`newest`, `popular`, `price_asc`, `price_desc`).

Protected routes redirect unauthenticated users to `/election/login?next=...`.

---

## 8. Admin panel (kanema-admin)

| Route                           | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `/admin/marketplace`            | List all listings; filter by search and status; approve/reject |
| `/admin/marketplace/[id]`       | Listing detail moderation                                      |
| `/admin/marketplace/reports`    | User-submitted listing reports                                 |
| `/admin/marketplace/categories` | CRUD marketplace categories                                    |

Admin GraphQL operations:

- `adminMarketplaceListings`, `adminMarketplaceListing`
- `adminApproveMarketplaceListing`, `adminRejectMarketplaceListing`
- `adminMarketplaceReports`, `adminResolveMarketplaceReport`
- `adminMarketplaceCategories`, `adminUpsertMarketplaceCategory`, `adminDeleteMarketplaceCategory`
- `adminMarketplaceStores`

---

## 9. GraphQL API reference (summary)

Full schema: `kanema-backend/src/schema/marketplace.schema.graphql`

### Public queries

| Query                                            | Description                    |
| ------------------------------------------------ | ------------------------------ |
| `marketplaceCategories(listing_type)`            | Category tree                  |
| `marketplaceListings(filter, sort, limit, skip)` | Browse/search (published only) |
| `marketplaceListingBySlug(slug)`                 | Single listing                 |
| `marketplaceStores(search, limit, skip)`         | Store directory                |
| `marketplaceStoreBySlug(slug)`                   | Store + listings               |
| `marketplaceListingsForSeller(seller_user_id)`   | Seller's published listings    |
| `marketplaceReviewsForSeller(seller_user_id)`    | Seller reviews                 |

### Authenticated queries (member)

| Query                                           | Description                             |
| ----------------------------------------------- | --------------------------------------- |
| `myMarketplaceListings`                         | Own listings (all statuses)             |
| `myMarketplaceStore`                            | Own store                               |
| `myMarketplaceInquiries`                        | Inquiries where user is buyer or seller |
| `marketplaceInquiry(id)`                        | Single inquiry thread                   |
| `myWantedOffers` / `myAuctionBids`              | Own offers and bids                     |
| `marketplaceOffersForWanted(wanted_listing_id)` | Offers on a wanted post                 |
| `marketplaceBidsForAuction(auction_listing_id)` | Bid history                             |

### Mutations (member)

| Mutation                                                     | Description                   |
| ------------------------------------------------------------ | ----------------------------- |
| `createMarketplaceListing`                                   | Create draft listing          |
| `updateMyMarketplaceListing`                                 | Edit own listing              |
| `publishMarketplaceListing`                                  | Publish (or queue for review) |
| `upsertMarketplaceStore`                                     | Create/update store           |
| `followMarketplaceStore` / `unfollowMarketplaceStore`        | Store follows                 |
| `createMarketplaceInquiry`                                   | Contact seller                |
| `replyMarketplaceInquiry`                                    | Thread reply                  |
| `confirmMarketplaceInquiry`                                  | Seller confirms deal          |
| `closeMarketplaceInquiry`                                    | Close thread                  |
| `createWantedOffer`                                          | Offer on wanted post          |
| `placeAuctionBid`                                            | Bid on auction                |
| `createMarketplaceReview`                                    | Post-transaction review       |
| `reportMarketplaceListing`                                   | Flag listing                  |
| `addMarketplaceRentalBlock` / `removeMarketplaceRentalBlock` | Manage rental calendar        |

### Filter & sort

**Filter** (`MarketplaceListingsFilter`):

- `listing_type`, `category_slug`, `brand`, `condition`, `location`
- `min_price`, `max_price`, `search`
- `seller_user_id`, `store_slug`

**Sort** (`MarketplaceListingSort`): `newest`, `popular`, `price_asc`, `price_desc`

---

## 10. Data model (database tables)

| Table                          | Purpose                                 |
| ------------------------------ | --------------------------------------- |
| `marketplace_listings`         | Core listing records                    |
| `marketplace_listing_media`    | Images/videos per listing               |
| `marketplace_categories`       | Hierarchical categories by listing type |
| `marketplace_stores`           | Seller storefronts                      |
| `marketplace_store_followers`  | Store follow relationships              |
| `marketplace_service_packages` | Service tier packages                   |
| `marketplace_rental_details`   | Rental pricing & logistics              |
| `marketplace_rental_blocks`    | Booked/unavailable date ranges          |
| `marketplace_inquiries`        | Buyer–seller conversations              |
| `marketplace_inquiry_messages` | Messages within an inquiry              |
| `marketplace_offers`           | Offers on wanted listings               |
| `marketplace_bids`             | Auction bid history                     |
| `marketplace_reviews`          | Post-deal seller reviews                |
| `marketplace_reports`          | User reports for moderation             |

All models live under `kanema-backend/src/models/marketplace*.model.ts`. Seed data for categories and sample listings is in `src/utils/seeders/marketplace.seed.ts`.

---

## 11. Media uploads

Listing images are uploaded via REST, not GraphQL:

- **Endpoint**: `POST {CANMA_API_BASE}/api/marketplace-media`
- **Field**: `file` (multipart form)
- **Storage**: `public/uploads/marketplace-media/` (or `MARKETPLACE_MEDIA_UPLOAD_DIR`)
- **Response**: `{ url: "..." }` — URL is passed into `createMarketplaceListing` media input

Landing helper: `marketplaceMediaUploadUrl()` in `lib/graphql-env.ts`.

---

## 12. Search & discovery

Public listings are searchable by title, description, and brand. Filters include category, brand, condition, location, and price range. Sort options:

- **newest** — by creation date
- **popular** — by view count
- **price_asc** / **price_desc** — by price

The hub page (`/marketplace`) shows **popular** listings and featured storefronts. Each module page (`/marketplace/products`, etc.) scopes results to its listing type.

---

## 13. Notifications

The backend sends notifications for marketplace events (e.g. new auction bids) via `createNotification` with types like `marketplace_bid`, linking back to `/marketplace/l/{slug}`.

---

## 14. Key files quick reference

### Landing (frontend)

| File                                                  | Role                                    |
| ----------------------------------------------------- | --------------------------------------- |
| `app/marketplace/page.tsx`                            | Marketplace hub                         |
| `lib/marketplace-public.ts`                           | Server-side public GraphQL fetchers     |
| `lib/marketplace-graphql.ts`                          | Apollo mutations/queries for auth flows |
| `components/marketplace/MarketplaceListingForm.tsx`   | Create listing form                     |
| `components/marketplace/ListingActionsPanel.tsx`      | Contact, bid, offer, report actions     |
| `components/marketplace/MarketplaceBrowseSection.tsx` | Shared browse UI per module             |

### Backend

| File                                            | Role                               |
| ----------------------------------------------- | ---------------------------------- |
| `src/schema/marketplace.schema.graphql`         | API contract                       |
| `src/resolvers/marketplace.resolver.ts`         | All resolver logic                 |
| `src/helpers/marketplaceAuth.ts`                | Ownership & verified seller checks |
| `src/helpers/marketplaceHelpers.ts`             | Slugify, high-value threshold      |
| `src/services/marketplaceSearch.service.ts`     | Search, sort, auction expiry       |
| `src/services/marketplaceModeration.service.ts` | Admin approve/reject/report        |

### Admin

| File                                        | Role                         |
| ------------------------------------------- | ---------------------------- |
| `app/admin/marketplace/page.tsx`            | Listing moderation dashboard |
| `app/admin/marketplace/categories/page.tsx` | Category management          |
| `app/admin/marketplace/reports/page.tsx`    | Report resolution            |

---

## 15. Environment & integration

The landing app connects to the Canma backend GraphQL API configured in `.env` (via `lib/graphql-env.ts`). Marketplace media uploads use the same API base URL.

Authentication reuses the **election/member auth** stack: JWT stored client-side, `ME_QUERY` for session state, and community join approval gating write operations.
