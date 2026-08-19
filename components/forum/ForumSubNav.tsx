"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

const links = [
  { href: "/discussion", label: "Home" },
  { href: "/discussion/search", label: "Search" },
  { href: "/discussion/wiki", label: "Wiki" },
  { href: "/discussion/notifications", label: "Notifications" },
];

export function ForumSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="forum-subnav border-bottom sticky-top"
      aria-label="Discussion"
    >
      <div className="container py-2 d-flex flex-wrap align-items-center gap-3">
        {links.map((l) => {
          const isActive =
            pathname === l.href ||
            (l.href !== "/discussion" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`forum-subnav-link text-decoration-none small fw-semibold${
                isActive ? " is-active" : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {l.label}
            </Link>
          );
        })}
        <div className="ms-auto">
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
