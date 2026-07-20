"use client";

import { useQuery } from "@apollo/client/react";
import Link from "next/link";

import { COMMUNITY_JOIN_INTEREST_OPTIONS } from "@/components/community/join-community-form-schema";
import { communityRoleLabel } from "@/lib/community-member-labels";
import { MY_PROFILE_QUERY } from "@/lib/graphql/profile";
import { memberImageSrc } from "@/lib/member-image";
import type {
  PublicCommunityMember,
  PublicPortfolioProject,
  PublicUserProfile,
} from "@/lib/public-graphql";
import { selectAuthToken, selectAuthUser } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";

function interestLabel(id: string): string {
  return (
    COMMUNITY_JOIN_INTEREST_OPTIONS.find((option) => option.id === id)?.label ??
    id
  );
}

function portfolioImage(project: PublicPortfolioProject): string | null {
  if (project.cover_url) return project.cover_url;
  if (!project.media_json) return null;
  try {
    const media = JSON.parse(project.media_json) as Array<{ url?: string }>;
    const first = media.find((item) => item.url);
    return first?.url ?? null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
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
    <div className="community-member-field">
      <dt>{label}</dt>
      <dd>{children ?? (value?.trim() ? value : "—")}</dd>
    </div>
  );
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {href}
    </a>
  );
}

type CommunityMemberProfileClientProps = {
  member: PublicCommunityMember;
  projects: PublicPortfolioProject[];
  forumProfile: PublicUserProfile | null;
};

export function CommunityMemberProfileClient({
  member,
  projects,
  forumProfile,
}: CommunityMemberProfileClientProps) {
  const token = useAppSelector(selectAuthToken);
  const sessionUser = useAppSelector(selectAuthUser);
  const isOwnProfile = Boolean(
    member.user_id && sessionUser?.id === member.user_id,
  );

  const { data: ownProfileData } = useQuery<{
    me: { email: string; phone: string | null; createdAt: string } | null;
  }>(MY_PROFILE_QUERY, {
    skip: !isOwnProfile || !token,
  });

  const avatarSrc = memberImageSrc(member.avatar_url);
  const roleLabel = communityRoleLabel(member.role);
  const memberSince = formatDate(member.member_since);
  const appliedOn = formatDate(member.createdAt);
  const displayCity = member.city?.trim() || forumProfile?.city?.trim() || null;
  const displayBio = forumProfile?.bio?.trim() || null;
  const aboutMessage = member.message?.trim() || null;

  return (
    <section className="services section community-member-profile">
      <div className="container section-title" data-aos="fade-up">
        <p className="community-member-profile__back mb-2">
          <Link href="/community">
            <i className="bi bi-arrow-left" aria-hidden /> Back to community
          </Link>
        </p>
        <h1>{member.full_name}</h1>
        <p>
          {roleLabel}
          {displayCity ? ` · ${displayCity}` : ""}
        </p>
      </div>

      <div className="container pb-5">
        <div
          className="community-member-hero offering-block"
          data-aos="fade-up"
        >
          <div className="community-member-hero__avatar-wrap">
            <img
              src={avatarSrc}
              alt=""
              width={120}
              height={120}
              className="community-member-hero__avatar"
            />
          </div>
          <div className="community-member-hero__body">
            {member.is_featured ? (
              <span className="community-member-badge">
                <i className="bi bi-stars" aria-hidden /> Featured member
              </span>
            ) : null}
            {displayBio ? (
              <p className="community-member-hero__bio">{displayBio}</p>
            ) : aboutMessage ? (
              <p className="community-member-hero__bio">{aboutMessage}</p>
            ) : null}
            {member.interests.length > 0 ? (
              <div className="community-member-interests">
                {member.interests.map((interest) => (
                  <span key={interest} className="community-member-interest">
                    {interestLabel(interest)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="row community-member-layout g-4 mt-2">
          <aside className="col-lg-4 community-member-sidebar">
            <div className="community-member-card" data-aos="fade-up">
              <div className="community-member-card__head">
                <i className="bi bi-people" aria-hidden />
                <h2 className="community-member-card__title">Member</h2>
              </div>
              <dl className="community-member-fields">
                <ProfileField label="Full name" value={member.full_name} />
                <ProfileField label="City" value={displayCity} />
                <ProfileField label="Role" value={roleLabel} />
                <ProfileField label="Portfolio">
                  {member.portfolio_url?.trim() ? (
                    <ExternalLink href={member.portfolio_url.trim()} />
                  ) : (
                    "—"
                  )}
                </ProfileField>
                <ProfileField
                  label="Member since"
                  value={memberSince ?? undefined}
                />
                <ProfileField label="Applied" value={appliedOn ?? undefined} />
                <ProfileField label="About">{aboutMessage ?? "—"}</ProfileField>
                <ProfileField label="Interests">
                  {member.interests.length > 0 ? (
                    <ul className="community-member-interest-list">
                      {member.interests.map((interest) => (
                        <li key={interest}>{interestLabel(interest)}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </ProfileField>
              </dl>
            </div>

            {member.user_id ? (
              <div
                className="community-member-card"
                data-aos="fade-up"
                data-aos-delay="50"
              >
                <div className="community-member-card__head">
                  <i className="bi bi-chat-square-text" aria-hidden />
                  <h2 className="community-member-card__title">Presence</h2>
                </div>
                <dl className="community-member-fields">
                  <ProfileField label="Bio">
                    {forumProfile?.bio?.trim() ? forumProfile.bio : "—"}
                  </ProfileField>
                  <ProfileField
                    label="City"
                    value={
                      forumProfile?.city?.trim() || displayCity || undefined
                    }
                  />
                  <ProfileField
                    label="Creative role"
                    value={forumProfile?.creative_role}
                  />
                  <ProfileField label="Portfolio URL">
                    {forumProfile?.portfolio_url?.trim() ? (
                      <ExternalLink href={forumProfile.portfolio_url.trim()} />
                    ) : (
                      "—"
                    )}
                  </ProfileField>
                  <ProfileField label="Website">
                    {forumProfile?.website_url?.trim() ? (
                      <ExternalLink href={forumProfile.website_url.trim()} />
                    ) : (
                      "—"
                    )}
                  </ProfileField>
                </dl>
              </div>
            ) : null}

            {isOwnProfile && ownProfileData?.me ? (
              <div
                className="community-member-card"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="community-member-card__head">
                  <i className="bi bi-person-vcard" aria-hidden />
                  <h2 className="community-member-card__title">Account</h2>
                </div>
                <dl className="community-member-fields">
                  <ProfileField label="Email" value={ownProfileData.me.email} />
                  <ProfileField label="Phone" value={ownProfileData.me.phone} />
                </dl>
                <Link href="/profile" className="btn btn-sm btn-accent mt-3">
                  Edit profile
                </Link>
              </div>
            ) : null}
          </aside>

          <div className="col-lg-8 community-member-main">
            <div className="community-member-portfolio" data-aos="fade-up">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <h2 className="h4 mb-0">Work showcase</h2>
                {isOwnProfile ? (
                  <Link href="/profile" className="btn btn-sm btn-accent">
                    Add your work
                  </Link>
                ) : null}
              </div>

              {projects.length === 0 ? (
                <div className="offering-block text-center py-5">
                  <p className="text-muted mb-0">
                    {isOwnProfile
                      ? "No showcase items yet. Add your first piece of work from your profile."
                      : "No showcase items yet."}
                  </p>
                </div>
              ) : (
                <div className="row g-4">
                  {projects.map((project) => {
                    const image = portfolioImage(project);
                    return (
                      <div key={project.id} className="col-md-6 col-lg-4">
                        <article className="community-portfolio-card h-100">
                          <div className="community-portfolio-card__media">
                            {image ? (
                              <img src={image} alt="" className="img-fluid" />
                            ) : (
                              <div className="community-portfolio-card__placeholder">
                                <i className="bi bi-image" aria-hidden />
                              </div>
                            )}
                          </div>
                          <div className="community-portfolio-card__body">
                            <h3 className="h6 mb-2">{project.title}</h3>
                            {project.description ? (
                              <p className="small text-muted mb-0">
                                {project.description}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
