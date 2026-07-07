"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useEffect } from "react";

import { COMMUNITY_JOIN_INTEREST_OPTIONS } from "@/components/community/join-community-form-schema";
import { communityRoleLabel } from "@/lib/community-member-labels";
import { MY_PROFILE_QUERY } from "@/lib/graphql/profile";
import { ProfileEditorSection } from "@/components/forum/ProfileEditorSection";
import { memberImageSrc } from "@/lib/member-image";
import type { GqlUser } from "@/types/election-apollo";

type CommunityJoinProfile = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  role: string;
  interests: string[];
  portfolio_url: string | null;
  message: string | null;
  avatar_url: string | null;
  is_featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProfileUser = GqlUser & {
  createdAt: string;
  updatedAt: string;
};

type MyProfileQuery = {
  me: ProfileUser | null;
  myCommunityJoin: CommunityJoinProfile | null;
};

function interestLabel(id: string): string {
  return (
    COMMUNITY_JOIN_INTEREST_OPTIONS.find((option) => option.id === id)?.label ??
    id
  );
}

function communityStatusLabel(status: CommunityJoinProfile["status"]): string {
  switch (status) {
    case "APPROVED":
      return "Approved member";
    case "PENDING":
      return "Application pending";
    case "REJECTED":
      return "Application declined";
    default:
      return status;
  }
}

function communityStatusClass(status: CommunityJoinProfile["status"]): string {
  switch (status) {
    case "APPROVED":
      return "profile-badge profile-badge--success";
    case "PENDING":
      return "profile-badge profile-badge--pending";
    case "REJECTED":
      return "profile-badge profile-badge--danger";
    default:
      return "profile-badge";
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ProfileField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="profile-field">
      <dt>{label}</dt>
      <dd>{children ?? (value?.trim() ? value : "—")}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE_QUERY);
  const me = data?.me;
  const communityJoin = data?.myCommunityJoin;

  useEffect(() => {
    if (!loading && !me) {
      router.replace(`/community?next=${encodeURIComponent("/profile")}`);
    }
  }, [loading, me, router]);

  if (loading || !me) {
    return (
      <section className="section py-5 text-center">
        <p className="text-muted">Loading your profile…</p>
      </section>
    );
  }

  const avatarSrc = memberImageSrc(
    communityJoin?.avatar_url,
    "person/person-m-1.webp",
  );
  const displayRole = communityJoin
    ? communityRoleLabel(communityJoin.role)
    : me.role === "admin"
      ? "Administrator"
      : "Canma member";

  return (
    <section className="services section profile-section">
      <div className="container section-title" data-aos="fade-up">
        <h1>My profile</h1>
        <p>Your Canma account and community details in one place.</p>
      </div>

      <div className="container pb-5">
        <div className="profile-hero offering-block" data-aos="fade-up">
          <div className="profile-hero__avatar-wrap">
            <img
              src={avatarSrc}
              alt=""
              width={112}
              height={112}
              className="profile-hero__avatar"
            />
          </div>
          <div className="profile-hero__body">
            <div className="profile-hero__head">
              <div>
                <h2 className="profile-hero__name">{me.full_name}</h2>
                <p className="profile-hero__role">{displayRole}</p>
              </div>
              <div className="profile-hero__badges">
                {me.is_verified ? (
                  <span className="profile-badge profile-badge--success">
                    <i className="bi bi-patch-check" aria-hidden />
                    Verified
                  </span>
                ) : (
                  <span className="profile-badge profile-badge--pending">
                    <i className="bi bi-shield-exclamation" aria-hidden />
                    Not verified
                  </span>
                )}
                {communityJoin ? (
                  <span className={communityStatusClass(communityJoin.status)}>
                    {communityStatusLabel(communityJoin.status)}
                  </span>
                ) : null}
                {me.role === "admin" ? (
                  <span className="profile-badge profile-badge--accent">
                    Admin
                  </span>
                ) : null}
              </div>
            </div>
            <div className="profile-hero__actions">
              <Link className="btn btn-sm btn-accent" href="/jobs/mine">
                My gigs
              </Link>
              <Link className="btn btn-sm btn-outline-secondary" href="/events">
                Events
              </Link>
              <Link className="btn btn-sm btn-outline-secondary" href="/forum">
                Forum
              </Link>
              <Link
                className="btn btn-sm btn-outline-secondary"
                href="/community"
              >
                Community
              </Link>
            </div>
          </div>
        </div>

        <div className="row gy-4 mt-1">
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <div className="offering-block profile-card h-100">
              <h3 className="profile-card__title">Account</h3>
              <dl className="profile-fields">
                <ProfileField label="Full name" value={me.full_name} />
                <ProfileField label="Email" value={me.email} />
                <ProfileField label="Phone" value={me.phone} />
                <ProfileField
                  label="Member since"
                  value={formatDate(me.createdAt)}
                />
              </dl>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="150">
            <div className="offering-block profile-card h-100">
              <h3 className="profile-card__title">Community profile</h3>
              {communityJoin ? (
                <>
                  <dl className="profile-fields">
                    <ProfileField label="City" value={communityJoin.city} />
                    <ProfileField
                      label="Role"
                      value={communityRoleLabel(communityJoin.role)}
                    />
                    <ProfileField label="Portfolio">
                      {communityJoin.portfolio_url ? (
                        <a
                          href={communityJoin.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {communityJoin.portfolio_url}
                        </a>
                      ) : (
                        "—"
                      )}
                    </ProfileField>
                    <ProfileField
                      label="Applied"
                      value={formatDate(communityJoin.createdAt)}
                    />
                    <ProfileField label="About">
                      {communityJoin.message?.trim()
                        ? communityJoin.message
                        : "—"}
                    </ProfileField>
                    <ProfileField label="Interests">
                      {communityJoin.interests.length > 0 ? (
                        <ul className="profile-interest-list">
                          {communityJoin.interests.map((interest) => (
                            <li key={interest}>{interestLabel(interest)}</li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )}
                    </ProfileField>
                  </dl>
                </>
              ) : (
                <div className="profile-empty">
                  <p className="text-muted mb-3">
                    You have not submitted a community application yet. Join the
                    network to appear on the community page and unlock member
                    features.
                  </p>
                  <Link
                    className="btn btn-sm btn-accent"
                    href="/community#join"
                  >
                    Join the community
                  </Link>
                </div>
              )}
            </div>
          </div>

          <ProfileEditorSection userId={me.id} />
        </div>
      </div>
    </section>
  );
}
