"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { USER_PROFILE_QUERY } from "@/lib/forum-graphql";
import { ThreadList } from "@/components/forum/ThreadCard";
import {
  formatReputationTier,
  tierBadgeClass,
} from "@/components/forum/forum-utils";
import { ForumPageShell } from "@/components/forum/ForumPageShell";
import { memberImageSrc } from "@/lib/member-image";
import { MarketplaceProfileSection } from "@/components/marketplace/MarketplaceProfileSection";
import { JobWorkProfileSection } from "@/components/jobs/JobWorkProfileSection";

export function PublicUserProfileClient({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"forum" | "marketplace" | "work">("forum");
  const { data } = useQuery(USER_PROFILE_QUERY, {
    variables: { user_id: userId },
  });

  const profile = data as {
    userProfile?: {
      bio: string | null;
      avatar_url: string | null;
      city: string | null;
      creative_role: string | null;
      portfolio_url: string | null;
      website_url: string | null;
      reputation_points: number;
      reputation_tier: string;
      standing_next_min?: number | null;
      standing_next_tier?: string | null;
      standing_progress?: number;
      badges: Array<{ slug: string; name: string; icon: string | null }>;
      user: { full_name: string };
    };
    userForumThreads?: Parameters<typeof ThreadList>[0]["threads"];
  };

  if (!profile?.userProfile) {
    return (
      <ForumPageShell>
        <p className="text-muted mb-0">Loading profile…</p>
      </ForumPageShell>
    );
  }

  const p = profile.userProfile;

  return (
    <ForumPageShell>
      <div className="offering-block p-4 mb-4">
        <div className="d-flex gap-3 align-items-start">
          <img
            src={memberImageSrc(p.avatar_url)}
            alt=""
            className="rounded-circle"
            width={72}
            height={72}
          />
          <div>
            <h1 className="h4 mb-1">{p.user.full_name}</h1>
            <span className={`badge ${tierBadgeClass(p.reputation_tier)}`}>
              {formatReputationTier(p.reputation_tier)}
            </span>
            <span className="small text-muted ms-2">
              {p.reputation_points} Standing
            </span>
            {typeof p.standing_progress === "number" ? (
              <div className="mt-2" style={{ maxWidth: 220 }}>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuenow={Math.round(p.standing_progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ height: 6 }}
                >
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${Math.min(100, Math.round(p.standing_progress * 100))}%`,
                    }}
                  />
                </div>
                <div className="small text-muted mt-1">
                  {p.standing_next_tier && p.standing_next_min != null
                    ? `${p.standing_next_min - p.reputation_points} to ${formatReputationTier(p.standing_next_tier)}`
                    : "Legend Standing"}
                </div>
              </div>
            ) : null}
            {p.creative_role ? (
              <div className="small text-muted mt-1">{p.creative_role}</div>
            ) : null}
            {p.city ? <div className="small text-muted">{p.city}</div> : null}
            {p.bio ? <p className="mt-2 mb-0">{p.bio}</p> : null}
            <div className="d-flex gap-3 mt-2 small">
              {p.portfolio_url ? (
                <a
                  href={p.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio
                </a>
              ) : null}
              {p.website_url ? (
                <a
                  href={p.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              ) : null}
            </div>
            {p.badges.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mt-3">
                {p.badges.map((b) => (
                  <span key={b.slug} className="badge forum-tag-badge">
                    {b.icon} {b.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link${tab === "forum" ? " active" : ""}`}
            onClick={() => setTab("forum")}
          >
            Discussion
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link${tab === "marketplace" ? " active" : ""}`}
            onClick={() => setTab("marketplace")}
          >
            Marketplace
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link${tab === "work" ? " active" : ""}`}
            onClick={() => setTab("work")}
          >
            Work
          </button>
        </li>
      </ul>

      {tab === "forum" ? (
        <>
          <h2 className="h5 mb-3">Recent threads</h2>
          <ThreadList threads={profile.userForumThreads ?? []} />
        </>
      ) : tab === "marketplace" ? (
        <>
          <h2 className="h5 mb-3">Marketplace</h2>
          <MarketplaceProfileSection userId={userId} />
        </>
      ) : (
        <>
          <h2 className="h5 mb-3">Job work reviews</h2>
          <JobWorkProfileSection userId={userId} />
        </>
      )}
      <Link href="/discussion" className="btn btn-ghost mt-3">
        <i className="bi bi-arrow-left" />
        Back to discussion
      </Link>
    </ForumPageShell>
  );
}
