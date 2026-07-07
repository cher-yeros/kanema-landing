"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  MY_PROFILE_QUERY,
  UPDATE_PROFILE_MUTATION,
  PORTFOLIO_QUERY,
  UPSERT_PORTFOLIO_MUTATION,
} from "@/lib/forum-graphql";
import {
  formatReputationTier,
  tierBadgeClass,
} from "@/components/forum/forum-utils";
import Link from "next/link";

export function ProfileEditorSection({ userId }: { userId: string }) {
  const { data, refetch } = useQuery(MY_PROFILE_QUERY);
  const { data: portfolioData, refetch: refetchPortfolio } =
    useQuery(PORTFOLIO_QUERY);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);
  const [upsertProject, { loading: savingProject }] = useMutation(
    UPSERT_PORTFOLIO_MUTATION,
  );

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

  const projects =
    (
      portfolioData as {
        myPortfolioProjects?: Array<{
          id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
        }>;
      }
    )?.myPortfolioProjects ?? [];

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

  async function addProject() {
    const title = prompt("Project title");
    if (!title) return;
    await upsertProject({ variables: { input: { title } } });
    refetchPortfolio();
  }

  return (
    <div className="col-12" data-aos="fade-up" data-aos-delay="200">
      <div className="offering-block profile-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="profile-card__title mb-0">Forum profile</h3>
          <Link href={`/forum/u/${userId}`} className="btn btn-sm btn-ghost">
            Public profile
          </Link>
        </div>

        {profile ? (
          <div className="mb-3">
            <span
              className={`badge ${tierBadgeClass(profile.reputation_tier)}`}
            >
              {formatReputationTier(profile.reputation_tier)}
            </span>
            <span className="small text-muted ms-2">
              {profile.reputation_points} reputation
            </span>
            {profile.badges.length > 0 ? (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {profile.badges.map((b) => (
                  <span key={b.name} className="badge forum-tag-badge">
                    {b.icon} {b.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={saveProfile}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">Bio</label>
              <textarea
                className="form-control form-control-sm"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">City</label>
              <input
                className="form-control form-control-sm"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <label className="form-label small mt-2">Creative role</label>
              <input
                className="form-control form-control-sm"
                value={creativeRole}
                onChange={(e) => setCreativeRole(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Portfolio URL</label>
              <input
                className="form-control form-control-sm"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Website</label>
              <input
                className="form-control form-control-sm"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-sm btn-accent mt-3"
            disabled={loading}
          >
            Save forum profile
          </button>
        </form>

        <hr className="my-4" />
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="h6 mb-0">Portfolio projects</h4>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={savingProject}
            onClick={addProject}
          >
            Add project
          </button>
        </div>
        {projects.length === 0 ? (
          <p className="small text-muted">No portfolio projects yet.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {projects.map((p) => (
              <li key={p.id} className="small py-1">
                <strong>{p.title}</strong>
                {p.description ? (
                  <span className="text-muted"> — {p.description}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3">
          <Link href="/forum" className="btn btn-sm btn-outline-secondary me-2">
            Forum home
          </Link>
          <Link
            href="/forum/notifications"
            className="btn btn-sm btn-outline-secondary"
          >
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
