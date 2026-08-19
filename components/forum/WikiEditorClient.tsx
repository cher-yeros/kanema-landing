"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { UPDATE_WIKI_MUTATION } from "@/lib/forum-graphql";
import { useForumToast } from "@/components/forum/ForumToast";
export function WikiEditorClient({
  slug,
  initialTitle,
  initialBody,
  initialSummary,
}: {
  slug: string;
  initialTitle: string;
  initialBody: string;
  initialSummary?: string | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [body, setBody] = useState(initialBody);
  const [changeNote, setChangeNote] = useState("");
  const [update, { loading }] = useMutation(UPDATE_WIKI_MUTATION);
  const { showApolloError } = useForumToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update({
        variables: {
          input: {
            slug,
            title,
            body_md: body,
            summary,
            change_note: changeNote || "Updated",
          },
        },
      });
      router.push(`/discussion/wiki/${slug}`);
      router.refresh();
    } catch (err) {
      showApolloError(err, "Could not save article.");
    }
  }

  return (
    <div className="form-panel">
      <div className="form-intro">
        <i className="bi bi-pencil-square" />
        <h3>Edit article</h3>
        <p>
          Save a new version with a short change note so others can follow
          updates.
        </p>
      </div>
      <form className="php-email-form" noValidate onSubmit={submit}>
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="wiki-edit-title" className="form-label">
              Title
            </label>
            <input
              id="wiki-edit-title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label htmlFor="wiki-edit-summary" className="form-label">
              Summary
            </label>
            <input
              id="wiki-edit-summary"
              className="form-control"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label htmlFor="wiki-edit-body" className="form-label">
              Body
            </label>
            <textarea
              id="wiki-edit-body"
              className="form-control"
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label htmlFor="wiki-edit-note" className="form-label">
              Change note
            </label>
            <input
              id="wiki-edit-note"
              className="form-control"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="What changed in this version?"
            />
          </div>
        </div>
        <button type="submit" className="dispatch-btn mt-3" disabled={loading}>
          <i className="bi bi-arrow-right-circle-fill" />
          <span>{loading ? "Saving…" : "Save new version"}</span>
        </button>
      </form>
    </div>
  );
}
