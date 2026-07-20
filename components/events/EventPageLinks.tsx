import Link from "next/link";

export function EventPageLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      className={`event-page-links ${className}`.trim()}
      aria-label="Event section links"
    >
      <Link href="/">Home</Link>
      <span className="event-page-links__sep" aria-hidden>
        ·
      </span>
      <Link href="/community">Join the community</Link>
    </nav>
  );
}
