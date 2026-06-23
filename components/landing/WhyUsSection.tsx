import { landingImage } from "@/lib/landing-assets";

export function WhyUsSection() {
  return (
    <section id="why-us" className="why-us section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Why Canma</h2>
        <p>
          Ethiopia&apos;s photographers and videographers deserve visibility,
          structured networking, and fair access to opportunity—Canma exists to
          close that gap.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-5 align-items-center mb-5">
          <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
            <div className="intro-content">
              <h3>A centralized home for visual storytellers</h3>
              <p className="lead">
                Many talented creatives struggle with limited reach, fragmented
                networks, and gigs that never leave private chats. Canma brings
                portfolios, opportunities, events, and learning into one trusted
                ecosystem.
              </p>

              <div className="checklist">
                <div className="check-item">
                  <i className="bi bi-arrow-right-circle-fill" />
                  <div>
                    <h5>Showcase and be discovered</h5>
                    <p>
                      Present your best work in a curated showcase so clients
                      and collaborators can find the right specialty fast.
                    </p>
                  </div>
                </div>

                <div className="check-item">
                  <i className="bi bi-arrow-right-circle-fill" />
                  <div>
                    <h5>Connect talent with demand</h5>
                    <p>
                      From weddings to commercial campaigns, post and discover
                      roles, freelance gigs, collaborations, and funding leads.
                    </p>
                  </div>
                </div>

                <div className="check-item">
                  <i className="bi bi-arrow-right-circle-fill" />
                  <div>
                    <h5>Learn, meet, and grow</h5>
                    <p>
                      Workshops, masterclasses, exhibitions, festivals, and
                      meetups—plus resources on craft, editing, and industry
                      trends.
                    </p>
                  </div>
                </div>
              </div>

              <div className="action-btns">
                <a href="#contact" className="btn btn-accent">
                  Join the community
                </a>
                <a href="#showcase" className="btn btn-ghost">
                  Explore talent
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
            <div className="showcase-image">
              <img
                src={landingImage("illustration/illustration-15.webp")}
                alt=""
                className="img-fluid"
              />
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div
            className="col-lg-4 col-md-6"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <div className="highlight-box">
              <div className="highlight-header">
                <div className="icon-circle">
                  <i className="bi bi-palette-fill" />
                </div>
                <div className="counter-badge">
                  <span
                    className="purecounter"
                    data-purecounter-start="0"
                    data-purecounter-end="5"
                    data-purecounter-duration="2"
                  >
                    5
                  </span>
                  <span className="counter-unit">showcase lanes</span>
                </div>
              </div>
              <h4>Showcase-first discovery</h4>
              <p>
                Weddings, fashion, documentary, commercial, and film—browse
                categories that reflect how clients actually search for talent.
              </p>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <div className="highlight-box">
              <div className="highlight-header">
                <div className="icon-circle">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <div className="counter-badge">
                  <span
                    className="purecounter"
                    data-purecounter-start="0"
                    data-purecounter-end="4"
                    data-purecounter-duration="2"
                  >
                    4
                  </span>
                  <span className="counter-unit">opportunity types</span>
                </div>
              </div>
              <h4>Jobs, gigs, grants</h4>
              <p>
                Full-time roles, freelance briefs, collaborations, and funding
                signals—structured so demand meets skilled visual storytellers.
              </p>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <div className="highlight-box">
              <div className="highlight-header">
                <div className="icon-circle">
                  <i className="bi bi-award-fill" />
                </div>
                <div className="counter-badge">
                  <span
                    className="purecounter"
                    data-purecounter-start="0"
                    data-purecounter-end="6"
                    data-purecounter-duration="2"
                  >
                    6
                  </span>
                  <span className="counter-unit">member benefits</span>
                </div>
              </div>
              <h4>Membership that opens doors</h4>
              <p>
                Profiles, client exposure, opportunities, events, peer networks,
                and recognition—built for sustainable creative careers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
