"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  MARKETPLACE_PRIMARY_PATH,
  MARKETPLACE_PRODUCTS_ONLY,
} from "@/lib/marketplace-config";
import { selectAuthToken } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

const BROWSE_LINKS = MARKETPLACE_PRODUCTS_ONLY
  ? [{ href: MARKETPLACE_PRIMARY_PATH, label: "Browse", icon: "bi-camera" }]
  : ([
      { href: "/marketplace", label: "Hub", icon: "bi-shop" },
      { href: "/marketplace/products", label: "Products", icon: "bi-camera" },
      {
        href: "/marketplace/rentals",
        label: "Rentals",
        icon: "bi-camera-reels",
      },
      {
        href: "/marketplace/digital",
        label: "Digital",
        icon: "bi-file-earmark",
      },
      { href: "/marketplace/services", label: "Services", icon: "bi-palette" },
      { href: "/marketplace/wanted", label: "Wanted", icon: "bi-search" },
      { href: "/marketplace/auctions", label: "Auctions", icon: "bi-hammer" },
    ] as const);

function navClass(pathname: string, href: string): string {
  const isActive =
    pathname === href || (href !== "/marketplace" && pathname.startsWith(href));
  return isActive ? "btn btn-accent" : "btn btn-ghost";
}

export function MarketplaceHeroActions() {
  const pathname = usePathname();
  const token = useAppSelector(selectAuthToken);
  const { data: meData } = useQuery<MeQuery>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "cache-first",
  });
  const isLoggedIn = Boolean(token && meData?.me);
  const loginNext = MARKETPLACE_PRODUCTS_ONLY
    ? MARKETPLACE_PRIMARY_PATH
    : "/marketplace";

  return (
    <div className="hero-actions marketplace-hero-actions mt-4">
      {BROWSE_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={navClass(pathname, link.href)}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          <i className={`bi ${link.icon}`} aria-hidden />
          {link.label}
        </Link>
      ))}
      <Link href="/marketplace/new" className="btn btn-accent">
        <i className="bi bi-plus-circle" aria-hidden />
        Sell
      </Link>
      {isLoggedIn ? (
        <>
          <Link
            href="/marketplace/mine"
            className={navClass(pathname, "/marketplace/mine")}
          >
            <i className="bi bi-box-seam" aria-hidden />
            My listings
          </Link>
          <Link
            href="/marketplace/inquiries"
            className={navClass(pathname, "/marketplace/inquiries")}
          >
            <i className="bi bi-chat-dots" aria-hidden />
            Inquiries
          </Link>
        </>
      ) : (
        <Link
          href={`/election/login?next=${encodeURIComponent(loginNext)}`}
          className="btn btn-ghost"
        >
          Sign in to sell
        </Link>
      )}
    </div>
  );
}
