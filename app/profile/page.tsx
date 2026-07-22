"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useEffect } from "react";

import { communityMemberPath } from "@/lib/site-url";
import { COMMUNITY_JOIN_INTEREST_OPTIONS } from "@/components/community/join-community-form-schema";
import { ProfileEditorSection } from "@/components/forum/ProfileEditorSection";
import { communityRoleLabel } from "@/lib/community-member-labels";
import { MY_PROFILE_QUERY } from "@/lib/graphql/profile";
import { memberImageSrc } from "@/lib/member-image";
import {
  selectAuthToken,
  selectIsAuthenticated,
} from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";
import type { GqlUser } from "@/types/election-apollo";

type CommunityJoinProfile = {
  id: string;
  slug: string;
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

const QUICK_LINKS = [
  { href: "/jobs/mine", label: "My Jobs", icon: "bi-briefcase" },
  { href: "/events", label: "Events", icon: "bi-calendar-event" },
  { href: "/discussion", label: "Discussion", icon: "bi-chat-dots" },
  { href: "/community", label: "Community", icon: "bi-people" },
] as const;

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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectAuthToken);
  const { data, loading } = useQuery<MyProfileQuery>(MY_PROFILE_QUERY, {
    skip: !token,
  });
  const me = data?.me;
  const communityJoin = data?.myCommunityJoin;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/community/join?next=${encodeURIComponent("/profile")}`);
      return;
    }
    if (!loading && !me) {
      router.replace(`/community/join?next=${encodeURIComponent("/profile")}`);
    }
  }, [isAuthenticated, loading, me, router]);

  if (!isAuthenticated || loading || !me) {
    return (
      <section className="profile-section profile-section--loading">
        <div className="container text-center py-5">
          <p className="text-muted mb-0">Loading your profile…</p>
        </div>
      </section>
    );
  }

  const avatarSrc = memberImageSrc(communityJoin?.avatar_url);
  const displayRole = communityJoin
    ? communityRoleLabel(communityJoin.role)
    : me.role === "admin"
      ? "Administrator"
      : "Canma member";
  const communityMemberSlug =
    communityJoin?.status === "APPROVED" ? communityJoin.slug : null;

  return (
    <section className="profile-section">
      <div className="container profile-section__header" data-aos="fade-up">
        <p className="profile-section__eyebrow">Member dashboard</p>
        <h1>My profile</h1>
        <p className="profile-section__lede">
          Manage your account, community presence, and public showcase.
        </p>
      </div>

      <div className="container pb-5">
        <div className="profile-hero" data-aos="fade-up" data-aos-delay="50">
          <div className="profile-hero__accent" aria-hidden />
          <div className="profile-hero__inner">
            <div className="profile-hero__identity">
              <div className="profile-hero__avatar-wrap">
                <img
                  src={avatarSrc}
                  alt=""
                  width={128}
                  height={128}
                  className="profile-hero__avatar"
                />
              </div>
              <div className="profile-hero__intro">
                <h2 className="profile-hero__name">{me.full_name}</h2>
                <p className="profile-hero__role">{displayRole}</p>
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
                    <span
                      className={communityStatusClass(communityJoin.status)}
                    >
                      {communityStatusLabel(communityJoin.status)}
                    </span>
                  ) : null}
                  {me.role === "admin" ? (
                    <span className="profile-badge profile-badge--accent">
                      Admin
                    </span>
                  ) : null}
                  {communityJoin?.is_featured ? (
                    <span className="profile-badge profile-badge--featured">
                      <i className="bi bi-stars" aria-hidden />
                      Featured
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {communityMemberSlug ? (
              <div className="profile-hero__cta">
                <Link
                  className="btn btn-accent"
                  href={communityMemberPath(communityMemberSlug)}
                >
                  <i className="bi bi-box-arrow-up-right" aria-hidden />
                  View public profile
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="row profile-layout g-4">
          <aside
            className="col-lg-4 profile-sidebar"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="profile-card">
              <div className="profile-card__head">
                <i className="bi bi-person-vcard" aria-hidden />
                <h3 className="profile-card__title">Account</h3>
              </div>
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

            <div className="profile-card">
              <div className="profile-card__head">
                <i className="bi bi-people" aria-hidden />
                <h3 className="profile-card__title">Community</h3>
              </div>
              {communityJoin ? (
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
              ) : (
                <div className="profile-empty">
                  <p className="text-muted mb-3">
                    Join the network to appear on the community page and unlock
                    member features.
                  </p>
                  <Link
                    className="btn btn-accent btn-sm"
                    href="/community/join"
                  >
                    Join the community
                  </Link>
                </div>
              )}
            </div>

            <nav
              className="profile-card profile-quick-nav"
              aria-label="Quick links"
            >
              <div className="profile-card__head">
                <i className="bi bi-grid" aria-hidden />
                <h3 className="profile-card__title">Quick links</h3>
              </div>
              <ul className="profile-quick-nav__list">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="profile-quick-nav__link">
                      <i className={`bi ${link.icon}`} aria-hidden />
                      <span>{link.label}</span>
                      <i
                        className="bi bi-chevron-right profile-quick-nav__chevron"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
                {communityMemberSlug ? (
                  <li>
                    <Link
                      href={communityMemberPath(communityMemberSlug)}
                      className="profile-quick-nav__link"
                    >
                      <i className="bi bi-easel" aria-hidden />
                      <span>Public showcase</span>
                      <i
                        className="bi bi-chevron-right profile-quick-nav__chevron"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link
                    href={`/discussion/u/${me.id}`}
                    className="profile-quick-nav__link"
                  >
                    <i className="bi bi-chat-square-text" aria-hidden />
                    <span>Discussion profile</span>
                    <i
                      className="bi bi-chevron-right profile-quick-nav__chevron"
                      aria-hidden
                    />
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          <div
            className="col-lg-8 profile-main"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <ProfileEditorSection communityMemberSlug={communityMemberSlug} />
          </div>
        </div>
      </div>
    </section>
  );
}
