# Kanema Landing — System Documentation

## Purpose
`kanema-landing` is a **Next.js (App Router)** web app that combines:

- **Marketing landing site**: Kanema brand + sections (Hero, About, Services, Team, Contact).
- **Election module**: member login/register/OTP verification, ballot, candidate profiles, and live results.
- **Jobs page**: a production job center page (currently sample/static roles).

This document is meant to be the **single source of truth** for how the app is structured and how it integrates with the backend.

---

## Tech stack
- **Framework**: Next.js 16 (App Router)
- **UI**: Bootstrap 5 + Bootstrap Icons + custom theme CSS
- **Animation/UX libs**: AOS, Swiper, PureCounter
- **API**: Apollo Client + GraphQL (HTTP) + graphql-ws (WebSocket subscriptions)
- **Language**: TypeScript

---

## Local development

### Install & run
```bash
yarn
yarn dev
```

### Scripts
- **`yarn dev`**: run dev server
- **`yarn build`**: production build
- **`yarn start`**: start production server
- **`yarn lint`**: eslint

---

## App structure (high level)
- **`app/`**: Next.js routes, layouts, and global CSS
- **`components/landing/`**: landing page sections + header/footer + client-only providers
- **`components/election/`**: election UI helpers (Apollo provider, confirmation modal, results bars, countdown)
- **`lib/`**: GraphQL documents, env helpers, and utilities
- **`types/`**: TypeScript types (e.g. `types/election-apollo.ts`)

---

## Product concepts (platform vocabulary)
This section defines core concepts used across the UI and backend, so copy, features, and database/admin design stay consistent.

### Members
**Members** are verified community accounts (creatives and teams) who can participate in protected features (such as elections) and, later, have full platform profiles.

Recommended characteristics:
- **Identity**: phone and/or email; phone is treated as a strong unique identifier in the election flows.
- **Verification**: OTP verification (phone/email). Optionally, **admin approval** may be required for certain actions (see `NEXT_PUBLIC_KANEMA_REQUIRE_ADMIN_APPROVAL`).
- **Benefits** (product copy): profile presence, discovery, opportunities, trainings/events, community networking, credibility.

### Talents
**Talents** are the discoverable creative profiles that clients browse and contact. “Talent” is a presentation of a member (or team) optimized for discovery and booking.

Typical directory capabilities (future-facing):
- **Search** by name / keyword
- **Filters**: specialty, city, availability; optional: budget range, equipment, rating
- **Talent cards**: name, specialties, location, portfolio/reel, and a primary contact action

### Testimonials
**Testimonials** are social proof from creatives, clients, and partners. They should emphasize outcomes (bookings, collaborations, growth) rather than generic praise.

Recommended testimonial fields:
- Quote, name, role/title, city
- Optional: project/client context
- Optional grouping: creatives vs clients vs partners

### Login
**Login** enables access to protected member features. In this repo, login is currently used for the election module.

Current implementation notes:
- Member login returns a token that the client stores (see “Auth token”).
- OTP verification exists as a separate flow (`/election/verify`) and is required for voting eligibility.

### Team / Leadership
**Team/Leadership** describes Kanema’s public-facing organization and governance model. It matters for trust (especially for elections) and partner engagement.

Recommended structure for content:
- **Leadership (governance)**: chair/president, vice, secretary, treasurer (or equivalent)
- **Operations**: community, partnerships, programs/training, tech
- Optional: advisors

Recommended transparency points:
- Responsibilities by role, term duration, and how elections/verification enforce legitimacy.

---

## Routing (App Router)

### Landing
- **`/`** (`app/page.tsx`): main landing page, composed from `components/landing/*`

### Election module
All election routes share `app/election/layout.tsx`:
- Adds **Apollo provider** (`ElectionApolloProvider`)
- Adds landing providers (AOS/scroll/scrollspy)
- Uses shared `SiteHeader` and `SiteFooter`
- Imports `app/election/election.css`

Routes:
- **`/election`**: ballot page (candidates list + voting window logic + cast vote)
- **`/election/login`**: member login
- **`/election/register`**: member registration (phone required, email optional)
- **`/election/verify`**: request OTP + verify OTP (phone or email)
- **`/election/results`**: live results (query + subscription)
- **`/election/candidates/[id]`**: candidate profile (manifesto/experience/portfolio)

### Jobs
- **`/jobs`**: production job center (currently sample/static roles)

---

## Layout & UI composition

### Root layout
`app/layout.tsx`:
- Sets global **metadata** (title/description)
- Loads Google Fonts via `<link>` tags
- Loads global styles through `app/globals.css`

### Global CSS
`app/globals.css` imports the theme entry CSS:
- `app/landing-theme/entry.css` (and underlying theme styles)

### Landing client behaviors
`components/landing/LandingProviders.tsx`:
- Initializes AOS
- Initializes PureCounter
- Handles scroll state (header scrolled class, scroll-top button)
- Implements nav scrollspy

The landing page uses `LandingProvidersClient` (client wrapper) so these run only on the client.

---

## Assets and image strategy

### Landing images
`lib/landing-assets.ts` defines:
- `LANDING_IMAGE_BASE = "/landing-assets/img"`
- `landingImage(path)` helper to build URLs like `/landing-assets/img/about/about-wide-2.webp`

### Next.js rewrite (remote theme assets)
`next.config.ts` rewrites:
- `/landing-assets/img/:path*` → `https://bootstrapmade.com/content/demo/Spotlight/assets/img/:path*`

This allows using same-origin paths in the UI while fetching the actual image assets remotely.

---

## Backend integration (Election GraphQL)

### Endpoints
Defined in `lib/graphql-env.ts`:

- **HTTP GraphQL**: `graphqlHttpUrl()`
  - `NEXT_PUBLIC_GRAPHQL_URL` (optional)
  - default: `http://localhost:4000/graphql`

- **WebSocket GraphQL (subscriptions)**: `graphqlWsUrl()`
  - `NEXT_PUBLIC_GRAPHQL_WS_URL` (optional)
  - otherwise derived from HTTP URL, path forced to `/subscriptions`
  - default fallback: `ws://localhost:4000/subscriptions`

### Auth token
Implemented in `components/election/ElectionApolloProvider.tsx`:
- Token is stored in `localStorage` under key **`kanema_token`**
- HTTP requests send header `Authorization: Bearer <token>`
- WS subscriptions send connection params `{ Authorization: "Bearer <token>" }`

### Environment variables used by UI
- **`NEXT_PUBLIC_GRAPHQL_URL`**: HTTP GraphQL endpoint (optional)
- **`NEXT_PUBLIC_GRAPHQL_WS_URL`**: WS subscriptions endpoint (optional)
- **`NEXT_PUBLIC_KANEMA_ELECTION_ID`**: fixed election ID to always use (optional)
- **`NEXT_PUBLIC_KANEMA_REQUIRE_ADMIN_APPROVAL`**:
  - if `"true"`, UI requires both `me.is_verified` and `me.admin_approved` to enable voting

### Election selection behavior
`defaultElectionId()` returns `NEXT_PUBLIC_KANEMA_ELECTION_ID` if set.
Otherwise, pages attempt to select:
- active election from `elections(activeOnly: true)` first
- or fall back to the first election from `elections(activeOnly: false)`

### GraphQL operations (UI contract)
Defined in `lib/election-graphql.ts`.

Fragments:
- `UserFields` on `KanemaUser`
- `CandidateFields` on `Candidate` (includes nested `user { ...UserFields }`)
- `ElectionFields` on `Election`

Queries:
- `Me`
- `Elections($activeOnly: Boolean)`
- `Election($id: ID!)`
- `CandidatesApproved` (requests `candidates(approvedOnly: true)`)
- `Candidate($id: ID!)`
- `MyVote($election_id: ID!)`
- `ElectionResults($election_id: ID!)`

Subscription:
- `ElectionResultsUpdated($election_id: ID!)`

Mutations:
- `Login($input: LoginInput!)`
- `Register($input: RegisterInput!)`
- `RequestVerificationOtp($input: RequestOtpInput!)`
- `VerifyOtp($input: VerifyOtpInput!)`
- `CastVote($input: CastVoteInput!)`

---

## Election UX rules (as implemented)

### Voting window
On `/election`, voting is allowed only if:
- election is active (`is_active` truthy), and
- current time is between `start_date` and `end_date`

### Member eligibility checks
Voting UI requires:
- user is logged in (`me` exists)
- user is verified (`me.is_verified`)
- and if `NEXT_PUBLIC_KANEMA_REQUIRE_ADMIN_APPROVAL === "true"`, user must also be `me.admin_approved`

### Results refresh
On `/election/results`:
- Initial results are loaded via a query (polls every 30s)
- Live updates come via the `ElectionResultsUpdated` subscription

---

## Common change points

### Add a new landing section
- Create section component in `components/landing/`
- Export from `components/landing/index.ts`
- Add it to `app/page.tsx`
- Add a nav anchor in `components/landing/SiteHeader.tsx` if needed

### Add a new election page
- Create `app/election/<route>/page.tsx`
- Add GraphQL documents in `lib/election-graphql.ts` when needed
- Ensure it renders under `app/election/layout.tsx` so Apollo + shared header/footer apply

### Change API endpoints
- Update `.env.local` values:
  - `NEXT_PUBLIC_GRAPHQL_URL`
  - `NEXT_PUBLIC_GRAPHQL_WS_URL`

---

## Deployment notes
- The app is a standard Next.js deployment.
- Ensure the `NEXT_PUBLIC_*` env vars are set in the deployment environment to point at the correct backend.
- If you keep the asset rewrite, your deployment must allow outbound access to BootstrapMade assets (or replace the rewrite with your own hosted assets).

