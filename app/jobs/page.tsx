import Link from "next/link";
import { landingImage } from "@/lib/landing-assets";
import { fetchProductionJobs } from "@/lib/public-graphql";

import { JobsMemberStrip } from "./jobs-member-strip";

export default async function ProductionJobsPage() {
  let jobs: Awaited<ReturnType<typeof fetchProductionJobs>> = [];
  try {
    jobs = await fetchProductionJobs();
  } catch {
    jobs = [];
  }

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
                  Ethiopia&apos;s photographers and videographers deserve visibility,
                  structured networking, and fair access to opportunity—this board
                  keeps the focus on <strong>production work</strong> (set, crew, and
                  post) so serious briefs do not get lost in general chatter.
                </p>
                <p className="lead mb-2">
                  Members can <strong>post production roles</strong> and browse open
                  briefs here. Applying requires a Kanema{" "}
                  <strong>member account</strong> (sign up with your phone, then verify
                  with OTP)—posters stay in charge of reviewing applicants themselves.
                </p>
                <p className="small text-muted mb-0">
                  Questions about moderation or spam? Reach the Kanema team on the
                  contact page.
                </p>
                <div className="hero-actions mt-4">
                  <a href="#open-roles" className="btn btn-accent">
                    <i className="bi bi-briefcase me-2" />
                    Browse open roles
                  </a>
                  <Link href="/jobs/new" className="btn btn-ghost">
                    <i className="bi bi-plus-circle me-2" />
                    Post a role
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

      <JobsMemberStrip />

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
                  How postings and applications work
                </h2>
                <p className="lead">
                  Create an account as a Kanema member, post a structured production
                  brief, and applicants sign in with the same hub account you use across
                  the community. Employers see applicants—including contact channel—on
                  a private applicant list tied to each job.
                </p>
                <div className="checklist">
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Poster</h5>
                      <p>
                        Any signed-in Kanema member can publish an open brief. Closed or
                        filled roles stay visible to you while new applicants pause.
                      </p>
                    </div>
                  </div>
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Applicant</h5>
                      <p>
                        Only <strong>member</strong> accounts (not staff admin logins)
                        can send an application—with a note and portfolio links—for each
                        open role once.
                      </p>
                    </div>
                  </div>
                  <div className="check-item">
                    <i className="bi bi-arrow-right-circle-fill" />
                    <div>
                      <h5>Transparency</h5>
                      <p>
                        Public listings show poster name counts and scope; applicant
                        contact details are shared only with the poster and platform
                        administrators.
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
            Live briefs submitted by Kanema members. Read the scope, modalility, then
            open a role for full detail and member-only applications.
          </p>
          <p className="small text-muted mb-0">
            No active listings yet? Anyone signed in can start one from{" "}
            <Link href="/jobs/new" className="link-body-emphasis">
              Post a role
            </Link>
            .
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {jobs.map((role) => (
              <div className="col-lg-6" key={role.id}>
                <div className="offering-block">
                  <div className="offering-indicator" />
                  <div className="offering-icon-wrap">
                    <i className="bi bi-briefcase" />
                  </div>
                  <div className="offering-body">
                    <div className="offering-header">
                      <h4>{role.title}</h4>
                      <span className="featured-tag">
                        {role.role_tag || "Production"}
                      </span>
                    </div>
                    <p className="small text-muted mb-2">
                      {[role.location, role.modality].filter(Boolean).join(" · ") ||
                        "Modality · location TBC"}
                      {" · "}
                      Posted by {role.poster.full_name}
                      {role.application_count > 0
                        ? ` · ${role.application_count} applicant${role.application_count === 1 ? "" : "s"}`
                        : null}
                    </p>
                    <p className="text-truncate-3-lines" style={{ minHeight: "4.5rem" }}>
                      {role.description}
                    </p>
                    <Link
                      href={`/jobs/${role.id}`}
                      className="explore-btn d-inline-flex"
                    >
                      View role{" "}
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jobs.length === 0 ?
            <div className="row mt-4">
              <div className="col-12">
                <div className="info-box text-center py-5">
                  <p className="lead mb-2">No production roles listed yet.</p>
                  <p className="text-muted mb-3">
                    Be the first to publish a scoped brief—or check back soon.
                  </p>
                  <Link href="/jobs/new" className="btn btn-accent">
                    Publish a brief
                  </Link>
                </div>
              </div>
            </div>
          : null}

          <div className="row mt-5">
            <div className="col-12" data-aos="fade-up" data-aos-delay="200">
              <div className="action-banner">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h3>Membership unlocks applicants and postings</h3>
                    <p>
                      Kanema ties production jobs to verified community accounts—you
                      can register with your phone from the ballot flow if you already
                      have not elsewhere.
                    </p>
                  </div>
                  <div className="col-lg-4 text-lg-end text-center">
                    <Link href="/election/register" className="action-btn">
                      Join as member
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
