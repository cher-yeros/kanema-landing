"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useId, useRef, useState } from "react";
import {
  PortfolioProjectMedia,
  PortfolioProjectThumb,
} from "@/components/community/PortfolioProjectMedia";
import {
  DELETE_PORTFOLIO_MUTATION,
  PORTFOLIO_QUERY,
  UPSERT_PORTFOLIO_MUTATION,
} from "@/lib/forum-graphql";
import { forumMediaUploadUrl } from "@/lib/graphql-env";
import {
  buildPortfolioMediaJson,
  isValidYouTubeUrl,
  parsePortfolioYoutubeUrl,
  type PortfolioWorkType,
} from "@/lib/portfolio-media";
import { toYouTubeThumbnail } from "@/lib/media-embed";

type PortfolioProject = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  media_json: string | null;
  display_order: number;
};

type PortfolioFormState = {
  id?: string;
  workType: PortfolioWorkType;
  title: string;
  description: string;
  cover_url: string;
  youtube_url: string;
};

const emptyForm = (): PortfolioFormState => ({
  workType: "image",
  title: "",
  description: "",
  cover_url: "",
  youtube_url: "",
});

export function PortfolioProjectsEditor() {
  const formId = useId();
  const { data, refetch } = useQuery(PORTFOLIO_QUERY);
  const [upsertProject, { loading: saving }] = useMutation(
    UPSERT_PORTFOLIO_MUTATION,
  );
  const [deleteProject, { loading: deleting }] = useMutation(
    DELETE_PORTFOLIO_MUTATION,
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PortfolioFormState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projects =
    (
      data as {
        myPortfolioProjects?: PortfolioProject[];
      }
    )?.myPortfolioProjects ?? [];

  function startCreate() {
    setError(null);
    setForm(emptyForm());
  }

  function startEdit(project: PortfolioProject) {
    const youtubeUrl = parsePortfolioYoutubeUrl(project.media_json) ?? "";
    setError(null);
    setForm({
      id: project.id,
      workType: youtubeUrl ? "video" : "image",
      title: project.title,
      description: project.description ?? "",
      cover_url: project.cover_url ?? "",
      youtube_url: youtubeUrl,
    });
  }

  function cancelForm() {
    setForm(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onCoverSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !form) return;

    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(forumMediaUploadUrl(), {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not upload image.");
      }
      setForm({ ...form, cover_url: json.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const title = form.title.trim();
    if (!title) {
      setError("Please enter a title.");
      return;
    }

    const youtubeUrl = form.workType === "video" ? form.youtube_url.trim() : "";
    if (form.workType === "video") {
      if (!youtubeUrl) {
        setError("Please enter a YouTube link.");
        return;
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        setError("Please enter a valid YouTube link.");
        return;
      }
    }

    let cover_url = form.cover_url.trim() || null;
    let media_json: string | null = null;

    if (form.workType === "video" && youtubeUrl) {
      media_json = buildPortfolioMediaJson(youtubeUrl);
      cover_url = toYouTubeThumbnail(youtubeUrl);
    }

    setError(null);
    await upsertProject({
      variables: {
        input: {
          id: form.id,
          title,
          description: form.description.trim() || null,
          cover_url,
          media_json,
          display_order: form.id ? undefined : projects.length,
        },
      },
    });
    await refetch();
    cancelForm();
  }

  async function removeProject(id: string) {
    if (!window.confirm("Remove this showcase item?")) return;
    await deleteProject({ variables: { id } });
    await refetch();
    if (form?.id === id) cancelForm();
  }

  const previewProject =
    form && form.workType === "video" && form.youtube_url.trim()
      ? {
          title: form.title || "Preview",
          cover_url: toYouTubeThumbnail(form.youtube_url.trim()),
          media_json: isValidYouTubeUrl(form.youtube_url)
            ? buildPortfolioMediaJson(form.youtube_url)
            : null,
        }
      : form
        ? {
            title: form.title || "Preview",
            cover_url: form.cover_url || null,
            media_json: null,
          }
        : null;

  return (
    <div className="form-panel form-panel--embedded">
      <div className="form-intro">
        <i className="bi bi-images" aria-hidden />
        <h3>Work showcase</h3>
        <p>
          Add photos or YouTube videos with a title and description. Visible on
          your public community profile.
        </p>
      </div>

      {!form ? (
        <button
          type="button"
          className="btn btn-accent mb-4"
          onClick={startCreate}
        >
          <i className="bi bi-plus-circle-fill" aria-hidden />
          Add work
        </button>
      ) : null}

      {form ? (
        <form
          onSubmit={saveProject}
          className="php-email-form portfolio-editor-form mb-4"
        >
          <div className="row g-3">
            <div className="col-12">
              <span className="form-label d-block">Work type</span>
              <div className="portfolio-editor-form__type-toggle">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    form.workType === "image"
                      ? "btn-accent"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setForm({ ...form, workType: "image", youtube_url: "" })
                  }
                >
                  <i className="bi bi-image" aria-hidden /> Photo
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    form.workType === "video"
                      ? "btn-accent"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    setForm({ ...form, workType: "video", cover_url: "" })
                  }
                >
                  <i className="bi bi-youtube" aria-hidden /> YouTube video
                </button>
              </div>
            </div>
            <div className="col-12">
              <label htmlFor={`${formId}-title`} className="form-label">
                Title
              </label>
              <input
                id={`${formId}-title`}
                className="form-control"
                placeholder="Project or shoot name"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor={`${formId}-description`} className="form-label">
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                className="form-control"
                rows={5}
                placeholder="What you created, your role, and what makes this work stand out…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {form.workType === "video" ? (
              <div className="col-12">
                <label htmlFor={`${formId}-youtube`} className="form-label">
                  YouTube link
                </label>
                <input
                  id={`${formId}-youtube`}
                  type="url"
                  className="form-control"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={form.youtube_url}
                  onChange={(e) =>
                    setForm({ ...form, youtube_url: e.target.value })
                  }
                />
                <p className="portfolio-editor-form__hint">
                  Paste a public YouTube or youtu.be link. The thumbnail is used
                  on your profile until visitors play the video.
                </p>
                {previewProject ? (
                  <div className="portfolio-editor-form__upload mt-3">
                    <PortfolioProjectMedia
                      project={previewProject}
                      variant="thumb"
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="col-12">
                <label htmlFor={`${formId}-cover`} className="form-label">
                  Showcase image
                </label>
                <div className="portfolio-editor-form__upload">
                  {form.cover_url ? (
                    <img
                      src={form.cover_url}
                      alt=""
                      className="portfolio-editor-form__preview"
                    />
                  ) : (
                    <div className="portfolio-editor-form__preview portfolio-editor-form__preview--empty">
                      <i className="bi bi-image" aria-hidden />
                    </div>
                  )}
                  <div className="portfolio-editor-form__upload-field">
                    <input
                      ref={fileRef}
                      id={`${formId}-cover`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="form-control"
                      disabled={uploading}
                      onChange={(e) => onCoverSelected(e.target.files)}
                    />
                    <p className="portfolio-editor-form__hint">
                      JPEG, PNG, WebP, or GIF.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error ? (
            <p className="error-message d-block mt-3 mb-0">{error}</p>
          ) : null}

          <div className="d-flex flex-wrap gap-3 mt-2">
            <button
              type="submit"
              className="dispatch-btn"
              disabled={saving || uploading}
            >
              <i className="bi bi-arrow-right-circle-fill" aria-hidden />
              <span>
                {saving || uploading
                  ? "Saving…"
                  : form.id
                    ? "Save changes"
                    : "Publish work"}
              </span>
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelForm}
              disabled={saving || uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {projects.length === 0 ? (
        <p className="small text-muted mb-0">No showcase items yet.</p>
      ) : (
        <div className="row g-3">
          {projects.map((project) => (
            <div key={project.id} className="col-md-6">
              <div className="portfolio-editor-item offering-block p-3 h-100">
                <div className="d-flex gap-3">
                  <PortfolioProjectThumb project={project} />
                  <div className="grow">
                    <strong className="d-block">{project.title}</strong>
                    {project.description ? (
                      <p className="small text-muted mb-2">
                        {project.description}
                      </p>
                    ) : null}
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => startEdit(project)}
                        disabled={deleting}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeProject(project.id)}
                        disabled={deleting}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
