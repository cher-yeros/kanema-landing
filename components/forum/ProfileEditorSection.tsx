"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { MY_PROFILE_QUERY, UPDATE_PROFILE_MUTATION } from "@/lib/forum-graphql";
import { PortfolioProjectsEditor } from "@/components/community/PortfolioProjectsEditor";
import {
  formatReputationTier,
  tierBadgeClass,
} from "@/components/forum/forum-utils";
import { communityMemberPath } from "@/lib/site-url";

export function ProfileEditorSection({
  communityMemberSlug,
}: {
  communityMemberSlug?: string | null;
}) {
  const { data, refetch } = useQuery(MY_PROFILE_QUERY);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);

  const profile = (
    data as {
      myProfile?: {
        bio: string | null;
        avatar_url: string | null;
        city: string | null;
        creative_role: string | null;
        portfolio_url: string | null;
        website_url: string | null;
        reputation_points: number;
        reputation_tier: string;
        badges: Array<{ name: string; icon: string | null }>;
      };
    }
  )?.myProfile;

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [creativeRole, setCreativeRole] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setBio(profile.bio ?? "");
      setCity(profile.city ?? "");
      setCreativeRole(profile.creative_role ?? "");
      setPortfolioUrl(profile.portfolio_url ?? "");
      setWebsiteUrl(profile.website_url ?? "");
      setInitialized(true);
    }
  }, [profile, initialized]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      variables: {
        input: {
          bio,
          city,
          creative_role: creativeRole,
          portfolio_url: portfolioUrl,
          website_url: websiteUrl,
        },
      },
    });
    refetch();
  }

  return (
    <>
      <div className="profile-card profile-card--editor">
        <div className="profile-card__head profile-card__head--split">
          <div>
            <i className="bi bi-pencil-square" aria-hidden />
            <h3 className="profile-card__title">Discussion and links</h3>
            <p className="profile-card__subtitle">
              Update the bio, creative role, and links shown across discussion
              and your public profile.
            </p>
          </div>
          {profile ? (
            <div className="profile-reputation">
              <span
                className={`badge ${tierBadgeClass(profile.reputation_tier)}`}
              >
                {formatReputationTier(profile.reputation_tier)}
              </span>
              <span className="profile-reputation__points">
                {profile.reputation_points} reputation
              </span>
            </div>
          ) : null}
        </div>

        {profile && profile.badges.length > 0 ? (
          <div className="profile-badge-row">
            {profile.badges.map((b) => (
              <span key={b.name} className="badge forum-tag-badge">
                {b.icon} {b.name}
              </span>
            ))}
          </div>
        ) : null}

        <div className="contact">
          <div className="form-panel form-panel--embedded">
            <form onSubmit={saveProfile} className="php-email-form">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="forum-profile-bio" className="form-label">
                    Bio
                  </label>
                  <textarea
                    id="forum-profile-bio"
                    className="form-control"
                    rows={4}
                    placeholder="A short introduction for discussion and community visitors…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="forum-profile-city" className="form-label">
                    City
                  </label>
                  <input
                    id="forum-profile-city"
                    className="form-control"
                    placeholder="Addis Ababa"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    htmlFor="forum-profile-creative-role"
                    className="form-label"
                  >
                    Creative role
                  </label>
                  <input
                    id="forum-profile-creative-role"
                    className="form-control"
                    placeholder="Cinematographer, editor, producer…"
                    value={creativeRole}
                    onChange={(e) => setCreativeRole(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    htmlFor="forum-profile-portfolio"
                    className="form-label"
                  >
                    Portfolio URL
                  </label>
                  <input
                    id="forum-profile-portfolio"
                    type="url"
                    className="form-control"
                    placeholder="https://your-portfolio.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="forum-profile-website" className="form-label">
                    Website
                  </label>
                  <input
                    id="forum-profile-website"
                    type="url"
                    className="form-control"
                    placeholder="https://your-website.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="dispatch-btn" disabled={loading}>
                <i className="bi bi-arrow-right-circle-fill" aria-hidden />
                <span>{loading ? "Saving…" : "Save profile details"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="profile-card profile-card--showcase">
        <div className="contact">
          <PortfolioProjectsEditor />
        </div>
        {communityMemberSlug ? (
          <p className="profile-showcase-note">
            <i className="bi bi-info-circle" aria-hidden />
            Showcase items appear on your{" "}
            <a href={communityMemberPath(communityMemberSlug)}>
              public community profile
            </a>
            .
          </p>
        ) : null}
      </div>
    </>
  );
}
