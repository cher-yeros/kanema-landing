"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import { selectAuthToken, selectAuthUser } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

export function ForumHeroActions() {
  const token = useAppSelector(selectAuthToken);
  const sessionUser = useAppSelector(selectAuthUser);
  const { data } = useQuery<MeQuery>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "cache-first",
  });

  const me = data?.me;
  const isLoggedIn = Boolean(token);
  const displayName = me?.full_name ?? sessionUser?.full_name;

  return (
    <div className="hero-actions mt-4">
      <Link href="#forum-communities" className="btn btn-accent">
        <i className="bi bi-plus-circle" />
        Start a discussion
      </Link>
      <Link href="/forum/search" className="btn btn-ghost">
        <i className="bi bi-search" />
        Search discussions
      </Link>
      <Link href="/forum/wiki" className="btn btn-ghost">
        <i className="bi bi-book" />
        Browse wiki
      </Link>
      {isLoggedIn ? (
        <>
          <Link href="/profile" className="btn btn-ghost">
            {displayName ? `Hi, ${displayName.split(" ")[0]}` : "My profile"}
          </Link>
          <Link href="/forum/notifications" className="btn btn-ghost">
            Notifications
          </Link>
        </>
      ) : (
        <Link
          href={`/community?next=${encodeURIComponent("/forum")}`}
          className="btn btn-ghost"
        >
          Join Canma
        </Link>
      )}
    </div>
  );
}
