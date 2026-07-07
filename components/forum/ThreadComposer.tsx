"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { CREATE_THREAD_MUTATION } from "@/lib/forum-graphql";
import { useForumToast } from "@/components/forum/ForumToast";
import {
  ForumMediaUploadField,
  type ForumMediaAttachment,
} from "@/components/forum/ForumMediaUploadField";

type Category = { id: string; name: string };

type ThreadComposerProps = {
  communityId: string;
  communitySlug: string;
  communityName?: string;
  categories: Category[];
};

export function ThreadComposer({
  communityId,
  communitySlug,
  communityName,
  categories,
}: ThreadComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [media, setMedia] = useState<ForumMediaAttachment[]>([]);
  const [createThread, { loading }] = useMutation(CREATE_THREAD_MUTATION);
  const { showApolloError, showError } = useForumToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showError("Title and body are required.");
      return;
    }
    try {
      const tagSlugs = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const { data } = await createThread({
        variables: {
          input: {
            community_id: communityId,
            category_id: categoryId || undefined,
            title,
            body_md: body,
            tag_slugs: tagSlugs.length ? tagSlugs : undefined,
            media: media.length
              ? media.map((m) => ({
                  kind: m.kind,
                  url: m.url,
                  meta_json: m.meta_json,
                }))
              : undefined,
          },
        },
      });
      const id = (data as { createForumThread: { id: string } })
        .createForumThread.id;
      router.push(`/forum/c/${communitySlug}/t/${id}`);
    } catch (err) {
      showApolloError(err, "Failed to create thread");
    }
  }

  return (
    <div className="form-panel">
      <div className="form-intro">
        <i className="bi bi-chat-square-text" />
        <h3>Start a discussion</h3>
        <p>
          {communityName
            ? `Post in ${communityName}. Markdown is supported in the body.`
            : "Share your question, workflow, or project update with the community."}
        </p>
      </div>

      <form className="php-email-form" noValidate onSubmit={submit}>
        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="thread-title" className="form-label">
              Title
            </label>
            <input
              id="thread-title"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              required
            />
          </div>

          {categories.length > 0 ? (
            <div className="col-12">
              <label htmlFor="thread-category" className="form-label">
                Category
              </label>
              <select
                id="thread-category"
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category (optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="col-12">
            <label htmlFor="thread-body" className="form-label">
              Body
            </label>
            <textarea
              id="thread-body"
              className="form-control"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share details, context, gear specs…"
              required
            />
          </div>

          <ForumMediaUploadField
            value={media}
            onChange={setMedia}
            disabled={loading}
          />

          <div className="col-12">
            <label htmlFor="thread-tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              id="thread-tags"
              type="text"
              className="form-control"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="canon, wedding, premiere-pro"
            />
          </div>
        </div>

        <button type="submit" className="dispatch-btn" disabled={loading}>
          <i className="bi bi-arrow-right-circle-fill" />
          <span>{loading ? "Posting…" : "Post thread"}</span>
        </button>
      </form>
    </div>
  );
}
