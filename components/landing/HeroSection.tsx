"use client";

import { landingImage } from "@/lib/landing-assets";
import { useEffect, useRef } from "react";

const HERO_BG_VIDEO_MP4 =
  "https://res.cloudinary.com/di1hpum4d/video/upload/v1777578031/vecteezy_a-caucasian-male-filmmaker-focuses-intently-on-directing-a_51583040_fdxteg.mp4";

/** JPG frame derived on Cloudinary (`so_3`) — visible immediately if autoplay stalls. */
const HERO_BG_VIDEO_POSTER =
  "https://res.cloudinary.com/di1hpum4d/video/upload/so_3,f_jpg,q_auto/v1777578031/vecteezy_a-caucasian-male-filmmaker-focuses-intently-on-directing-a_51583040_fdxteg.jpg";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.defaultMuted = true;
    v.playbackRate = 0.8;
    const tryPlay = () => {
      void v.play().catch(() => {});
    };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);
    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <section id="hero" className="hero section">
      <div className="hero-bg-video" aria-hidden="true">
        <video
          ref={videoRef}
          poster={HERO_BG_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={HERO_BG_VIDEO_MP4} type="video/mp4" />
        </video>
      </div>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div
            className="col-lg-8 text-center"
            data-aos="zoom-in"
            data-aos-delay="100"
          >
            <div className="hero-heading">
              <span className="badge-label">
                Empowering Ethiopian Visual Storytellers
              </span>
              <h1>
                Kanema (ካንማ) — the home for Ethiopia&apos;s camera creatives
              </h1>
              <p>
                The official digital hub for photographers, videographers, and
                filmmakers: connect talent, discover opportunities, and grow
                together in one creative ecosystem.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn btn-accent">
                  <i className="bi bi-arrow-right-circle me-2" />
                  Join the Community
                </a>
                <a href="#showcase" className="btn btn-ghost">
                  Explore Talent
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-5">
          <div className="col-lg-10" data-aos="fade-up" data-aos-delay="200">
            <div className="hero-showcase">
              <img
                src={landingImage("about/about-wide-2.webp")}
                alt="Ethiopian visual storytellers and creative work on Kanema"
                className="img-fluid"
              />
              <div className="stats-overlay">
                <div className="row g-0">
                  <div className="col-4">
                    <div className="stat-card">
                      <span
                        className="stat-value purecounter"
                        data-purecounter-start="0"
                        data-purecounter-end="500"
                        data-purecounter-duration="1"
                      />
                      <span className="stat-text">Creatives and teams</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="stat-card">
                      <span
                        className="stat-value purecounter"
                        data-purecounter-start="0"
                        data-purecounter-end="40"
                        data-purecounter-duration="1"
                      />
                      <span className="stat-text">Specialties</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="stat-card">
                      <span
                        className="stat-value purecounter"
                        data-purecounter-start="0"
                        data-purecounter-end="50"
                        data-purecounter-duration="1"
                      />
                      <span className="stat-text">Events and trainings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-decoration">
        <div className="deco-line line-1" />
        <div className="deco-line line-2" />
        <div className="deco-dot dot-1" />
        <div className="deco-dot dot-2" />
      </div>
    </section>
  );
}
