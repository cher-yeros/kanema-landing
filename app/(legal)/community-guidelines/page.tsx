import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR } from "@/lib/legal-meta";
import { absoluteSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Community Guidelines — Canma",
  description:
    "Standards for respectful and lawful participation on Canma’s community platform.",
  alternates: { canonical: absoluteSiteUrl("/community-guidelines") },
};

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageShell
      currentPath="/community-guidelines"
      title="Community Guidelines"
      intro="Canma is a professional hub for Ethiopian visual storytellers. These guidelines help keep profiles, forums, marketplace, jobs, and events useful, respectful, and safe."
      lastUpdated={LEGAL_EFFECTIVE_DATE}
    >
      <div className="content-section">
        <h2>1. Be professional and respectful</h2>
        <ul>
          <li>Treat other members, clients, and organizers with respect</li>
          <li>
            Critique work constructively; do not attack people for identity,
            background, or affiliation
          </li>
          <li>
            Keep discussions relevant to creative practice, opportunities, and
            community topics
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>2. Be honest</h2>
        <ul>
          <li>
            Use your real professional identity on profiles where expected
          </li>
          <li>
            Do not impersonate others or misrepresent experience, credits, or
            ownership of work
          </li>
          <li>
            List accurate pricing, availability, and product/service details in
            marketplace and job posts
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>3. Respect intellectual property</h2>
        <ul>
          <li>
            Only upload photos, video, and materials you have rights to share
          </li>
          <li>
            Credit collaborators when appropriate; do not claim others’ work as
            your own
          </li>
          <li>
            Do not post pirated software, stolen footage, or unauthorized
            confidential client materials
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>4. No harmful or illegal content</h2>
        <p>Do not post or promote:</p>
        <ul>
          <li>Illegal activity, scams, or fraud</li>
          <li>Harassment, threats, hate speech, or targeted abuse</li>
          <li>
            Sexual content involving minors, exploitation, or non-consensual
            intimate imagery
          </li>
          <li>Graphic violence intended to shock or glorify harm</li>
          <li>Malware, phishing, or social-engineering attempts</li>
        </ul>
      </div>

      <div className="content-section">
        <h2>5. Marketplace and jobs fairness</h2>
        <ul>
          <li>
            Do not post fake listings, bait pricing, or spam across categories
          </li>
          <li>
            Honor commitments you make with buyers, sellers, applicants, and
            employers when possible; communicate clearly if plans change
          </li>
          <li>
            Do not misuse contact details obtained through Canma for spam or
            harassment
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>6. Safety and privacy</h2>
        <ul>
          <li>
            Do not share someone else’s private contact details or personal data
            without permission
          </li>
          <li>
            Be careful meeting offline for gigs or sales; meet in public or
            professional settings when possible
          </li>
          <li>
            Report suspicious accounts, scams, or abusive behavior to{" "}
            <a href={`mailto:${LEGAL_OPERATOR.supportEmail}`}>
              {LEGAL_OPERATOR.supportEmail}
            </a>
          </li>
        </ul>
      </div>

      <div className="content-section">
        <h2>7. Enforcement</h2>
        <p>
          Depending on severity and history, we may warn users, remove content,
          limit features, suspend accounts, or permanently ban accounts. Serious
          violations may be reported to authorities when required.
        </p>
        <p>
          These guidelines work together with our{" "}
          <Link href="/terms">Terms of Use</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <div className="privacy-contact">
        <h2>8. Contact</h2>
        <div className="contact-details">
          <p>
            Questions or reports:{" "}
            <a href={`mailto:${LEGAL_OPERATOR.supportEmail}`}>
              {LEGAL_OPERATOR.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </LegalPageShell>
  );
}
