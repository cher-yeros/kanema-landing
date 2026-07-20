"use client";

import { useQuery } from "@apollo/client/react";

import { communityRoleLabel } from "@/lib/community-member-labels";
import { sortCommunityMembersWithCurrentUserFirst } from "@/lib/community-member-sort";
import { COMMUNITY_LIST_AUTH_QUERY } from "@/lib/graphql/community-join";
import { memberImageSrc } from "@/lib/member-image";
import {
  fetchCommunityMembers,
  type PublicCommunityMember,
} from "@/lib/public-graphql";
import { communityMemberPath } from "@/lib/site-url";
import { selectAuthToken, selectAuthUser } from "@/lib/store/auth-selectors";
import { useAppSelector } from "@/lib/store/hooks";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
};

type CommunityListAuthQuery = {
  me: { id: string } | null;
  myCommunityJoin: { id: string; status: string } | null;
};

export function TeamSection({ initialMembers }: TeamSectionProps = {}) {
  const token = useAppSelector(selectAuthToken);
  const sessionUser = useAppSelector(selectAuthUser);
  const { data: authData } = useQuery<CommunityListAuthQuery>(
    COMMUNITY_LIST_AUTH_QUERY,
    { skip: !token },
  );
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

    const myJoin = authData?.myCommunityJoin;
    const ordered = sortCommunityMembersWithCurrentUserFirst(members, {
      userId: sessionUser?.id ?? authData?.me?.id,
      communityJoinId: myJoin?.status === "APPROVED" ? myJoin.id : null,
    });

    return ordered.map((m, idx) => {
      const roleLabel = communityRoleLabel(m.role);
      const role = m.city ? `${roleLabel} · ${m.city}` : roleLabel;
      return {
        key: m.id,
        href: communityMemberPath(m.slug),
        img: memberImageSrc(m.avatar_url),
        name: m.full_name,
        role,
        delay: 200 + idx * 50,
        portfolioUrl: m.portfolio_url,
      };
    });
  }, [authData?.me?.id, authData?.myCommunityJoin, members, sessionUser?.id]);

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
            Approved members will appear here after joining.
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

        <div
          className="text-center mt-5"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Link href="/community/join" className="dispatch-btn">
            <i className="bi bi-person-plus-fill" />
            <span>Join the community</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
