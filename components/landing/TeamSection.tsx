"use client";

import { communityRoleLabel } from "@/lib/community-member-labels";
import { memberImageSrc } from "@/lib/member-image";
import {
  fetchCommunityMembers,
  type PublicCommunityMember,
  type PublicTeamMember,
} from "@/lib/public-graphql";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { TeamLeadersSwiper } from "./TeamLeadersSwiper";

type MemberCard = {
  key: string;
  href: string;
  img: string;
  name: string;
  role: string;
  delay: number;
  portfolioUrl?: string | null;
};

type TeamSectionProps = {
  initialMembers?: PublicCommunityMember[];
  initialTeamMembers?: PublicTeamMember[];
  initialFeaturedMembers?: PublicCommunityMember[];
};

export function TeamSection({
  initialMembers,
  initialTeamMembers,
  initialFeaturedMembers,
}: TeamSectionProps = {}) {
  const [members, setMembers] = useState<PublicCommunityMember[] | null>(
    initialMembers ?? null,
  );

  useEffect(() => {
    if (initialMembers !== undefined) return;
    let alive = true;
    fetchCommunityMembers()
      .then((rows) => {
        if (!alive) return;
        setMembers(rows);
      })
      .catch(() => {
        if (!alive) return;
        setMembers([]);
      });
    return () => {
      alive = false;
    };
  }, [initialMembers]);

  const memberCards = useMemo((): MemberCard[] => {
    if (members == null) {
      return [];
    }
    if (members.length === 0) {
      return [];
    }

    return members.map((m, idx) => {
      const roleLabel = communityRoleLabel(m.role);
      const role = m.city ? `${roleLabel} · ${m.city}` : roleLabel;
      return {
        key: m.id,
        href: `/community/${m.id}`,
        img: memberImageSrc(m.avatar_url, "person/person-m-2.webp"),
        name: m.full_name,
        role,
        delay: 200 + idx * 50,
        portfolioUrl: m.portfolio_url,
      };
    });
  }, [members]);

  return (
    <section id="team" className="team section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Community</h2>
        <p>
          Connect with professionals, collaborate on projects, and share
          knowledge—Canma is a growing network for Ethiopian visual storytellers
          and the partners who hire them.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div
              className="intro-block text-center"
              data-aos="fade-down"
              data-aos-delay="150"
            >
              <div className="stats-badges">
                <div className="badge-item">
                  <i className="bi bi-people" />
                  <strong>Network</strong>
                  <span>Photographers and filmmakers</span>
                </div>
                <div className="badge-item">
                  <i className="bi bi-building" />
                  <strong>Hub</strong>
                  <span>Showcase and opportunities</span>
                </div>
                <div className="badge-item">
                  <i className="bi bi-globe2" />
                  <strong>Ethiopia</strong>
                  <span>Addis and regions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {members === null ? (
          <p
            className="text-center text-secondary mt-4 mb-0"
            data-aos="fade-up"
            data-aos-delay="180"
          >
            Loading community members…
          </p>
        ) : null}

        {members != null && members.length === 0 ? (
          <p
            className="text-center text-secondary mt-4 mb-0"
            data-aos="fade-up"
            data-aos-delay="180"
          >
            Approved members will appear here after joining.{" "}
            <a href="#join">Apply to join</a>.
          </p>
        ) : null}

        {memberCards.length > 0 ? (
          <div className="row g-4 mt-4">
            {memberCards.map((m) => (
              <div
                key={m.key}
                className="col-lg-3 col-md-6"
                data-aos="fade-up"
                data-aos-delay={m.delay}
              >
                <Link
                  href={m.href}
                  className="member-card member-card--link"
                  aria-label={`View ${m.name}'s profile`}
                >
                  <div className="member-photo">
                    <img src={m.img} className="img-fluid" alt={m.name} />
                    <div className="social-links">
                      {m.portfolioUrl ? (
                        <span aria-hidden>
                          <i className="bi bi-link-45deg" />
                        </span>
                      ) : (
                        <span aria-hidden>
                          <i className="bi bi-person" />
                        </span>
                      )}
                      <span aria-hidden>
                        <i className="bi bi-arrow-right" />
                      </span>
                    </div>
                  </div>
                  <div className="member-details">
                    <h5>{m.name}</h5>
                    <span>{m.role}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : null}

        <div className="row mt-5">
          <div className="col-12">
            <div
              className="leaders-section"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h4 className="leaders-heading">Mentors and industry voices</h4>
              <TeamLeadersSwiper
                initialTeamMembers={initialTeamMembers}
                initialFeaturedMembers={initialFeaturedMembers}
              />
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-10 offset-lg-1">
            <div
              className="careers-banner"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <div className="row align-items-center">
                <div className="col-md-7">
                  <div className="banner-text">
                    <div className="banner-badge">
                      <i className="bi bi-stars" /> Opportunities
                    </div>
                    <h4>List a gig, grant, or collaboration</h4>
                    <p>
                      Canma connects talent with demand—post roles, freelance
                      briefs, and partnership calls so the right creatives see
                      them first.
                    </p>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="banner-actions">
                    <a href="#contact" className="action-btn primary">
                      Post an opportunity
                    </a>
                    <a href="#services" className="action-btn secondary">
                      Platform overview
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
