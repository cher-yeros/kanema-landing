"use client";

import { landingImage } from "@/lib/landing-assets";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const leaders = [
  {
    img: "person/person-m-3.webp",
    role: "Festival programmer",
    name: "Elias Worku",
    text: "Kanema gives emerging filmmakers a credible surface to meet programmers and funders—visibility is half the battle for first features.",
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
    text: "Community is more than followers—it is contracts, ethics, and shared standards. Kanema nudges the industry toward that professionalism.",
  },
];

export function TeamLeadersSwiper() {
  return (
    <Swiper
      className="leaders-carousel init-swiper"
      modules={[Autoplay, Pagination]}
      loop
      speed={600}
      autoplay={{ delay: 5000 }}
      spaceBetween={24}
      slidesPerView={1}
      pagination={{ clickable: true }}
      breakpoints={{
        768: { slidesPerView: 2 },
      }}
    >
      {leaders.map((leader) => (
        <SwiperSlide key={leader.name}>
          <div className="leader-panel">
            <div className="row g-0 align-items-center">
              <div className="col-sm-5">
                <div className="panel-image">
                  <img
                    src={landingImage(leader.img)}
                    className="img-fluid"
                    alt=""
                  />
                </div>
              </div>
              <div className="col-sm-7">
                <div className="panel-info">
                  <span className="role-tag">{leader.role}</span>
                  <h5>{leader.name}</h5>
                  <p>{leader.text}</p>
                  <div className="panel-socials">
                    <a href="mailto:info@kanema.et" aria-label="Email">
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
