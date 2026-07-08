"use client";

import Link from "next/link";
import { COMMUNITY_JOIN_INTEREST_OPTIONS } from "@/components/community/join-community-form-schema";
import { communityRoleLabel } from "@/lib/community-member-labels";
import { memberImageSrc } from "@/lib/member-image";
import type {
  PublicCommunityMember,
  PublicPortfolioProject,
} from "@/lib/public-graphql";

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

type CommunityMemberProfileClientProps = {
  member: PublicCommunityMember;
  projects: PublicPortfolioProject[];
};

export function CommunityMemberProfileClient({
  member,
  projects,
}: CommunityMemberProfileClientProps) {
  const avatarSrc = memberImageSrc(member.avatar_url, "person/person-m-2.webp");
  const roleLabel = communityRoleLabel(member.role);

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
          {member.city ? ` · ${member.city}` : ""}
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
            {member.message?.trim() ? (
              <p className="community-member-hero__bio">{member.message}</p>
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
            {member.portfolio_url ? (
              <a
                href={member.portfolio_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-secondary mt-3"
              >
                <i className="bi bi-link-45deg" aria-hidden /> External
                portfolio
              </a>
            ) : null}
          </div>
        </div>

        <div className="community-member-portfolio mt-5" data-aos="fade-up">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <h2 className="h4 mb-0">Work showcase</h2>
            <Link href="/profile" className="btn btn-sm btn-accent">
              Add your work
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="offering-block text-center py-5">
              <p className="text-muted mb-0">
                No showcase items yet. Members can upload work from their
                profile.
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
    </section>
  );
}
