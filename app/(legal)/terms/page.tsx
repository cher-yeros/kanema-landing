import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR } from "@/lib/legal-meta";
import { absoluteSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Use — Canma",
  description:
    "Terms governing use of the Canma website, mobile apps, and related services.",
  alternates: { canonical: absoluteSiteUrl("/terms") },
};

export default function TermsOfUsePage() {
  return (
    <LegalPageShell
      currentPath="/terms"
      title="Terms of Use"
      intro={`These Terms of Use (“Terms”) govern your access to and use of ${LEGAL_OPERATOR.entity}’s website, mobile applications, and related services (the “Services”). By creating an account or using Canma, you agree to these Terms.`}
      lastUpdated={LEGAL_EFFECTIVE_DATE}
    >
      <div className="content-section">
        <h2>1. Agreement</h2>
        <p>
          These Terms form a binding agreement between you and{" "}
          {LEGAL_OPERATOR.entity} (“Canma”, “we”, “us”), based in{" "}
          {LEGAL_OPERATOR.location}. If you do not agree, do not use the
          Services.
        </p>
        <p>
          Additional policies form part of these Terms, including our{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/community-guidelines">Community Guidelines</Link>.
        </p>
      </div>

      <div className="content-section">
        <h2>2. Eligibility</h2>
        <ul>
          <li>
            You must be at least 13 years old (or the minimum legal age in your
            jurisdiction) to use the Services.
          </li>
          <li>
            If you use Canma on behalf of an organization, you confirm you have
            authority to bind that organization.
          </li>
          <li>
            You must provide accurate registration information and keep it
            updated.
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>3. Accounts and security</h2>
        <ul>
          <li>
            You are responsible for activity under your account and for
            safeguarding your password and devices.
          </li>
          <li>
            Notify us promptly at{" "}
            <a href={`mailto:${LEGAL_OPERATOR.supportEmail}`}>
              {LEGAL_OPERATOR.supportEmail}
            </a>{" "}
            if you suspect unauthorized access.
          </li>
          <li>
            We may suspend or terminate accounts that violate these Terms,
            create risk, or appear compromised.
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>4. The Services</h2>
        <p>
          Canma provides tools for Ethiopian visual creatives and clients, which
          may include:
        </p>
        <ul>
          <li>Community profiles and portfolio showcase</li>
          <li>Discussion forums and collaborative wiki content</li>
          <li>Marketplace listings (products, services, rentals, and more)</li>
          <li>Creative job listings and applications</li>
          <li>Events, tickets, and learning content</li>
          <li>Messaging and related community features</li>
        </ul>
        <p>
          Features may change, be added, or be discontinued. We do not guarantee
          uninterrupted or error-free operation.
        </p>
      </div>

      <div className="content-section">
        <h2>5. User content</h2>
        <ul>
          <li>
            You retain ownership of content you submit (profiles, posts,
            listings, media, messages, and similar “User Content”).
          </li>
          <li>
            You grant Canma a worldwide, non-exclusive, royalty-free license to
            host, store, display, reproduce, and distribute your User Content as
            needed to operate and promote the Services.
          </li>
          <li>
            You represent that you have the rights to submit User Content and
            that it does not infringe others’ rights or violate law.
          </li>
          <li>
            We may remove or restrict User Content that violates these Terms or
            our Community Guidelines, or that we reasonably believe creates
            legal or safety risk.
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>6. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Post illegal, fraudulent, harassing, hateful, sexually exploitative,
            or otherwise prohibited content
          </li>
          <li>
            Impersonate others, misrepresent affiliations, or create fake
            accounts
          </li>
          <li>
            Scrape, spam, reverse engineer, or interfere with the Services or
            other users
          </li>
          <li>
            Upload malware or attempt unauthorized access to systems or data
          </li>
          <li>
            Use Canma to facilitate unlawful transactions or money laundering
          </li>
          <li>Circumvent fees, security controls, or moderation systems</li>
        </ul>
        <p>
          See also our{" "}
          <Link href="/community-guidelines">Community Guidelines</Link>.
        </p>
      </div>

      <div className="content-section">
        <h2>7. Marketplace, jobs, and third-party dealings</h2>
        <p>
          Canma may connect creatives, sellers, buyers, employers, and event
          organizers. Unless we expressly state otherwise in writing:
        </p>
        <ul>
          <li>
            Transactions, work arrangements, and communications between users
            are primarily between those parties
          </li>
          <li>
            Canma is not a party to user-to-user contracts and does not
            guarantee quality, safety, legality, or payment performance of third
            parties
          </li>
          <li>
            You should perform your own diligence before hiring, buying,
            selling, or collaborating
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>8. Payments and fees</h2>
        <ul>
          <li>
            Some features may require payment (for example event tickets, job
            posting fees, or marketplace-related charges).
          </li>
          <li>
            Payments are processed by third-party providers (currently Chapa).
            Their terms and privacy practices also apply to payment processing.
          </li>
          <li>
            Fees, taxes, and refund eligibility (if any) will be described at
            the point of purchase or in feature-specific notices.
          </li>
          <li>
            Unless required by law or expressly stated, paid digital fees are
            generally non-refundable once the related feature is activated.
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>9. Intellectual property</h2>
        <p>
          The Canma name, logos, design, software, and original platform content
          (excluding User Content) are owned by Canma or its licensors and are
          protected by intellectual property laws. You may not copy, modify, or
          distribute our branding or platform materials without prior written
          permission.
        </p>
      </div>

      <div className="content-section">
        <h2>10. App Store and Google Play terms</h2>
        <p>
          If you download Canma from Apple App Store or Google Play, you also
          agree to the applicable store’s terms. Apple and Google are not
          responsible for support, maintenance, or claims related to the Canma
          app, except as required by their store rules. In case of conflict
          between these Terms and a store’s mandatory terms for end users, the
          store’s mandatory terms control for that conflict.
        </p>
      </div>

      <div className="content-section">
        <h2>11. Disclaimers</h2>
        <p>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, CANMA DISCLAIMS WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. We do not warrant that the Services will meet your
          expectations or be free of errors, interruptions, or harmful
          components.
        </p>
      </div>

      <div className="content-section">
        <h2>12. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, CANMA AND ITS TEAM WILL NOT BE
          LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR FOR LOST PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE
          OF THE SERVICES. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE
          SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO
          CANMA FOR THE FEATURE GIVING RISE TO THE CLAIM IN THE 12 MONTHS BEFORE
          THE CLAIM, OR (B) USD 50 (OR LOCAL EQUIVALENT).
        </p>
        <p>
          Some jurisdictions do not allow certain limitations; in those cases,
          the limitation applies only to the fullest extent allowed.
        </p>
      </div>

      <div className="content-section">
        <h2>13. Indemnity</h2>
        <p>
          You agree to defend and indemnify Canma against claims, damages, and
          expenses arising from your User Content, your use of the Services, or
          your violation of these Terms or applicable law, to the extent
          permitted by law.
        </p>
      </div>

      <div className="content-section">
        <h2>14. Suspension and termination</h2>
        <p>
          You may stop using Canma at any time. You may request account deletion
          via the process described on our{" "}
          <Link href="/account-deletion">Account Deletion</Link> page. We may
          suspend or terminate access if you violate these Terms, create risk,
          or if we discontinue the Services. Provisions that by nature should
          survive (including intellectual property, disclaimers, and liability
          limits) will survive termination.
        </p>
      </div>

      <div className="content-section">
        <h2>15. Changes</h2>
        <p>
          We may update these Terms. The “Last updated” date will change when we
          do. If changes are material, we may provide additional notice.
          Continued use after the effective date constitutes acceptance of the
          updated Terms.
        </p>
      </div>

      <div className="content-section">
        <h2>16. Governing law</h2>
        <p>
          These Terms are governed by the laws of Ethiopia, without regard to
          conflict-of-law principles, except where mandatory consumer protection
          laws in your place of residence require otherwise.
        </p>
      </div>

      <div className="privacy-contact">
        <h2>17. Contact</h2>
        <div className="contact-details">
          <p>
            <strong>{LEGAL_OPERATOR.entity}</strong>
            <br />
            {LEGAL_OPERATOR.location}
            <br />
            Email:{" "}
            <a href={`mailto:${LEGAL_OPERATOR.supportEmail}`}>
              {LEGAL_OPERATOR.supportEmail}
            </a>
            <br />
            Phone:{" "}
            <a href={LEGAL_OPERATOR.phoneHref}>{LEGAL_OPERATOR.phoneDisplay}</a>
          </p>
        </div>
      </div>
    </LegalPageShell>
  );
}
