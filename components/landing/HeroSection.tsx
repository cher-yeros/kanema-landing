import Link from "next/link";

const HERO_BG_IMAGE = "/img/hero/hero-bg.png";
const HERO_SHOWCASE_IMAGE = "/img/about/about-wide-2.png";

export function HeroSection() {
  return (
    <section id="hero" className="hero section">
      <div className="hero-bg" aria-hidden="true">
        <img
          src={HERO_BG_IMAGE}
          alt=""
          className="hero-bg-image"
          fetchPriority="high"
        />
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
              <h1>Canma — the home for Ethiopia&apos;s camera creatives</h1>
              <p>
                The official digital hub for photographers, videographers, and
                filmmakers: connect talent, discover opportunities, and grow
                together in one creative ecosystem.
              </p>
              <div className="hero-actions">
                <Link href="/community/join" className="btn btn-accent">
                  <i className="bi bi-arrow-right-circle me-2" />
                  Join the Community
                </Link>
                <Link href="/community#team" className="btn btn-ghost">
                  Explore Talent
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-5">
          <div className="col-lg-10" data-aos="fade-up" data-aos-delay="200">
            <div className="hero-showcase">
              <img
                src={HERO_SHOWCASE_IMAGE}
                alt="Ethiopian visual storytellers and creative work on Canma"
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
