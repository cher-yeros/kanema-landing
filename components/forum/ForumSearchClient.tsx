"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { FORUM_SEARCH_QUERY } from "@/lib/forum-graphql";
import { ThreadList } from "@/components/forum/ThreadCard";
import { ForumPageShell } from "@/components/forum/ForumPageShell";

export function ForumSearchClient({
  initialQuery = "",
  initialSort = "",
}: {
  initialQuery?: string;
  initialSort?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort || "relevance");

  const { data, loading } = useQuery(FORUM_SEARCH_QUERY, {
    variables: { query: submitted || " ", sort, limit: 30 },
    skip: !submitted,
  });

  const result = data as {
    forumSearch?: {
      threads: Parameters<typeof ThreadList>[0]["threads"];
      wiki_articles: Array<{ id: string; slug: string; title: string }>;
      threads_total: number;
      wiki_total: number;
    };
  };

  function search(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query);
  }

  return (
    <ForumPageShell
      title="Search forum"
      description="Find threads, tags, gear discussions, and wiki articles."
      backHref="/forum"
      backLabel="Back to forum"
    >
      <div className="form-panel form-panel--compact mb-4">
        <form className="php-email-form" onSubmit={search}>
          <div className="row g-3 align-items-end">
            <div className="col-md-7">
              <label htmlFor="forum-search-query" className="form-label">
                Search
              </label>
              <input
                id="forum-search-query"
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search threads, tags, gear, software…"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="forum-search-sort" className="form-label">
                Sort by
              </label>
              <select
                id="forum-search-sort"
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="unanswered">Unanswered</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-accent w-100">
                <i className="bi bi-search" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? <p className="text-muted">Searching…</p> : null}

      {result?.forumSearch ? (
        <>
          <p className="small text-muted mb-3">
            {result.forumSearch.threads_total} threads ·{" "}
            {result.forumSearch.wiki_total} wiki articles
          </p>
          {result.forumSearch.wiki_articles.length > 0 ? (
            <div className="mb-4">
              <h2 className="h6">Wiki articles</h2>
              <ul className="list-unstyled">
                {result.forumSearch.wiki_articles.map((a) => (
                  <li key={a.id} className="mb-2">
                    <Link href={`/forum/wiki/${a.slug}`}>{a.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <ThreadList threads={result.forumSearch.threads} />
        </>
      ) : submitted ? null : (
        <p className="text-muted">
          Enter a search term to find discussions and wiki articles.
        </p>
      )}
    </ForumPageShell>
  );
}
