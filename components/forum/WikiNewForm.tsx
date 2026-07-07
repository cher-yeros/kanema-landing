"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_WIKI_MUTATION } from "@/lib/forum-graphql";
import { ForumPageShell } from "@/components/forum/ForumPageShell";
import { useForumToast } from "@/components/forum/ForumToast";
export function WikiNewForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [create, { loading }] = useMutation(CREATE_WIKI_MUTATION);
  const { showApolloError } = useForumToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {      const { data } = await create({
        variables: {
          input: {
            slug,
            title,
            body_md: body,
            summary,
            change_note: "Initial draft",
          },
        },
      });
      const s = (data as { createWikiArticle: { slug: string } })
        .createWikiArticle.slug;
      router.push(`/forum/wiki/${s}`);
    } catch (err) {
      showApolloError(err, "Failed to create article");
    }
  }
  return (
    <ForumPageShell
      title="New wiki article"
      description="Create a community-maintained guide. Markdown is supported in the body."
      backHref="/forum/wiki"
      backLabel="Back to wiki"
      narrow
    >
      <div className="form-panel">
        <div className="form-intro">
          <i className="bi bi-journal-plus" />
          <h3>Draft a new article</h3>
          <p>
            Choose a short URL slug and write a clear summary so others can find
            your guide.
          </p>
        </div>
        <form className="php-email-form" noValidate onSubmit={submit}>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="wiki-slug" className="form-label">
                Slug (URL)
              </label>
              <input
                id="wiki-slug"
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="color-grade-slog"
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="wiki-title" className="form-label">
                Title
              </label>
              <input
                id="wiki-title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="wiki-summary" className="form-label">
                Summary
              </label>
              <input
                id="wiki-summary"
                className="form-control"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label htmlFor="wiki-body" className="form-label">
                Body (Markdown)
              </label>
              <textarea
                id="wiki-body"
                className="form-control"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="dispatch-btn" disabled={loading}>            <i className="bi bi-arrow-right-circle-fill" />
            <span>{loading ? "Creating…" : "Create draft"}</span>
          </button>
        </form>
      </div>
    </ForumPageShell>
  );
}
