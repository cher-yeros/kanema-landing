import Link from "next/link";

export function ServicesSection() {
  return (
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Platform</h2>
        <p>
          Explore talent, showcase work, find opportunities, learn together—and
          unlock membership benefits built for Ethiopian visual storytellers.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="150">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-camera-reels" />
              </div>
              <div className="offering-body">
                <div className="offering-header">
                  <h4>
                    <a href="#showcase">Explore Talent</a>
                  </h4>
                  <span className="featured-tag">Core</span>
                </div>
                <p>
                  Discover photographers and videographers across wedding,
                  commercial, documentary, fashion and portrait, events, and
                  film—search, filter, and connect with the right creative.
                </p>
                <a href="#showcase" className="explore-btn">
                  Browse gallery <i className="bi bi-chevron-right" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="250">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-images" />
              </div>
              <div className="offering-body">
                <h4>
                  <a href="#showcase">Showcase</a>
                </h4>
                <p>
                  A curated collection of outstanding work from Ethiopian
                  creatives—weddings, fashion, documentary, commercial, and
                  film—so clients can experience the industry&apos;s
                  storytelling power.
                </p>
                <a href="#showcase" className="explore-btn">
                  View categories <i className="bi bi-chevron-right" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="200">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-briefcase" />
              </div>
              <div className="offering-body">
                <h4>
                  <a href="#contact">Opportunities</a>
                </h4>
                <p>
                  Job postings, freelance gigs, collaborations, and grants—one
                  place to connect talent with demand across Ethiopia&apos;s
                  creative economy.
                </p>
                <a href="#contact" className="explore-btn">
                  Share or find work <i className="bi bi-chevron-right" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="300">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-calendar-event" />
              </div>
              <div className="offering-body">
                <h4>
                  <Link href="/events">Events and trainings</Link>
                </h4>
                <p>
                  Workshops, masterclasses, exhibitions, film festivals, and
                  networking meetups—stay current, learn from peers, and grow
                  your craft.
                </p>
                <Link href="/events" className="explore-btn">
                  View events <i className="bi bi-chevron-right" />
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="350">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-journal-richtext" />
              </div>
              <div className="offering-body">
                <h4>
                  <a href="#why-us">Resources</a>
                </h4>
                <p>
                  Photography tips, videography techniques, editing tutorials,
                  and industry insights—practical content to sharpen your skills
                  and business.
                </p>
                <a href="#why-us" className="explore-btn">
                  Why Canma exists <i className="bi bi-chevron-right" />
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-6" data-aos="zoom-in" data-aos-delay="400">
            <div className="offering-block">
              <div className="offering-indicator" />
              <div className="offering-icon-wrap">
                <i className="bi bi-person-badge" />
              </div>
              <div className="offering-body">
                <h4>
                  <a href="#contact">Membership</a>
                </h4>
                <p>
                  Portfolio profiles, client exposure, opportunities, event
                  invites, professional networking, and industry recognition—all
                  designed to help you grow with Canma.
                </p>
                <a href="#contact" className="explore-btn">
                  Become a member <i className="bi bi-chevron-right" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12" data-aos="fade-up" data-aos-delay="200">
            <div className="action-banner">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h3>Ready to grow with Ethiopia&apos;s visual community?</h3>
                  <p>
                    Join Canma to showcase your work, meet clients, and access
                    opportunities, events, and resources in one trusted hub.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end text-center">
                  <a href="#contact" className="action-btn">
                    Become a member
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
