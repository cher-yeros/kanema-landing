"use client";

import { landingImage } from "@/lib/landing-assets";
import { fetchTestimonials, type PublicTestimonial } from "@/lib/public-graphql";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo, useState } from "react";

const testimonials = [
  {
    img: "person/person-m-9.webp",
    name: "Yohannes Bekele",
    role: "Commercial videographer, Addis Ababa",
    text: "Kanema gave our small crew a credible place to show treatments and past spots. Clients stopped asking for random Drive links—everything lives in one profile.",
  },
  {
    img: "person/person-f-5.webp",
    name: "Meron Tadesse",
    role: "Wedding photographer",
    text: "Bookings improved once couples could see a full wedding story, not just Instagram squares. The community feels serious about craft, not just likes.",
  },
  {
    img: "person/person-f-12.webp",
    name: "Selamawit Girma",
    role: "Documentary producer",
    text: "We posted a collaboration call for a short doc and found a sound recordist and colorist within days. That kind of matchmaking rarely happened in our old group chats.",
  },
  {
    img: "person/person-m-12.webp",
    name: "Daniel Haile",
    role: "Brand marketing lead",
    text: "Filtering by commercial and fashion work saved us weeks. We hired a photographer–videographer duo for a launch and the process was transparent end to end.",
  },
  {
    img: "person/person-m-13.webp",
    name: "Hanna Mekonnen",
    role: "Independent filmmaker",
    text: "Workshops and festival listings on Kanema keep me learning between shoots. It feels like the industry finally has a shared calendar and a front door for newcomers.",
  },
];

export function TestimonialsSection() {
  const [remote, setRemote] = useState<PublicTestimonial[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTestimonials()
      .then((rows) => {
        if (!alive) return;
        setRemote(rows.length ? rows : []);
      })
      .catch(() => {
        if (!alive) return;
        setRemote([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const slides = useMemo(() => {
    if (remote == null || remote.length === 0) return testimonials;
    return remote.map((t) => ({
      img: t.avatar_url ?? "person/person-m-9.webp",
      name: t.author_name,
      role:
        [t.author_title, t.author_city].filter(Boolean).join(", ") ||
        "Kanema community",
      text: t.quote,
    }));
  }, [remote]);

  return (
    <section
      id="testimonials"
      className="testimonials section light-background"
    >
      <div className="container section-title" data-aos="fade-up">
        <h2>Community voices</h2>
        <p>
          Creatives and clients sharing how visibility, collaboration, and
          opportunity improve when Ethiopia&apos;s camera professionals share one
          hub.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          className="init-swiper"
          modules={[Autoplay, Pagination]}
          loop
          speed={600}
          autoplay={{ delay: 5000 }}
          slidesPerView={1}
          spaceBetween={24}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
        >
          {slides.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="testimonial-item">
                <img
                  src={landingImage(t.img)}
                  className="testimonial-img"
                  alt=""
                />
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
      </div>
    </section>
  );
}
