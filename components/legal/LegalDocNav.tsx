import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/account-deletion", label: "Account Deletion" },
] as const;

export function LegalDocNav({ current }: { current: string }) {
  return (
    <nav className="legal-doc-nav" aria-label="Legal documents">
      <ul>
        {LEGAL_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={current === link.href ? "is-active" : undefined}
              aria-current={current === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
