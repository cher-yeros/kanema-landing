import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR } from "@/lib/legal-meta";
import { absoluteSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Account Deletion — Canma",
  description:
    "How to request deletion of your Canma account and associated personal data.",
  alternates: { canonical: absoluteSiteUrl("/account-deletion") },
};

export default function AccountDeletionPage() {
  return (
    <LegalPageShell
      currentPath="/account-deletion"
      title="Account Deletion"
      intro="You can request deletion of your Canma account and associated personal data. This page explains how the request works for website and mobile app users."
      lastUpdated={LEGAL_EFFECTIVE_DATE}
    >
      <div className="content-section">
        <h2>1. How to request deletion</h2>
        <p>Send an email to:</p>
        <ul>
          <li>
            <a
              href={`mailto:${LEGAL_OPERATOR.supportEmail}?subject=Canma%20account%20deletion%20request`}
            >
              {LEGAL_OPERATOR.supportEmail}
            </a>
          </li>
        </ul>
        <p>Include:</p>
        <ul>
          <li>Subject line: “Canma account deletion request”</li>
          <li>The email address and phone number registered on your account</li>
          <li>Your Canma display name or profile URL, if available</li>
          <li>Confirmation that you want the account permanently deleted</li>
        </ul>
        <p>
          We may ask you to verify ownership of the account before completing
          deletion.
        </p>
      </div>

      <div className="content-section">
        <h2>2. What is deleted</h2>
        <p>When deletion is completed, we typically remove or de-identify:</p>
        <ul>
          <li>Account credentials and profile information</li>
          <li>Profile photos and portfolio media tied to your account</li>
          <li>
            Private messages and personal settings associated with the account
          </li>
          <li>
            Access to community, marketplace, jobs, events, and related features
            under that account
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>3. What may be retained</h2>
        <p>
          Some information may be retained for a limited period where needed
          for:
        </p>
        <ul>
          <li>Legal, accounting, tax, or regulatory obligations</li>
          <li>Fraud prevention, security, and dispute resolution</li>
          <li>Backup systems, until those backups naturally rotate</li>
          <li>
            Transaction records (for example payment references) required for
            financial compliance
          </li>
        </ul>
        <p>
          Public content you posted (for example forum replies) may be removed,
          anonymized, or left in place without identifying account details,
          depending on context and technical feasibility.
        </p>
      </div>

      <div className="content-section">
        <h2>4. Timing</h2>
        <p>
          We aim to acknowledge deletion requests within 7 days and complete
          deletion within 30 days after identity verification, unless a longer
          period is required by law or for security review.
        </p>
      </div>

      <div className="content-section">
        <h2>5. App Store and Play Store note</h2>
        <p>
          If you created an account in the Canma mobile app, you can also start
          an account-deletion request from within the app when that option is
          available, or by emailing the address above. Uninstalling the app
          alone does not delete your account or server-stored data.
        </p>
      </div>

      <div className="privacy-contact">
        <h2>6. Related policies</h2>
        <p>
          See our <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/terms">Terms of Use</Link> for more detail on data
          practices and account rules.
        </p>
        <div className="contact-details">
          <p>
            Support:{" "}
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
