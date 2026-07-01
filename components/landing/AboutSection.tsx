const ABOUT_IMAGE = "/img/about/about-us.png";

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
              <span className="tag-label">About Canma</span>
              <h2>One digital home for Ethiopia&apos;s visual industry</h2>
              <p>
                Canma unites photographers, videographers, and filmmakers in a
                single ecosystem—to showcase work, meet clients, and collaborate
                with peers. Our mission is to empower Ethiopian visual
                storytellers with visibility, opportunities, and professional
                growth. Our vision: Africa&apos;s leading platform for visual
                creatives and storytelling.
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
                See what Canma offers <i className="bi bi-arrow-right" />
              </a>
            </div>
          </div>

          <div
            className="col-lg-6 order-lg-1"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            <div className="gallery-grid">
              <div className="gallery-item">
                <img
                  src={ABOUT_IMAGE}
                  alt="Ethiopian visual creators collaborating in a studio"
                  className="img-fluid"
                  loading="lazy"
                />
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
