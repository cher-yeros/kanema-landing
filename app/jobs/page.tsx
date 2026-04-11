import Link from "next/link";
import { landingImage } from "@/lib/landing-assets";

type ProductionRole = {
  title: string;
  tag: string;
  modality: string;
  summary: string;
  icon: string;
};

const OPEN_ROLES: ProductionRole[] = [
  {
    title: "1st Assistant Camera (commercial)",
    tag: "On set",
    modality: "Addis Ababa · 4-week block",
    summary:
      "Support principal photography on a brand campaign—lens swaps, marks, and close coordination with DP and operator. Portfolio-led shortlist; union-style safety expected on set.",
    icon: "bi-camera-video",
  },
  {
    title: "Gaffer / lighting team",
    tag: "On set",
    modality: "Addis Ababa · project basis",
    summary:
      "Rig and shape light for interview and product setups. Bring experience with LED and tungsten mixes, distro discipline, and fast turnarounds between setups.",
    icon: "bi-lightbulb",
  },
  {
    title: "Post-production coordinator",
    tag: "Post",
    modality: "Hybrid",
    summary:
      "Shepherd offline through grade and delivery—handles, versions, and notes between editor, colorist, and client. Familiarity with short-form commercial timelines preferred.",
    icon: "bi-collection-play",
  },
  {
    title: "Color assist (DaVinci)",
    tag: "Post",
    modality: "Remote-first",
    summary:
      "Prep timelines, match references, and support the colorist on documentary and branded pieces. Showreel or graded stills that demonstrate restrained, natural palettes.",
    icon: "bi-palette",
  },
];

export default function ProductionJobsPage() {
  return (
    <>
      <section id="jobs-hero" className="hero section">
        <div className="container">
          <div className="row gy-5 align-items-center">
            <div className="col-lg-7" data-aos="fade-up" data-aos-delay="100">
              <div className="hero-heading">
                <span className="badge-label">
                  Production opportunities · Set, crew, and post
                </span>
                <div className="d-flex flex-wrap gap-2 mt-3 mb-2">
                  <span className="featured-tag">Film &amp; commercial</span>
                  <span className="featured-tag">Crew &amp; post only</span>
                </div>
                <h1>Production job center</h1>
                <p>
                  Ethiopia&apos;s photographers and videographers deserve
                  visibility, structured networking, and fair access to
                  opportunity—this board keeps the focus on{" "}
                  <strong>production work</strong> (set, crew, and post) so
                  serious briefs do not get lost in general chatter.
                </p>
                <p className="lead mb-2">
                  Job postings, freelance gigs, collaborations, and grants—one
                  place to connect talent with demand across Ethiopia&apos;s
                  creative economy. Listings here are{" "}
                  <strong>production-only</strong>: call times, kit expectations,
                  and deliverables you can plan a career around.
                </p>
                <p className="small text-muted mb-0">
                  Questions about membership, partnerships, or listing an
                  opportunity? Reach the Kanema team on the contact page—we
                  route production briefs to the same desk that supports the
                  wider hub.
                </p>
                <div className="hero-actions mt-4">
                  <a href="#open-roles" className="btn btn-accent">
                    <i className="bi bi-briefcase me-2" />
                    Browse open roles
                  </a>
                  <Link href="/#contact" className="btn btn-ghost">
                    <i className="bi bi-envelope me-2" />
                    List a production role
                  </Link>
                  <Link href="/" className="btn btn-ghost">
                    <i className="bi bi-house me-2" />
                    Home
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-5" data-aos="fade-left" data-aos-delay="200">
              <div className="showcase-image">
                <img
                  src={landingImage("illustration/illustration-15.webp")}
                  alt=""
                  className="img-fluid"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-production-jobs-work"
        className="why-us section"
        aria-labelledby="howItWorksHeading"
      >
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="intro-content text-center text-lg-start">
                <h2 id="howItWorksHeading" className="h3">
                  Why a production-only lane exists
                </h2>
                <p className="lead">
                  Full-time roles, freelance briefs, collaborations, and funding
                  signals—structured so demand meets skilled visual
                  storytellers. This lane mirrors how Kanema already surfaces{" "}
                  <Link href="/#services">opportunities on the platform</Link>,{" "}
                  but narrows the feed to{" "}
                  <strong>production-shaped work</strong> so call sheets,
                  technical roles, and post pipelines stay legible.
                </p>
                <div className="checklist">
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Connect talent with demand</h5>
                      <p>
                        From weddings to commercial campaigns, post and discover
                        roles, freelance gigs, collaborations, and funding
                        leads—here scoped to set, grip and electric, sound,
                        camera, and post.
                      </p>
                    </div>
                  </div>
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Showcase and be discovered</h5>
                      <p>
                        Present your best work in the curated showcase so
                        producers can move from your reel to a booked call
                        without leaving the Kanema ecosystem.
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
                        trends—support the same crews hiring through this board.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="open-roles"
        className="services section"
        aria-labelledby="openRolesHeading"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2 id="openRolesHeading">Open production roles</h2>
          <p>
            Explore each brief the way you explore talent on the platform—read
            the scope, note the modality, then follow up through Kanema with
            your reel, kit list, and availability.
          </p>
          <p className="small text-muted mb-0">
            Sample listings illustrate the production-only pattern; live hiring
            will follow the same card layout when roles are published through
            the team.
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {OPEN_ROLES.map((role) => (
              <div className="col-lg-6" key={role.title}>
                <div className="offering-block">
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    <i className={`bi ${role.icon}`} />
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{role.title}</h4>
                      <span className="featured-tag">{role.tag}</span>
                    </div>
                    <p className="small text-muted mb-2">{role.modality}</p>
                    <p>{role.summary}</p>
                    <Link
                      href="/#contact"
                      className="explore-btn d-inline-flex"
                    >
                      Apply via Kanema{" "}
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-5">
            <div className="col-12" data-aos="fade-up" data-aos-delay="200">
              <div className="action-banner">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h3>Ready to grow with Ethiopia&apos;s visual community?</h3>
                    <p>
                      Join Kanema to showcase your work, meet clients, and
                      access opportunities, events, and resources in one trusted
                      hub—then keep this production board on speed-dial when
                      crews go green.
                    </p>
                  </div>
                  <div className="col-lg-4 text-lg-end text-center">
                    <Link href="/#contact" className="action-btn">
                      Become a member
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
