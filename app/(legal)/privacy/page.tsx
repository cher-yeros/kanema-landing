import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR } from "@/lib/legal-meta";
import { absoluteSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Policy — Canma",
  description:
    "How Canma collects, uses, stores, and shares personal information across the website and mobile apps.",
  alternates: { canonical: absoluteSiteUrl("/privacy") },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      currentPath="/privacy"
      title="Privacy Policy"
      intro={`This Privacy Policy explains how ${LEGAL_OPERATOR.entity} (“Canma”, “we”, “us”) collects, uses, stores, and shares information when you use our website, mobile applications, and related services (together, the “Services”).`}
      lastUpdated={LEGAL_EFFECTIVE_DATE}
    >
      <div className="content-section">
        <h2>1. Who we are</h2>
        <p>
          Canma is a digital hub for Ethiopian visual
          storytellers—photographers, videographers, filmmakers, and related
          creatives. The Services include community profiles, discussion forums,
          marketplace listings, creative jobs, events, learning content, and
          related features on web and mobile.
        </p>
        <p>
          Operator location: {LEGAL_OPERATOR.location}. Privacy contact:{" "}
          <a href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}>
            {LEGAL_OPERATOR.privacyEmail}
          </a>
          .
        </p>
      </div>

      <div className="content-section">
        <h2>2. Information we collect</h2>
        <h3>Account and profile information</h3>
        <ul>
          <li>Name, email address, phone number, and password</li>
          <li>
            Profile details such as bio, specialty, location, portfolio links,
            and profile photos
          </li>
          <li>Community membership and interest preferences</li>
        </ul>
        <h3>Content you create</h3>
        <ul>
          <li>
            Forum posts, replies, wiki contributions, marketplace listings, job
            posts, applications, event registrations, messages, and reviews
          </li>
          <li>Images, media, and other files you upload</li>
        </ul>
        <h3>Payment information</h3>
        <ul>
          <li>
            When you pay for features (for example event tickets, job posting,
            or marketplace-related fees), payment is processed by our payment
            partner (currently Chapa). We receive payment status, reference IDs,
            and related transaction metadata. We do not store full card numbers
            on Canma servers.
          </li>
        </ul>
        <h3>Device, usage, and technical data</h3>
        <ul>
          <li>
            IP address, user agent, device/app identifiers, approximate location
            derived from network data, pages or screens visited, and timestamps
          </li>
          <li>
            Basic site analytics (for example visit path recording) used to
            understand usage and improve the Services
          </li>
          <li>
            Authentication tokens and session data needed to keep you signed in
          </li>
        </ul>
        <h3>Communications</h3>
        <ul>
          <li>
            Messages you send to support, and related correspondence about your
            account or transactions
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>3. How we use information</h2>
        <ul>
          <li>Create and manage accounts, profiles, and memberships</li>
          <li>
            Provide platform features: community, discussion, marketplace, jobs,
            events, learning, and related tools
          </li>
          <li>Process payments and deliver paid features</li>
          <li>
            Communicate about account activity, security, service updates, and
            support requests
          </li>
          <li>
            Moderate content and enforce our Terms and Community Guidelines
          </li>
          <li>
            Improve reliability, security, performance, and product design
          </li>
          <li>Comply with legal obligations and protect Canma and users</li>
        </ul>
      </div>

      <div className="content-section">
        <h2>4. How we share information</h2>
        <p>We may share information in these situations:</p>
        <ul>
          <li>
            <strong>Public or community-visible content:</strong> profiles,
            portfolios, posts, listings, and similar content you choose to
            publish may be visible to other users or the public
          </li>
          <li>
            <strong>Service providers:</strong> hosting, infrastructure,
            analytics, email/SMS delivery, and payment processors that help us
            operate the Services under appropriate safeguards
          </li>
          <li>
            <strong>Legal and safety:</strong> when required by law, or to
            protect rights, safety, and integrity of users and Canma
          </li>
          <li>
            <strong>Business transfers:</strong> if Canma is involved in a
            merger, acquisition, or asset transfer, information may transfer as
            part of that transaction
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </div>

      <div className="content-section">
        <h2>5. Cookies and similar technologies</h2>
        <p>
          We use cookies, local storage, and similar technologies for
          authentication, preferences (such as theme), security, and basic
          analytics. You can control cookies through your browser settings.
          Disabling some cookies may limit signed-in features.
        </p>
      </div>

      <div className="content-section">
        <h2>6. Data retention</h2>
        <p>
          We keep account and content data while your account is active and as
          needed to provide the Services. We may retain limited records after
          account closure for security, fraud prevention, dispute resolution,
          backups, and legal compliance. Payment and transaction records may be
          retained for accounting and regulatory purposes.
        </p>
      </div>

      <div className="content-section">
        <h2>7. Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational
          measures to protect personal information. No method of transmission or
          storage is completely secure. Please use a strong password and keep
          your credentials confidential.
        </p>
      </div>

      <div className="content-section">
        <h2>8. Your choices and rights</h2>
        <ul>
          <li>
            Access and update profile information in your account settings
          </li>
          <li>
            Request a copy of personal data we hold about you, or correction of
            inaccurate data, by contacting us
          </li>
          <li>
            Request account deletion as described on our{" "}
            <Link href="/account-deletion">Account Deletion</Link> page
          </li>
          <li>
            Opt out of non-essential marketing emails where offered
            (transactional and security messages may still be sent)
          </li>
        </ul>
        <p>
          Depending on applicable law, additional rights may apply. Contact us
          to exercise them.
        </p>
      </div>

      <div className="content-section">
        <h2>9. Children’s privacy</h2>
        <p>
          The Services are intended for users who are at least 13 years old (or
          the minimum age required in your jurisdiction). We do not knowingly
          collect personal information from children below that age. If you
          believe a child has provided personal information, contact us and we
          will take appropriate steps.
        </p>
      </div>

      <div className="content-section">
        <h2>10. International processing</h2>
        <p>
          Canma is operated from Ethiopia. Information may be processed and
          stored in Ethiopia or in other countries where our service providers
          operate. By using the Services, you understand that your information
          may be transferred to those locations.
        </p>
      </div>

      <div className="content-section">
        <h2>11. Mobile app permissions</h2>
        <p>
          Our iOS and Android apps may request device permissions such as
          camera, photo library, or notifications when needed for features you
          use (for example uploading a profile photo or receiving alerts). You
          can change permissions in your device settings.
        </p>
      </div>

      <div className="content-section">
        <h2>12. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The “Last
          updated” date at the top will change when we do. Continued use of the
          Services after an update means you accept the revised policy, unless
          applicable law requires additional consent.
        </p>
      </div>

      <div className="privacy-contact">
        <h2>13. Contact</h2>
        <p>For privacy questions, data requests, or concerns, contact:</p>
        <div className="contact-details">
          <p>
            <strong>{LEGAL_OPERATOR.entity}</strong>
            <br />
            {LEGAL_OPERATOR.location}
            <br />
            Email:{" "}
            <a href={`mailto:${LEGAL_OPERATOR.privacyEmail}`}>
              {LEGAL_OPERATOR.privacyEmail}
            </a>
            <br />
            Phone:{" "}
            <a href={LEGAL_OPERATOR.phoneHref}>{LEGAL_OPERATOR.phoneDisplay}</a>
          </p>
        </div>
        <p>
          Related documents: <Link href="/terms">Terms of Use</Link>
          {" · "}
          <Link href="/community-guidelines">Community Guidelines</Link>
          {" · "}
          <Link href="/account-deletion">Account Deletion</Link>
        </p>
      </div>
    </LegalPageShell>
  );
}
