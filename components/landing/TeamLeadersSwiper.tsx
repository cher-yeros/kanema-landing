"use client";

import { communityRoleLabel } from "@/lib/community-member-labels";
import { memberImageSrc } from "@/lib/member-image";
import {
  fetchCommunityMembers,
  fetchTeamMembers,
  type PublicCommunityMember,
  type PublicTeamMember,
} from "@/lib/public-graphql";
import { landingImage } from "@/lib/landing-assets";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo, useState } from "react";

const leaders = [
  {
    img: "person/person-m-3.webp",
    role: "Festival programmer",
    name: "Elias Worku",
    text: "Canma gives emerging filmmakers a credible surface to meet programmers and funders—visibility is half the battle for first features.",
  },
  {
    img: "person/person-f-9.webp",
    role: "Commercial EP",
    name: "Marta Gebre",
    text: "Agencies need vetted crews fast. A shared hub for reels, rates, and specialties reduces friction for brands and production partners alike.",
  },
  {
    img: "person/person-m-11.webp",
    role: "Documentary mentor",
    name: "Tewodros Afework",
    text: "Workshops only work if people know they exist. Centralizing trainings and meetups helps juniors build craft without relying on private invites.",
  },
  {
    img: "person/person-f-2.webp",
    role: "Photo collective lead",
    name: "Aster Mulugeta",
    text: "Community is more than followers—it is contracts, ethics, and shared standards. Canma nudges the industry toward that professionalism.",
  },
];

type LeaderSlide = {
  key: string;
  img: string;
  role: string;
  name: string;
  text: string;
};

function mapAdvisor(member: PublicTeamMember): LeaderSlide {
  return {
    key: `advisor-${member.id}`,
    img: memberImageSrc(member.photo_url, "person/person-m-3.webp"),
    role: member.role_title,
    name: member.full_name,
    text: member.bio ?? "Industry voice supporting Canma’s community.",
  };
}

function mapFeaturedMember(member: PublicCommunityMember): LeaderSlide {
  const roleLabel = communityRoleLabel(member.role);
  const role = member.city ? `${roleLabel} · ${member.city}` : roleLabel;
  return {
    key: `community-${member.id}`,
    img: memberImageSrc(member.avatar_url, "person/person-m-3.webp"),
    role,
    name: member.full_name,
    text:
      member.message?.trim() ||
      "Featured Canma community member sharing craft and industry perspective.",
  };
}

export function TeamLeadersSwiper() {
  const [remoteAdvisors, setRemoteAdvisors] = useState<
    PublicTeamMember[] | null
  >(null);
  const [featuredMembers, setFeaturedMembers] = useState<
    PublicCommunityMember[] | null
  >(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchTeamMembers(),
      fetchCommunityMembers({ featuredOnly: true }),
    ])
      .then(([advisors, featured]) => {
        if (!alive) return;
        setRemoteAdvisors(advisors);
        setFeaturedMembers(featured);
      })
      .catch(() => {
        if (!alive) return;
        setRemoteAdvisors([]);
        setFeaturedMembers([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const slides = useMemo((): LeaderSlide[] => {
    const advisorMapped = (remoteAdvisors ?? [])
      .filter((x) => x.category === "ADVISOR")
      .map(mapAdvisor);

    const featuredMapped = (featuredMembers ?? []).map(mapFeaturedMember);

    if (advisorMapped.length > 0 || featuredMapped.length > 0) {
      return [...advisorMapped, ...featuredMapped];
    }

    if (remoteAdvisors == null && featuredMembers == null) {
      return leaders.map((x) => ({
        key: x.name,
        img: landingImage(x.img),
        role: x.role,
        name: x.name,
        text: x.text,
      }));
    }

    return [];
  }, [featuredMembers, remoteAdvisors]);

  return (
    <Swiper
      className="leaders-carousel init-swiper"
      modules={[Autoplay, Pagination]}
      loop={slides.length > 1}
      speed={600}
      autoplay={{ delay: 5000 }}
      spaceBetween={24}
      slidesPerView={1}
      pagination={{ clickable: true }}
      breakpoints={{
        768: { slidesPerView: 2 },
      }}
    >
      {slides.map((leader) => (
        <SwiperSlide key={leader.key}>
          <div className="leader-panel">
            <div className="row g-0 align-items-center">
              <div className="col-sm-5">
                <div className="panel-image">
                  <img src={leader.img} className="img-fluid" alt="" />
                </div>
              </div>
              <div className="col-sm-7">
                <div className="panel-info">
                  <span className="role-tag">{leader.role}</span>
                  <h5>{leader.name}</h5>
                  <p>{leader.text}</p>
                  <div className="panel-socials">
                    <a href="mailto:info@canma.et" aria-label="Email">
                      <i className="bi bi-envelope" />
                    </a>
                    <a href="#" aria-label="LinkedIn">
                      <i className="bi bi-linkedin" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
