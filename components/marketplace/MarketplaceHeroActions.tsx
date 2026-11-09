"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { MARKETPLACE_PRIMARY_PATH } from "@/lib/marketplace-config";
import { selectAuthToken } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

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

  return (
    <div className="hero-actions marketplace-hero-actions mt-4">
      <a href="#marketplace-listings" className="btn btn-ghost">
        <i className="bi bi-funnel" aria-hidden />
        Browse listings
      </a>
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
            href="/marketplace/messages"
            className={navClass(pathname, "/marketplace/messages")}
          >
            <i className="bi bi-chat-dots" aria-hidden />
            Messages
          </Link>
        </>
      ) : (
        <Link
          href={`/election/login?next=${encodeURIComponent(MARKETPLACE_PRIMARY_PATH)}`}
          className="btn btn-ghost"
        >
          Sign in to sell
        </Link>
      )}
    </div>
  );
}
