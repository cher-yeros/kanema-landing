"use client";

import { memberImageSrc } from "@/lib/member-image";
import {
  fetchTestimonials,
  type PublicTestimonial,
} from "@/lib/public-graphql";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo, useState } from "react";

export function TestimonialsSection() {
  const [rows, setRows] = useState<PublicTestimonial[] | null>(null);

  useEffect(() => {
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
  }, []);

  const slides = useMemo(() => {
    if (!rows?.length) return [];
    return rows.map((t) => ({
      id: t.id,
      img: memberImageSrc(t.avatar_url, "person/person-m-9.webp"),
      name: t.author_name,
      role:
        [t.author_title, t.author_city].filter(Boolean).join(", ") ||
        "Canma community",
      text: t.quote,
    }));
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
