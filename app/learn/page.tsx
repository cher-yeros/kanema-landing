import Link from "next/link";

import { fetchPublishedCourses } from "@/lib/public-graphql";

export default async function LearnCatalogPage() {
  let courses: Awaited<ReturnType<typeof fetchPublishedCourses>> = [];
  try {
    courses = await fetchPublishedCourses();
  } catch {
    courses = [];
  }

  return (
    <section className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h1>Learn</h1>
        <p>
          Self-paced lessons from the Kanema team and community. Sign in with
          your member account to enroll in free courses.
        </p>
        <p className="small text-muted mb-0">
          <Link href="/" className="link-body-emphasis">
            Home
          </Link>
          {" · "}
          <Link href="/election/login" className="link-body-emphasis">
            Member sign in
          </Link>
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          {courses.map((c) => (
            <div className="col-lg-6" key={c.id}>
              <article className="offering-block learn-course-card">
                <div className="offering-indicator" />
                <Link
                  href={`/learn/${c.slug}`}
                  className="learn-course-card__media"
                  tabIndex={-1}
                  aria-hidden
                >
                  {c.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail_url} alt={c.title} />
                  ) : (
                    <div className="learn-course-card__placeholder">
                      <i className="bi bi-journal-text" aria-hidden />
                    </div>
                  )}
                </Link>
                <div className="offering-body">
                  <div className="offering-header">
                    <h4>{c.title}</h4>
                    {c.level ? (
                      <span className="featured-tag">{c.level}</span>
                    ) : null}
                  </div>
                  <p className="small text-muted mb-2">
                    {[c.category, c.language].filter(Boolean).join(" · ")}
                  </p>
                  <p
                    className="text-truncate-3-lines"
                    style={{ minHeight: "4.5rem" }}
                  >
                    {c.short_description ||
                      c.description ||
                      "Open the course for details."}
                  </p>
                  <Link
                    href={`/learn/${c.slug}`}
                    className="explore-btn d-inline-flex"
                  >
                    View course{" "}
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>

        {courses.length === 0 ? (
          <div className="info-box text-center py-5 mt-4">
            <p className="lead mb-2">No published courses yet.</p>
            <p className="text-muted">Check back soon.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
