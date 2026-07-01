"use client";

import { FormEvent, useState } from "react";

import { SocialLinks } from "@/components/landing/SocialLinks";
import { SITE_CONTACT } from "@/lib/site-contact";

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("sent");
    }, 800);
  }

  return (
    <section id="contact" className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Contact us</h2>
        <p>
          Questions about membership, partnerships, or listing an opportunity?
          Reach the Canma team in Addis Ababa—we reply as quickly as we can.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row g-4 mb-5">
          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-down"
            data-aos-delay="150"
          >
            <div className="reach-card">
              <div className="reach-icon-wrap">
                <i className="bi bi-envelope-at" />
              </div>
              <h5>Email</h5>
              <p>
                {SITE_CONTACT.emails.map((email, index) => (
                  <span key={email}>
                    <a href={`mailto:${email}`}>{email}</a>
                    {index < SITE_CONTACT.emails.length - 1 ? <br /> : null}
                  </span>
                ))}
              </p>
              <span className="reach-note">
                Partnerships, press, and support
              </span>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-down"
            data-aos-delay="250"
          >
            <div className="reach-card">
              <div className="reach-icon-wrap">
                <i className="bi bi-telephone" />
              </div>
              <h5>Phone</h5>
              <p>
                <a href={SITE_CONTACT.phone.href}>
                  {SITE_CONTACT.phone.display}
                </a>
              </p>
              <span className="reach-note">Ethiopia country code +251</span>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-12"
            data-aos="fade-down"
            data-aos-delay="350"
          >
            <div className="reach-card">
              <div className="reach-icon-wrap">
                <i className="bi bi-geo-alt" />
              </div>
              <h5>Location</h5>
              <p>{SITE_CONTACT.location}</p>
              <span className="reach-note">
                Nationwide community, local roots
              </span>
            </div>
          </div>
        </div>

        <div
          className="row g-0 form-info-wrapper"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="col-lg-5">
            <div className="info-panel">
              <div className="panel-content">
                <h3>Collaborate with Canma</h3>
                <p>
                  Whether you are joining as a creative, hiring talent, or
                  sponsoring programs, we will route your message to the right
                  person on the team.
                </p>

                <div
                  className="panel-stats"
                  data-aos="zoom-in"
                  data-aos-delay="300"
                >
                  <div className="row g-3">
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>Hub</strong>
                        <span>Showcase</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>Gigs</strong>
                        <span>Opportunities</span>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="single-stat">
                        <strong>Live</strong>
                        <span>Events</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="panel-social"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <span>Follow Canma</span>
                  <div className="social-icons">
                    <SocialLinks />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="form-panel">
              <div className="form-intro">
                <i className="bi bi-pencil-square" />
                <h3>Send a message</h3>
                <p>
                  Tell us if you are applying for membership, listing work,
                  proposing a partnership, or looking for talent—we read every
                  note.
                </p>
              </div>

              <form className="php-email-form" onSubmit={onSubmit}>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="John Doe"
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="john@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Topic</label>
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Membership, partnership, talent request…"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Your Message</label>
                    <textarea
                      name="message"
                      className="form-control"
                      rows={5}
                      placeholder="Share timelines, links, or questions for the Canma team…"
                      required
                    />
                  </div>
                </div>

                <div className="my-3">
                  <div
                    className="loading"
                    style={{ display: status === "loading" ? "block" : "none" }}
                  >
                    Loading
                  </div>
                  <div
                    className="error-message"
                    style={{ display: status === "error" ? "block" : "none" }}
                  >
                    Something went wrong. Please try again.
                  </div>
                  <div
                    className="sent-message"
                    style={{ display: status === "sent" ? "block" : "none" }}
                  >
                    Your message has been sent. Thank you!
                  </div>
                </div>

                <button
                  type="submit"
                  className="dispatch-btn"
                  disabled={status === "loading"}
                >
                  <i className="bi bi-arrow-right-circle-fill" />
                  <span>Send to Canma</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
