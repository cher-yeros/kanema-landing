"use client";

import { communityRoleLabel } from "@/lib/community-member-labels";
import { memberImageSrc } from "@/lib/member-image";
import {
  fetchTestimonials,
  type PublicTestimonial,
} from "@/lib/public-graphql";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo, useState } from "react";

function testimonialSlide(t: PublicTestimonial) {
  const member = t.community_member;
  const name = member?.full_name ?? t.author_name;
  const img = memberImageSrc(
    member?.avatar_url ?? t.avatar_url,
    "person/person-m-9.webp",
  );
  const roleLabel = member
    ? communityRoleLabel(member.role)
    : (t.author_title ?? "Canma community");
  const role = member?.city
    ? `${roleLabel} · ${member.city}`
    : member
      ? roleLabel
      : [t.author_title, t.author_city].filter(Boolean).join(", ") ||
        "Canma community";

  return {
    id: t.id,
    img,
    name,
    role,
    text: t.quote,
  };
}

export function TestimonialsSection({
  initialRows,
}: {
  initialRows?: PublicTestimonial[];
}) {
  const [rows, setRows] = useState<PublicTestimonial[] | null>(
    initialRows ?? null,
  );

  useEffect(() => {
    if (initialRows !== undefined) return;
    let alive = true;
    fetchTestimonials()
      .then((data) => {
        if (!alive) return;
        setRows(data);
      })
      .catch(() => {
        if (!alive) return;
        setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [initialRows]);

  const slides = useMemo(() => {
    if (!rows?.length) return [];
    return rows.map(testimonialSlide);
  }, [rows]);

  return (
    <section
      id="testimonials"
      className="testimonials section light-background"
    >
      <div className="container section-title" data-aos="fade-up">
        <h2>Community voices</h2>
        <p>
          Creatives and clients sharing how visibility, collaboration, and
          opportunity improve when Ethiopia&apos;s camera professionals share
          one hub.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        {rows === null ? (
          <p className="text-center text-secondary mb-0">
            Loading community voices…
          </p>
        ) : slides.length === 0 ? (
          <p className="text-center text-secondary mb-0">
            Published voices from the community will appear here.
          </p>
        ) : (
          <Swiper
            className="init-swiper"
            modules={[Autoplay, Pagination]}
            loop={slides.length > 1}
            speed={600}
            autoplay={{ delay: 5000 }}
            slidesPerView={1}
            spaceBetween={24}
            pagination={{ clickable: true }}
            breakpoints={{
              768: { slidesPerView: Math.min(2, slides.length) },
              1200: { slidesPerView: Math.min(3, slides.length) },
            }}
          >
            {slides.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="testimonial-item">
                  <img src={t.img} className="testimonial-img" alt={t.name} />
                  <h3>{t.name}</h3>
                  <h4>{t.role}</h4>
                  <div className="stars">
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                  </div>
                  <p>
                    <i className="bi bi-quote quote-icon-left" />
                    <span>{t.text}</span>
                    <i className="bi bi-quote quote-icon-right" />
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
