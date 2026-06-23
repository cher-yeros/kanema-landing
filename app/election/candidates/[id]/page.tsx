"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { CANDIDATE_QUERY } from "@/lib/election-graphql";
import { landingImage } from "@/lib/landing-assets";
import type { CandidateQuery } from "@/types/election-apollo";

function parsePortfolio(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export default function CandidateProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, loading, error } = useQuery<CandidateQuery>(CANDIDATE_QUERY, {
    variables: { id },
    skip: !id,
  });

  const c = data?.candidate ?? null;

  if (loading) {
    return (
      <section className="hero section">
        <div className="container">
          <p className="text-muted small">Loading profile…</p>
        </div>
      </section>
    );
  }
  if (error || !c) {
    return (
      <section className="hero section">
        <div className="container section-title">
          <h1>Candidate not found</h1>
          <p className="text-muted">
            This profile may not exist yet, or is still under review—similar to
            listings elsewhere on the hub.
          </p>
          <Link href="/election" className="btn btn-accent mt-3">
            Back to ballot
          </Link>
        </div>
      </section>
    );
  }

  const portfolio = parsePortfolio(c.portfolio_urls);

  return (
    <>
      <section className="hero section">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="showcase-image">
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image_url}
                    alt=""
                    className="img-fluid rounded-3"
                  />
                ) : (
                  <img
                    src={landingImage("illustration/illustration-15.webp")}
                    alt=""
                    className="img-fluid"
                  />
                )}
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <div className="hero-heading">
                <span className="badge-label">Candidate profile</span>
                <div className="d-flex flex-wrap gap-2 mt-2 mb-2">
                  {c.approved ? (
                    <span className="featured-tag">Approved candidate</span>
                  ) : (
                    <span className="featured-tag">Pending review</span>
                  )}
                </div>
                <h1>{c.user.full_name}</h1>
                <p className="lead">
                  {c.bio ??
                    "A member of the Canma community standing for the presidential ballot."}
                </p>
                <div className="hero-actions">
                  <Link href="/election" className="btn btn-accent">
                    <i className="bi bi-arrow-left-circle me-2" />
                    Back to ballot to vote
                  </Link>
                  <Link href="/" className="btn btn-ghost">
                    Home
                  </Link>
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Voting uses a confirmation step on the ballot page so your
                  choice is deliberate and recorded once on the server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us section">
        <div className="container">
          <div className="row gy-5">
            <div className="col-lg-6" data-aos="fade-up">
              <div className="intro-content">
                <h3>Manifesto</h3>
                <p className="lead" style={{ whiteSpace: "pre-wrap" }}>
                  {c.manifesto ?? "—"}
                </p>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <div className="intro-content">
                <h3>Experience</h3>
                <p className="lead" style={{ whiteSpace: "pre-wrap" }}>
                  {c.experience ?? "—"}
                </p>
                {portfolio.length > 0 ? (
                  <>
                    <h3 className="mt-4">Portfolio</h3>
                    <ul className="checklist list-unstyled">
                      {portfolio.map((url) => (
                        <li key={url} className="mb-2">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
