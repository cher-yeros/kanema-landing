import Link from "next/link";
import { fetchForumCommunities, fetchTrendingFeed } from "@/lib/forum-public";
import { CommunityGrid } from "@/components/forum/CommunityCard";
import { ThreadList } from "@/components/forum/ThreadCard";
import { ForumHeroActions } from "@/components/forum/ForumHeroActions";

export default async function ForumHomePage() {
  let communities: Awaited<ReturnType<typeof fetchForumCommunities>> = [];
  let trending: Awaited<ReturnType<typeof fetchTrendingFeed>> = [];
  try {
    [communities, trending] = await Promise.all([
      fetchForumCommunities(),
      fetchTrendingFeed("trending", 8),
    ]);
  } catch {
    /* backend may be offline */
  }

  return (
    <>
      <section className="hero section">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="hero-heading">
                <span className="badge-label">Canma Forum</span>
                <h1>Where creatives learn, share, and grow</h1>
                <p className="lead">
                  Join discipline-specific communities, ask gear questions,
                  share workflows, and build reputation through helpful
                  contributions.
                </p>
                <ForumHeroActions />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h4 mb-0">Trending today</h2>
                <Link href="/forum/search?sort=popular" className="small">
                  View all
                </Link>
              </div>
              <ThreadList threads={trending} />
            </div>
            <div className="col-lg-4">
              <h2 className="h5 mb-3">Feed filters</h2>
              <div className="d-flex flex-column gap-2 mb-4">
                {[
                  { sort: "trending", label: "Trending" },
                  { sort: "newest", label: "Latest" },
                  { sort: "popular", label: "Most upvoted" },
                  { sort: "discussed", label: "Most discussed" },
                  { sort: "unanswered", label: "Unanswered" },
                  { sort: "featured", label: "Featured projects" },
                ].map((f) => (
                  <Link
                    key={f.sort}
                    href={`/forum/search?sort=${f.sort}`}
                    className="offering-block p-2 px-3 text-decoration-none small forum-feed-link"
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="forum-communities" className="section light-background">
        <div className="container">
          <h2 className="h4 mb-4">Communities</h2>
          <CommunityGrid communities={communities} />
        </div>
      </section>
    </>
  );
}
