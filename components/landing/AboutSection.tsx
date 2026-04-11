import { landingImage } from "@/lib/landing-assets";

export function AboutSection() {
  return (
    <section id="about" className="about section">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-5">
          <div
            className="col-lg-6 order-lg-2"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="info-block">
              <span className="tag-label">About Kanema</span>
              <h2>One digital home for Ethiopia&apos;s visual industry</h2>
              <p>
                Kanema (ካነማ) unites photographers, videographers, and
                filmmakers in a single ecosystem—to showcase work, meet clients,
                and collaborate with peers. Our mission is to empower Ethiopian
                visual storytellers with visibility, opportunities, and
                professional growth. Our vision: Africa&apos;s leading platform
                for visual creatives and storytelling.
              </p>

              <div className="highlight-points">
                <div className="point-item">
                  <span className="point-number">01</span>
                  <div className="point-text">
                    <h5>
                      Limited visibility for outstanding portfolios and
                      reputations built offline.
                    </h5>
                  </div>
                </div>
                <div className="point-item">
                  <span className="point-number">02</span>
                  <div className="point-text">
                    <h5>
                      Few structured ways to network, learn, and find trusted
                      collaborators.
                    </h5>
                  </div>
                </div>
                <div className="point-item">
                  <span className="point-number">03</span>
                  <div className="point-text">
                    <h5>
                      Job and gig opportunities scattered across chats and word
                      of mouth.
                    </h5>
                  </div>
                </div>
              </div>

              <a href="#services" className="action-link">
                See what Kanema offers <i className="bi bi-arrow-right" />
              </a>
            </div>
          </div>

          <div
            className="col-lg-6 order-lg-1"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            <div className="gallery-grid">
              <div className="row g-3">
                <div className="col-7 d-flex">
                  <div className="gallery-item tall">
                    <img
                      src={landingImage("about/about-14.webp")}
                      alt=""
                      className="img-fluid"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="col-5 d-flex flex-column gap-3">
                  <div className="gallery-item">
                    <img
                      src={landingImage("about/about-square-12.webp")}
                      alt=""
                      className="img-fluid"
                      loading="lazy"
                    />
                  </div>
                  <div className="experience-badge">
                    <i className="bi bi-award-fill" />
                    <h4>ካነማ</h4>
                    <span>Built for Ethiopia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row gy-4 mt-5">
          <div className="col-md-4" data-aos="zoom-in" data-aos-delay="200">
            <div className="counter-box">
              <i className="bi bi-people-fill" />
              <div>
                <h3>Growing</h3>
                <p>Creative community</p>
              </div>
            </div>
          </div>
          <div className="col-md-4" data-aos="zoom-in" data-aos-delay="300">
            <div className="counter-box">
              <i className="bi bi-briefcase-fill" />
              <div>
                <h3>Central</h3>
                <p>Opportunities hub</p>
              </div>
            </div>
          </div>
          <div className="col-md-4" data-aos="zoom-in" data-aos-delay="400">
            <div className="counter-box">
              <i className="bi bi-trophy-fill" />
              <div>
                <h3>Curated</h3>
                <p>Showcase and recognition</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
