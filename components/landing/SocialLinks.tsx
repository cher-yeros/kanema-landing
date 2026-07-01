import { SITE_SOCIAL_LINKS } from "@/lib/site-contact";

function SocialIcon({
  icon,
}: {
  icon: (typeof SITE_SOCIAL_LINKS)[number]["icon"];
}) {
  if (icon === "tiktok") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="currentColor"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
      </svg>
    );
  }

  return <i className={`bi bi-${icon}`} aria-hidden="true" />;
}

export function SocialLinks() {
  return (
    <>
      {SITE_SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
        >
          <SocialIcon icon={link.icon} />
        </a>
      ))}
    </>
  );
}
