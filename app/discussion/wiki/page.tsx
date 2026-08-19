import Link from "next/link";
import { fetchWikiArticles } from "@/lib/forum-public";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

export default async function WikiIndexPage() {
  let articles: Awaited<ReturnType<typeof fetchWikiArticles>> = {
    articles: [],
    total: 0,
  };
  try {
    articles = await fetchWikiArticles(50);
  } catch {
    /* ignore */
  }

  return (
    <ForumPageShell
      title="Knowledge base"
      description="Community-maintained guides with full version history."
      backHref="/discussion"
      backLabel="Back to discussion"
    >
      <div className="d-flex justify-content-end mb-4">
        <Link href="/discussion/wiki/new" className="btn btn-accent">
          <i className="bi bi-plus-circle" />
          New article
        </Link>
      </div>
      <div className="row g-3">
        {articles.articles.map((a) => (
          <div key={a.id} className="col-md-6">
            <Link
              href={`/discussion/wiki/${a.slug}`}
              className="offering-block p-3 text-decoration-none d-block h-100 forum-community-card"
            >
              <h2 className="h6 mb-1">{a.title}</h2>
              {a.current_version?.summary ? (
                <p className="small text-muted mb-2">
                  {a.current_version.summary}
                </p>
              ) : null}
              <div className="small text-muted">
                {a.community?.name ?? "General"} · {a.view_count} views
              </div>
            </Link>
          </div>
        ))}
      </div>
      {!articles.articles.length ? (
        <p className="text-muted text-center py-5">No wiki articles yet.</p>
      ) : null}
    </ForumPageShell>
  );
}
