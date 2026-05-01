"use client";

import { landingImage } from "@/lib/landing-assets";

import { TeamLeadersSwiper } from "./TeamLeadersSwiper";
import { fetchTalents, type PublicTalent } from "@/lib/public-graphql";
import { useEffect, useMemo, useState } from "react";

export function TeamSection() {
  const [talents, setTalents] = useState<PublicTalent[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTalents()
      .then((rows) => {
        if (!alive) return;
        setTalents(rows.length ? rows : []);
      })
      .catch(() => {
        if (!alive) return;
        setTalents([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const memberCards = useMemo(() => {
    if (talents == null || talents.length === 0) {
      return [
        {
          img: "person/person-f-7.webp",
          name: "Liya Solomon",
          role: "Fashion and portrait photographer",
          delay: 200,
        },
        {
          img: "person/person-m-2.webp",
          name: "Biniam Alemayehu",
          role: "Commercial cinematographer",
          delay: 250,
        },
        {
          img: "person/person-f-11.webp",
          name: "Rahel Demissie",
          role: "Wedding photo and film",
          delay: 300,
        },
        {
          img: "person/person-m-8.webp",
          name: "Samuel Tesfaye",
          role: "Documentary director / DP",
          delay: 350,
        },
      ];
    }

    return talents.slice(0, 4).map((t, idx) => {
      const role =
        t.headline ??
        (() => {
          try {
            const parsed = t.specialties ? (JSON.parse(t.specialties) as unknown) : null;
            if (Array.isArray(parsed)) {
              const first = parsed.find((x) => typeof x === "string") as string | undefined;
              if (first) return first;
            }
          } catch {
            // ignore invalid JSON
          }
          return "Creative member";
        })();
      return {
        img: t.avatar_url ?? "person/person-m-2.webp",
        name: t.user.full_name,
        role: t.city ? `${role} · ${t.city}` : role,
        delay: 200 + idx * 50,
      };
    });
  }, [talents]);

  return (
    <section id="team" className="team section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Community</h2>
        <p>
          Connect with professionals, collaborate on projects, and share
          knowledge—Kanema is a growing network for Ethiopian visual
          storytellers and the partners who hire them.
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

        <div className="row g-4 mt-4">
          {memberCards.map((m) => (
            <div
              key={m.name}
              className="col-lg-3 col-md-6"
              data-aos="fade-up"
              data-aos-delay={m.delay}
            >
              <div className="member-card">
                <div className="member-photo">
                  <img
                    src={landingImage(m.img)}
                    className="img-fluid"
                    alt="Team member"
                  />
                  <div className="social-links">
                    <a href="#contact" aria-label="Contact">
                      <i className="bi bi-envelope" />
                    </a>
                    <a href="#services" aria-label="Opportunities">
                      <i className="bi bi-briefcase" />
                    </a>
                  </div>
                </div>
                <div className="member-details">
                  <h5>{m.name}</h5>
                  <span>{m.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div
              className="leaders-section"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h4 className="leaders-heading">Mentors and industry voices</h4>
              <TeamLeadersSwiper />
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
                      Kanema connects talent with demand—post roles, freelance
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
